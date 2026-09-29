import type { Material } from "@/modules/materiales/domain/material";
import type { Pesos } from "@/shared/dominio/dinero";
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

export type ResumenOperacion = OperacionGuardada & {
  fecha: Date;
  total: Pesos;
  materiales: string[];
};

export interface RepositorioOperaciones {
  guardar(operacion: NuevaOperacion): Promise<OperacionGuardada>;
  /** Verifica el stock y guarda de forma atómica frente a ventas concurrentes. */
  guardarVenta(operacion: NuevaOperacion): Promise<Resultado<OperacionGuardada, StockInsuficiente>>;
  /** Stock por material (solo operaciones activas). Sin filtro, todos los que tienen movimientos. */
  consultarStock(materialIds?: string[]): Promise<Map<string, Gramos>>;
  listarRecientes(tipo: TipoOperacion, limite: number): Promise<ResumenOperacion[]>;
}

export interface CatalogoMateriales {
  obtenerMateriales(ids: string[]): Promise<Material[]>;
}

const RECIENTES_POR_DEFECTO = 10;

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
    case "material_no_disponible":
      return { [`lineas.${error.indice}.materialId`]: "Este material ya no está disponible." };
  }
}

export function crearCasosDeUsoOperaciones(
  repositorio: RepositorioOperaciones,
  catalogo: CatalogoMateriales,
) {
  return {
    listarRecientes: (tipo: TipoOperacion) =>
      repositorio.listarRecientes(tipo, RECIENTES_POR_DEFECTO),

    consultarStock: (materialIds?: string[]) => repositorio.consultarStock(materialIds),

    async registrarCompra(
      entrada: EntradaCompra,
    ): Promise<Resultado<OperacionGuardada, ErroresOperacion>> {
      const validacion = esquemaCompra.safeParse(entrada);
      if (!validacion.success) return fallo(erroresPorRuta(validacion.error));

      const { tarifa, lineas } = validacion.data;
      // El precio se toma del servidor; nunca del navegador.
      const materiales = await catalogo.obtenerMateriales(lineas.map((l) => l.materialId));
      const porId = new Map(materiales.map((m) => [m.id, m]));

      const compra = crearCompra(
        lineas.map((l) => ({ material: porId.get(l.materialId), gramos: l.pesoKg })),
        tarifa,
      );
      if (!compra.ok) return fallo(erroresDeDominio(compra.error));

      return exito(await repositorio.guardar(compra.valor));
    },

    async registrarVenta(
      entrada: EntradaVenta,
    ): Promise<Resultado<OperacionGuardada, ErroresOperacion>> {
      const validacion = esquemaVenta.safeParse(entrada);
      if (!validacion.success) return fallo(erroresPorRuta(validacion.error));

      const { lineas } = validacion.data;
      const materiales = await catalogo.obtenerMateriales(lineas.map((l) => l.materialId));
      const porId = new Map(materiales.map((m) => [m.id, m]));

      const venta = crearVenta(
        lineas.map((l) => ({
          material: porId.get(l.materialId),
          gramos: l.pesoKg,
          precioPorKg: l.precioPorKg,
        })),
      );
      if (!venta.ok) return fallo(erroresDeDominio(venta.error));

      const guardada = await repositorio.guardarVenta(venta.valor);
      return guardada.ok ? guardada : fallo(erroresDeDominio(guardada.error));
    },
  };
}
