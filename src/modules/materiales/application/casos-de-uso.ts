import { z } from "zod";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";
import type { DatosMaterial, Material } from "../domain/material";
import { esquemaMaterial, type CampoMaterial, type EntradaMaterial } from "./validacion";

export interface RepositorioMateriales {
  listar(filtro?: { soloActivos: boolean }): Promise<Material[]>;
  obtener(id: string): Promise<Material | null>;
  obtenerVarios(ids: string[]): Promise<Material[]>;
  crear(datos: DatosMaterial): Promise<Resultado<Material, "nombre_duplicado">>;
  actualizar(
    id: string,
    datos: DatosMaterial,
  ): Promise<Resultado<Material, "nombre_duplicado" | "no_encontrado">>;
  tieneMovimientos(id: string): Promise<boolean>;
  cambiarActivo(id: string, activo: boolean): Promise<Resultado<Material, "no_encontrado">>;
  /** Solo borra materiales sin compras ni ventas; los demás se desactivan. */
  eliminar(id: string): Promise<Resultado<void, "no_encontrado" | "tiene_movimientos">>;
}

export type ErrorGuardarMaterial =
  | { tipo: "validacion"; errores: Partial<Record<CampoMaterial, string>> }
  | { tipo: "nombre_duplicado" }
  | { tipo: "no_encontrado" };

const esId = (id: string) => z.uuid().safeParse(id).success;

export function crearCasosDeUsoMateriales(repositorio: RepositorioMateriales) {
  return {
    listarMateriales: () => repositorio.listar(),
    listarMaterialesActivos: () => repositorio.listar({ soloActivos: true }),

    obtenerMaterial: (id: string) => (esId(id) ? repositorio.obtener(id) : Promise.resolve(null)),

    tieneMovimientos: (id: string) =>
      esId(id) ? repositorio.tieneMovimientos(id) : Promise.resolve(false),

    cambiarActivo: (id: string, activo: boolean) =>
      esId(id)
        ? repositorio.cambiarActivo(id, activo)
        : Promise.resolve(fallo("no_encontrado" as const)),

    eliminarMaterial: (id: string) =>
      esId(id) ? repositorio.eliminar(id) : Promise.resolve(fallo("no_encontrado" as const)),

    obtenerMateriales: (ids: string[]) => repositorio.obtenerVarios([...new Set(ids)]),

    async guardarMaterial(
      id: string | null,
      entrada: EntradaMaterial,
    ): Promise<Resultado<Material, ErrorGuardarMaterial>> {
      const validacion = esquemaMaterial.safeParse(entrada);
      if (!validacion.success) {
        const errores = z.flattenError(validacion.error).fieldErrors;
        return fallo({
          tipo: "validacion",
          errores: Object.fromEntries(
            Object.entries(errores).map(([campo, mensajes]) => [campo, mensajes?.[0]]),
          ),
        });
      }

      if (id !== null && !esId(id)) return fallo({ tipo: "no_encontrado" });

      const resultado =
        id === null
          ? await repositorio.crear(validacion.data)
          : await repositorio.actualizar(id, validacion.data);
      return resultado.ok ? exito(resultado.valor) : fallo({ tipo: resultado.error });
    },
  };
}
