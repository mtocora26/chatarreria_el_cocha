import { asc, eq } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { lineasTransaccion, materiales, transacciones } from "@/server/db/schema";
import { pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { gramosDesdeNumeric } from "@/shared/dominio/peso";
import type { RepositorioRentabilidad } from "../application/casos-de-uso";

export function crearRepositorioRentabilidad(
  obtenerDb: () => BaseDeDatos,
): RepositorioRentabilidad {
  return {
    async listarEventos() {
      const filas = await obtenerDb()
        .select({
          materialId: lineasTransaccion.materialId,
          material: materiales.nombre,
          tipo: transacciones.tipo,
          fecha: transacciones.fecha,
          pesoKg: lineasTransaccion.pesoKg,
          subtotal: lineasTransaccion.subtotal,
        })
        .from(lineasTransaccion)
        .innerJoin(transacciones, eq(transacciones.id, lineasTransaccion.transaccionId))
        .innerJoin(materiales, eq(materiales.id, lineasTransaccion.materialId))
        .where(eq(transacciones.estado, "activa"))
        // El consecutivo desempata operaciones con la misma fecha.
        .orderBy(asc(transacciones.fecha), asc(transacciones.consecutivo));

      return filas.map((fila) => ({
        materialId: fila.materialId,
        material: fila.material,
        tipo: fila.tipo,
        fecha: fila.fecha,
        gramos: gramosDesdeNumeric(fila.pesoKg),
        subtotal: pesosDesdeNumeric(fila.subtotal),
      }));
    },
  };
}
