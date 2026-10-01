import type { Material, Tarifa } from "@/modules/materiales/domain/material";
import { z } from "zod";
import type { Pesos } from "@/shared/dominio/dinero";
import { esDiaValido, inicioDiaNegocio, sumarDias } from "@/shared/dominio/fecha";
import { formatearKg, type Gramos } from "@/shared/dominio/peso";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";
import {
  crearCompra,
  crearVenta,
  type ErrorOperacion,
  type NuevaOperacion,
  type StockInsuficiente,
  type TipoOperacion,
} from "../domain/operacion";
import {
  erroresPorRuta,
  esquemaCompra,
  esquemaVenta,
  type EntradaCompra,
  type EntradaVenta,
  type ErroresOperacion,
} from "./validacion";

export type OperacionGuardada = { id: string; consecutivo: number };

type Referencia = { id: string; consecutivo: number };

export type DetalleOperacion = OperacionGuardada & {
  tipo: TipoOperacion;
  estado: "activa" | "anulada";
  fecha: Date;
  total: Pesos;
  anulacion: { fecha: Date; usuario: string; motivo: string } | null;
  /** Operación anulada que esta reemplaza. */
  corrigeA: Referencia | null;
  /** Operación que reemplazó a esta al corregirla. */
  corregidaPor: Referencia | null;
  lineas: {
    materialId: string;
    material: string;
    gramos: Gramos;
    cantidadPeso: number;
    unidadPeso: "kg" | "lb" | "otra";
    equivalenciaKg: number;
    precioPorKg: Pesos;
    tarifa: Tarifa | null;
    subtotal: Pesos;
  }[];
};

export type ResumenOperacion = OperacionGuardada & {
  tipo: TipoOperacion;
  estado: "activa" | "anulada";
  fecha: Date;
  total: Pesos;
  materiales: string[];
};

export type FiltroHistorial = {
  tipo?: TipoOperacion;
  /** Desde este instante, incluido. */
  desde?: Date;
  /** Hasta este instante, excluido. */
  hasta?: Date;
  materialId?: string;
};

/** Totales del período; las anuladas solo se cuentan aparte. */
export type ResumenPeriodo = {
  compras: { cantidad: number; total: Pesos };
  ventas: { cantidad: number; total: Pesos };
  anuladas: number;
};

export type DatosAnulacion = { usuarioId: string; motivo: string };

export type ErrorAnulacion =
  | { tipo: "no_encontrada" }
  | { tipo: "ya_anulada" }
  | { tipo: "tipo_distinto" }
  | { tipo: "stock_negativo"; material: string };

export interface RepositorioOperaciones {
  guardar(operacion: NuevaOperacion): Promise<OperacionGuardada>;
  /** Verifica el stock y guarda de forma atómica frente a ventas concurrentes. */
  guardarVenta(operacion: NuevaOperacion): Promise<Resultado<OperacionGuardada, StockInsuficiente>>;
  /** Stock por material (solo operaciones activas). Sin filtro, todos los que tienen movimientos. */
  consultarStock(materialIds?: string[]): Promise<Map<string, Gramos>>;
  obtenerDetalle(id: string): Promise<DetalleOperacion | null>;
  /** Más recientes primero; `antesDe` es el consecutivo desde el que continúa la página. */
  listar(filtro: FiltroHistorial, limite: number, antesDe?: number): Promise<ResumenOperacion[]>;
  resumir(filtro: FiltroHistorial): Promise<ResumenPeriodo>;
  /** Anula de forma atómica; rechaza si deja stock negativo o si ya estaba anulada. */
  anular(id: string, datos: DatosAnulacion): Promise<Resultado<void, ErrorAnulacion>>;
  /** Anula `id` y guarda `nueva` en su lugar dentro de la misma transacción. */
  guardarCorreccion(
    id: string,
    nueva: NuevaOperacion,
    datos: DatosAnulacion,
  ): Promise<Resultado<OperacionGuardada, ErrorAnulacion | StockInsuficiente>>;
}

export interface CatalogoMateriales {
  listarMateriales(): Promise<Material[]>;
  obtenerMateriales(ids: string[]): Promise<Material[]>;
}

export type ExistenciaMaterial = Pick<Material, "id" | "nombre" | "activo"> & { stock: Gramos };

/** Lo que llega de la URL del historial, todavía sin validar. */
export type EntradaHistorial = {
  desde?: string;
  hasta?: string;
  tipo?: string;
  materialId?: string;
  antesDe?: string;
};

export type Historial = {
  filtro: { desde?: string; hasta?: string; tipo?: TipoOperacion; materialId?: string };
  operaciones: ResumenOperacion[];
  resumen: ResumenPeriodo;
  /** Consecutivo para pedir la página siguiente; ausente si no hay más. */
  siguiente?: number;
};

/** Corrección de una operación: se anula `operacionId` al guardar la nueva. */
export type Correccion = { operacionId: string; usuarioId: string; motivo: string };

const RECIENTES_POR_DEFECTO = 10;
const POR_PAGINA = 25;
const MOTIVO_MINIMO = 3;
const MOTIVO_MAXIMO = 200;

const esId = (id: string) => z.uuid().safeParse(id).success;

const esquemaMotivo = z
  .string()
  .trim()
  .min(MOTIVO_MINIMO, "Escribe el motivo de la anulación.")
  .max(MOTIVO_MAXIMO, `Máximo ${MOTIVO_MAXIMO} caracteres.`);

/** Ruta de los errores que no pertenecen a un campo concreto. */
export const ERROR_GENERAL = "general";

function erroresDeDominio(error: ErrorOperacion | StockInsuficiente): ErroresOperacion {
  switch (error.tipo) {
    case "stock_insuficiente":
      return {
        [`lineas.${error.indice}.pesoKg`]: `Stock insuficiente: hay ${formatearKg(error.disponible)} disponibles.`,
      };
    case "sin_lineas":
      return { lineas: "Agrega al menos un material." };
    case "peso_invalido":
      return { [`lineas.${error.indice}.pesoKg`]: "Ingresa un peso mayor que cero." };
    case "precio_invalido":
      return { [`lineas.${error.indice}.precioPorKg`]: "Define un precio por kg mayor que cero." };
    case "material_no_disponible":
      return { [`lineas.${error.indice}.materialId`]: "Este material ya no está disponible." };
  }
}

export function mensajeDeAnulacion(error: ErrorAnulacion): string {
  switch (error.tipo) {
    case "no_encontrada":
      return "La operación no existe.";
    case "ya_anulada":
      return "La operación ya estaba anulada.";
    case "tipo_distinto":
      return "La corrección debe ser del mismo tipo que la operación original.";
    case "stock_negativo":
      return `No se puede: el stock de ${error.material} quedaría negativo porque ya se vendió. Anula primero esa venta.`;
  }
}

function errorDeGuardado(error: ErrorAnulacion | StockInsuficiente): ErroresOperacion {
  return error.tipo === "stock_insuficiente"
    ? erroresDeDominio(error)
    : { [ERROR_GENERAL]: mensajeDeAnulacion(error) };
}

function filtroDesdeEntrada(entrada: EntradaHistorial): Historial["filtro"] {
  const tipo = entrada.tipo === "compra" || entrada.tipo === "venta" ? entrada.tipo : undefined;
  return {
    desde: entrada.desde && esDiaValido(entrada.desde) ? entrada.desde : undefined,
    hasta: entrada.hasta && esDiaValido(entrada.hasta) ? entrada.hasta : undefined,
    tipo,
    materialId: entrada.materialId && esId(entrada.materialId) ? entrada.materialId : undefined,
  };
}

export function crearCasosDeUsoOperaciones(
  repositorio: RepositorioOperaciones,
  catalogo: CatalogoMateriales,
) {
  async function prepararCompra(
    entrada: EntradaCompra,
  ): Promise<Resultado<NuevaOperacion, ErroresOperacion>> {
    const validacion = esquemaCompra.safeParse(entrada);
    if (!validacion.success) return fallo(erroresPorRuta(validacion.error));

    const { tarifa, lineas } = validacion.data;
    const materiales = await catalogo.obtenerMateriales(lineas.map((l) => l.materialId));
    const porId = new Map(materiales.map((m) => [m.id, m]));

    const compra = crearCompra(
      lineas.map((l) => ({
        material: porId.get(l.materialId),
        gramos: l.gramos,
        precioPorKg: l.precioPorKg,
        cantidadPeso: l.cantidadPeso,
        unidadPeso: l.unidadPeso,
        equivalenciaKg: l.equivalenciaKg,
      })),
      tarifa,
    );
    return compra.ok ? compra : fallo(erroresDeDominio(compra.error));
  }

  async function prepararVenta(
    entrada: EntradaVenta,
  ): Promise<Resultado<NuevaOperacion, ErroresOperacion>> {
    const validacion = esquemaVenta.safeParse(entrada);
    if (!validacion.success) return fallo(erroresPorRuta(validacion.error));

    const { lineas } = validacion.data;
    const materiales = await catalogo.obtenerMateriales(lineas.map((l) => l.materialId));
    const porId = new Map(materiales.map((m) => [m.id, m]));

    const venta = crearVenta(
      lineas.map((l) => ({
        material: porId.get(l.materialId),
        gramos: l.gramos,
        precioPorKg: l.precioPorKg,
        cantidadPeso: l.cantidadPeso,
        unidadPeso: l.unidadPeso,
        equivalenciaKg: l.equivalenciaKg,
      })),
    );
    return venta.ok ? venta : fallo(erroresDeDominio(venta.error));
  }

  /** Valida la corrección antes de tocar la base; devuelve el motivo limpio. */
  function validarCorreccion(correccion: Correccion): Resultado<string, ErroresOperacion> {
    if (!esId(correccion.operacionId)) {
      return fallo({ [ERROR_GENERAL]: mensajeDeAnulacion({ tipo: "no_encontrada" }) });
    }
    const motivo = esquemaMotivo.safeParse(correccion.motivo);
    return motivo.success ? exito(motivo.data) : fallo({ motivo: motivo.error.issues[0].message });
  }

  async function guardarCorreccion(
    nueva: Resultado<NuevaOperacion, ErroresOperacion>,
    correccion: Correccion,
  ): Promise<Resultado<OperacionGuardada, ErroresOperacion>> {
    const motivo = validarCorreccion(correccion);
    if (!nueva.ok || !motivo.ok) {
      return fallo({ ...(nueva.ok ? {} : nueva.error), ...(motivo.ok ? {} : motivo.error) });
    }
    const guardada = await repositorio.guardarCorreccion(correccion.operacionId, nueva.valor, {
      usuarioId: correccion.usuarioId,
      motivo: motivo.valor,
    });
    return guardada.ok ? guardada : fallo(errorDeGuardado(guardada.error));
  }

  return {
    listarRecientes: (tipo: TipoOperacion) => repositorio.listar({ tipo }, RECIENTES_POR_DEFECTO),

    consultarStock: (materialIds?: string[]) => repositorio.consultarStock(materialIds),

    obtenerDetalle: (id: string) =>
      esId(id) ? repositorio.obtenerDetalle(id) : Promise.resolve(null),

    /** Todos los materiales con su stock; los que no tienen movimientos quedan en cero. */
    async consultarInventario(): Promise<ExistenciaMaterial[]> {
      const [materiales, stock] = await Promise.all([
        catalogo.listarMateriales(),
        repositorio.consultarStock(),
      ]);
      return materiales.map(({ id, nombre, activo }) => ({
        id,
        nombre,
        activo,
        stock: stock.get(id) ?? 0,
      }));
    },

    /** Filtros inválidos se ignoran en lugar de fallar: vienen de la URL. */
    async consultarHistorial(entrada: EntradaHistorial): Promise<Historial> {
      const filtro = filtroDesdeEntrada(entrada);
      const consulta: FiltroHistorial = {
        tipo: filtro.tipo,
        materialId: filtro.materialId,
        desde: filtro.desde ? inicioDiaNegocio(filtro.desde) : undefined,
        hasta: filtro.hasta ? inicioDiaNegocio(sumarDias(filtro.hasta, 1)) : undefined,
      };
      const antesDe = Number(entrada.antesDe);
      // Se pide uno de más para saber si existe una página siguiente.
      const [filas, resumen] = await Promise.all([
        repositorio.listar(
          consulta,
          POR_PAGINA + 1,
          Number.isInteger(antesDe) && antesDe > 0 ? antesDe : undefined,
        ),
        repositorio.resumir(consulta),
      ]);
      const operaciones = filas.slice(0, POR_PAGINA);
      return {
        filtro,
        operaciones,
        resumen,
        siguiente: filas.length > POR_PAGINA ? operaciones.at(-1)?.consecutivo : undefined,
      };
    },

    async anular(id: string, datos: DatosAnulacion): Promise<Resultado<void, ErroresOperacion>> {
      if (!esId(id))
        return fallo({ [ERROR_GENERAL]: mensajeDeAnulacion({ tipo: "no_encontrada" }) });
      const motivo = esquemaMotivo.safeParse(datos.motivo);
      if (!motivo.success) return fallo({ motivo: motivo.error.issues[0].message });

      const resultado = await repositorio.anular(id, { ...datos, motivo: motivo.data });
      return resultado.ok
        ? resultado
        : fallo({ [ERROR_GENERAL]: mensajeDeAnulacion(resultado.error) });
    },

    async registrarCompra(
      entrada: EntradaCompra,
      correccion?: Correccion,
    ): Promise<Resultado<OperacionGuardada, ErroresOperacion>> {
      const compra = await prepararCompra(entrada);
      if (correccion) return guardarCorreccion(compra, correccion);
      return compra.ok ? exito(await repositorio.guardar(compra.valor)) : compra;
    },

    async registrarVenta(
      entrada: EntradaVenta,
      correccion?: Correccion,
    ): Promise<Resultado<OperacionGuardada, ErroresOperacion>> {
      const venta = await prepararVenta(entrada);
      if (correccion) return guardarCorreccion(venta, correccion);
      if (!venta.ok) return venta;

      const guardada = await repositorio.guardarVenta(venta.valor);
      return guardada.ok ? guardada : fallo(erroresDeDominio(guardada.error));
    },
  };
}
