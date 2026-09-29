import { asc, desc, eq, inArray } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { lineasTransaccion, materiales, transacciones } from "@/server/db/schema";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { gramosANumeric } from "@/shared/dominio/peso";
import type { RepositorioOperaciones } from "../application/casos-de-uso";

export function crearRepositorioOperaciones(obtenerDb: () => BaseDeDatos): RepositorioOperaciones {
  return {
    // Encabezado y líneas en una transacción: si algo falla no queda una operación parcial.
    guardar: (operacion) =>
      obtenerDb().transaction(async (tx) => {
        const [guardada] = await tx
          .insert(transacciones)
          .values({ tipo: operacion.tipo, total: pesosANumeric(operacion.total) })
          .returning({ id: transacciones.id, consecutivo: transacciones.consecutivo });

        await tx.insert(lineasTransaccion).values(
          operacion.lineas.map((linea) => ({
            transaccionId: guardada.id,
            materialId: linea.materialId,
            pesoKg: gramosANumeric(linea.gramos),
            precioUnitario: pesosANumeric(linea.precioPorKg),
            tarifa: linea.tarifa,
            subtotal: pesosANumeric(linea.subtotal),
          })),
        );
        return guardada;
      }),

    async listarRecientes(tipo, limite) {
      const db = obtenerDb();
      const encabezados = await db
        .select({
          id: transacciones.id,
          consecutivo: transacciones.consecutivo,
          fecha: transacciones.fecha,
          total: transacciones.total,
        })
        .from(transacciones)
        .where(eq(transacciones.tipo, tipo))
        .orderBy(desc(transacciones.consecutivo))
        .limit(limite);
      if (encabezados.length === 0) return [];

      const lineas = await db
        .select({ transaccionId: lineasTransaccion.transaccionId, nombre: materiales.nombre })
        .from(lineasTransaccion)
        .innerJoin(materiales, eq(materiales.id, lineasTransaccion.materialId))
        .where(
          inArray(
            lineasTransaccion.transaccionId,
            encabezados.map((e) => e.id),
          ),
        )
        .orderBy(asc(materiales.nombre));

      return encabezados.map((encabezado) => ({
        ...encabezado,
        total: pesosDesdeNumeric(encabezado.total),
        materiales: [
          ...new Set(lineas.filter((l) => l.transaccionId === encabezado.id).map((l) => l.nombre)),
        ],
      }));
    },
  };
}
