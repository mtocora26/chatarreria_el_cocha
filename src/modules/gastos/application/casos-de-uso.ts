import { z } from "zod";
import { esDiaValido, inicioDiaNegocio, sumarDias } from "@/shared/dominio/fecha";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";
import type {
  CategoriaGasto,
  DatosGasto,
  FiltroGastos,
  Gasto,
  ResumenGastos,
} from "../domain/gasto";
import {
  esquemaCategoria,
  esquemaGasto,
  esquemaMotivo,
  type CampoGasto,
  type EntradaGasto,
} from "./validacion";

export type DatosAnulacionGasto = { usuarioId: string; motivo: string };

export interface RepositorioGastos {
  /** Más recientes primero. */
  listar(filtro: FiltroGastos, limite: number): Promise<Gasto[]>;
  resumir(filtro: FiltroGastos): Promise<ResumenGastos>;
  categoriaActiva(id: string): Promise<boolean>;
  crear(datos: DatosGasto, usuarioId: string): Promise<{ id: string }>;
  /** Anula solo si sigue activo; devuelve false si no existe o ya estaba anulado. */
  anular(id: string, datos: DatosAnulacionGasto): Promise<"anulado" | "ya_anulado" | "no_existe">;
  listarCategorias(filtro?: { soloActivas: boolean }): Promise<CategoriaGasto[]>;
  crearCategoria(nombre: string): Promise<Resultado<CategoriaGasto, "nombre_duplicado">>;
  cambiarActivoCategoria(id: string, activo: boolean): Promise<boolean>;
}

/** Lo que llega de la URL, todavía sin validar. */
export type EntradaFiltroGastos = { desde?: string; hasta?: string; categoriaId?: string };

export type ErroresGasto = Partial<Record<CampoGasto | "general", string>>;

const LIMITE_LISTA = 200;
const esId = (id: string) => z.uuid().safeParse(id).success;

function filtroDesdeEntrada(entrada: EntradaFiltroGastos) {
  return {
    desde: entrada.desde && esDiaValido(entrada.desde) ? entrada.desde : undefined,
    hasta: entrada.hasta && esDiaValido(entrada.hasta) ? entrada.hasta : undefined,
    categoriaId: entrada.categoriaId && esId(entrada.categoriaId) ? entrada.categoriaId : undefined,
  };
}

export function crearCasosDeUsoGastos(repositorio: RepositorioGastos) {
  const aConsulta = (filtro: ReturnType<typeof filtroDesdeEntrada>): FiltroGastos => ({
    categoriaId: filtro.categoriaId,
    desde: filtro.desde ? inicioDiaNegocio(filtro.desde) : undefined,
    hasta: filtro.hasta ? inicioDiaNegocio(sumarDias(filtro.hasta, 1)) : undefined,
  });

  return {
    listarCategorias: () => repositorio.listarCategorias(),
    listarCategoriasActivas: () => repositorio.listarCategorias({ soloActivas: true }),

    /** Filtros inválidos se ignoran en lugar de fallar: vienen de la URL. */
    async consultarGastos(entrada: EntradaFiltroGastos) {
      const filtro = filtroDesdeEntrada(entrada);
      const consulta = aConsulta(filtro);
      const [gastos, resumen] = await Promise.all([
        repositorio.listar(consulta, LIMITE_LISTA + 1),
        repositorio.resumir(consulta),
      ]);
      return {
        filtro,
        gastos: gastos.slice(0, LIMITE_LISTA),
        hayMas: gastos.length > LIMITE_LISTA,
        resumen,
      };
    },

    async registrarGasto(
      entrada: EntradaGasto,
      usuarioId: string,
    ): Promise<Resultado<{ id: string }, ErroresGasto>> {
      const validacion = esquemaGasto.safeParse(entrada);
      if (!validacion.success) {
        const errores = z.flattenError(validacion.error).fieldErrors;
        return fallo(
          Object.fromEntries(Object.entries(errores).map(([campo, m]) => [campo, m?.[0]])),
        );
      }
      const { fecha, ...resto } = validacion.data;
      if (!(await repositorio.categoriaActiva(resto.categoriaId))) {
        return fallo({ categoriaId: "Esta categoría ya no está disponible." });
      }
      // Mediodía: el gasto queda en el día elegido sin importar la zona horaria del servidor.
      const instante = new Date(inicioDiaNegocio(fecha).getTime() + 12 * 3_600_000);
      return exito(await repositorio.crear({ ...resto, fecha: instante }, usuarioId));
    },

    async anularGasto(
      id: string,
      datos: DatosAnulacionGasto,
    ): Promise<Resultado<void, ErroresGasto>> {
      if (!esId(id)) return fallo({ general: "El gasto no existe." });
      const motivo = esquemaMotivo.safeParse(datos.motivo);
      if (!motivo.success) return fallo({ general: motivo.error.issues[0].message });

      const resultado = await repositorio.anular(id, { ...datos, motivo: motivo.data });
      if (resultado === "anulado") return exito(undefined);
      return fallo({
        general: resultado === "ya_anulado" ? "El gasto ya estaba anulado." : "El gasto no existe.",
      });
    },

    async crearCategoria(nombre: string): Promise<Resultado<CategoriaGasto, string>> {
      const validacion = esquemaCategoria.safeParse({ nombre });
      if (!validacion.success) return fallo(validacion.error.issues[0].message);
      const creada = await repositorio.crearCategoria(validacion.data.nombre);
      return creada.ok ? creada : fallo("Ya existe una categoría con ese nombre.");
    },

    async cambiarActivoCategoria(id: string, activo: boolean): Promise<boolean> {
      return esId(id) && (await repositorio.cambiarActivoCategoria(id, activo));
    },
  };
}
