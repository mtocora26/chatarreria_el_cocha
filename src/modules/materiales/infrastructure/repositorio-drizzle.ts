import { asc, eq, inArray } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { esViolacionUnica } from "@/server/db/errores";
import { materiales } from "@/server/db/schema";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { exito, fallo } from "@/shared/dominio/resultado";
import type { RepositorioMateriales } from "../application/casos-de-uso";
import type { DatosMaterial, Material } from "../domain/material";

type FilaMaterial = typeof materiales.$inferSelect;

function aMaterial(fila: FilaMaterial): Material {
  return {
    id: fila.id,
    nombre: fila.nombre,
    precioCompraMinorista: pesosDesdeNumeric(fila.precioCompraMinorista),
    precioCompraMayorista: pesosDesdeNumeric(fila.precioCompraMayorista),
    precioVenta: pesosDesdeNumeric(fila.precioVenta),
    activo: fila.activo,
  };
}

function aFila(datos: DatosMaterial) {
  return {
    nombre: datos.nombre,
    precioCompraMinorista: pesosANumeric(datos.precioCompraMinorista),
    precioCompraMayorista: pesosANumeric(datos.precioCompraMayorista),
    precioVenta: pesosANumeric(datos.precioVenta),
    activo: datos.activo,
  };
}

export function crearRepositorioMateriales(obtenerDb: () => BaseDeDatos): RepositorioMateriales {
  return {
    async listar(filtro) {
      const filas = await obtenerDb()
        .select()
        .from(materiales)
        .where(filtro?.soloActivos ? eq(materiales.activo, true) : undefined)
        .orderBy(asc(materiales.nombre));
      return filas.map(aMaterial);
    },

    async obtener(id) {
      const [fila] = await obtenerDb().select().from(materiales).where(eq(materiales.id, id));
      return fila ? aMaterial(fila) : null;
    },

    async obtenerVarios(ids) {
      if (ids.length === 0) return [];
      const filas = await obtenerDb().select().from(materiales).where(inArray(materiales.id, ids));
      return filas.map(aMaterial);
    },

    async crear(datos) {
      try {
        const [fila] = await obtenerDb().insert(materiales).values(aFila(datos)).returning();
        return exito(aMaterial(fila));
      } catch (error) {
        if (esViolacionUnica(error)) return fallo("nombre_duplicado");
        throw error;
      }
    },

    async actualizar(id, datos) {
      try {
        const [fila] = await obtenerDb()
          .update(materiales)
          .set(aFila(datos))
          .where(eq(materiales.id, id))
          .returning();
        return fila ? exito(aMaterial(fila)) : fallo("no_encontrado");
      } catch (error) {
        if (esViolacionUnica(error)) return fallo("nombre_duplicado");
        throw error;
      }
    },
  };
}
