import { z } from "zod";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";
import type { DatosTercero, Tercero, TipoTercero } from "../domain/tercero";
import { esquemaTercero, type CampoTercero, type EntradaTercero } from "./validacion";

export type FiltroTerceros = {
  /** Texto a buscar en nombre, documento o teléfono. */
  busqueda?: string;
  tipo?: TipoTercero;
};

export interface RepositorioTerceros {
  listar(filtro: FiltroTerceros): Promise<Tercero[]>;
  obtener(id: string): Promise<Tercero | null>;
  crear(datos: DatosTercero): Promise<Tercero>;
  actualizar(id: string, datos: DatosTercero): Promise<Tercero | null>;
}

export type ErrorGuardarTercero =
  | { tipo: "validacion"; errores: Partial<Record<CampoTercero, string>> }
  | { tipo: "no_encontrado" };

const esId = (id: string) => z.uuid().safeParse(id).success;
const esTipo = (tipo: string | undefined): tipo is TipoTercero =>
  tipo === "cliente" || tipo === "proveedor" || tipo === "ambos";

export function crearCasosDeUsoTerceros(repositorio: RepositorioTerceros) {
  return {
    /** Filtros inválidos se ignoran: vienen de la URL. */
    listarTerceros: (filtro: { busqueda?: string; tipo?: string } = {}) =>
      repositorio.listar({
        busqueda: filtro.busqueda?.trim() || undefined,
        tipo: esTipo(filtro.tipo) ? filtro.tipo : undefined,
      }),

    obtenerTercero: (id: string) => (esId(id) ? repositorio.obtener(id) : Promise.resolve(null)),

    async guardarTercero(
      id: string | null,
      entrada: EntradaTercero,
    ): Promise<Resultado<Tercero, ErrorGuardarTercero>> {
      const validacion = esquemaTercero.safeParse(entrada);
      if (!validacion.success) {
        const errores = z.flattenError(validacion.error).fieldErrors;
        return fallo({
          tipo: "validacion",
          errores: Object.fromEntries(
            Object.entries(errores).map(([campo, mensajes]) => [campo, mensajes?.[0]]),
          ),
        });
      }
      if (id === null) return exito(await repositorio.crear(validacion.data));
      if (!esId(id)) return fallo({ tipo: "no_encontrado" });

      const actualizado = await repositorio.actualizar(id, validacion.data);
      return actualizado ? exito(actualizado) : fallo({ tipo: "no_encontrado" });
    },
  };
}
