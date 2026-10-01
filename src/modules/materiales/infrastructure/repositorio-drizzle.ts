import { asc, eq, inArray } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { esViolacionLlaveForanea, esViolacionUnica } from "@/server/db/errores";
import { lineasTransaccion, materiales } from "@/server/db/schema";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { exito, fallo } from "@/shared/dominio/resultado";
import type { RepositorioMateriales } from "../application/casos-de-uso";
import type { DatosMaterial, Material } from "../domain/material";

type FilaMaterial = typeof materiales.$inferSelect;

function aMaterial(fila: FilaMaterial): Material {
  return {
    id: fila.id,
    nombre: fila.nombre,
    precioCompraMinorista:
      fila.precioCompraMinorista === null ? null : pesosDesdeNumeric(fila.precioCompraMinorista),
    precioCompraMayorista:
      fila.precioCompraMayorista === null ? null : pesosDesdeNumeric(fila.precioCompraMayorista),
    precioVenta: fila.precioVenta === null ? null : pesosDesdeNumeric(fila.precioVenta),
    activo: fila.activo,
  };
}

function aFila(datos: DatosMaterial) {
  return {
    nombre: datos.nombre,
    precioCompraMinorista:
      datos.precioCompraMinorista === null ? null : pesosANumeric(datos.precioCompraMinorista),
    precioCompraMayorista:
      datos.precioCompraMayorista === null ? null : pesosANumeric(datos.precioCompraMayorista),
    precioVenta: datos.precioVenta === null ? null : pesosANumeric(datos.precioVenta),
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

    async tieneMovimientos(id) {
      const [linea] = await obtenerDb()
        .select({ id: lineasTransaccion.id })
        .from(lineasTransaccion)
        .where(eq(lineasTransaccion.materialId, id))
        .limit(1);
      return linea !== undefined;
    },

    async cambiarActivo(id, activo) {
      const [fila] = await obtenerDb()
        .update(materiales)
        .set({ activo })
        .where(eq(materiales.id, id))
        .returning();
      return fila ? exito(aMaterial(fila)) : fallo("no_encontrado");
    },

    async eliminar(id) {
      try {
        const [fila] = await obtenerDb()
          .delete(materiales)
          .where(eq(materiales.id, id))
          .returning({ id: materiales.id });
        return fila ? exito(undefined) : fallo("no_encontrado");
      } catch (error) {
        // La llave foránea con restrict es la verificación definitiva: cubre también
        // una compra registrada entre la consulta de movimientos y el borrado.
        if (esViolacionLlaveForanea(error)) return fallo("tiene_movimientos");
        throw error;
      }
    },
  };
}
