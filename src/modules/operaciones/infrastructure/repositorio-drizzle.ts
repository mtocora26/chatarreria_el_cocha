import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { lineasTransaccion, materiales, transacciones } from "@/server/db/schema";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { gramosANumeric, gramosDesdeNumeric } from "@/shared/dominio/peso";
import { exito } from "@/shared/dominio/resultado";
import type { RepositorioOperaciones } from "../application/casos-de-uso";
import { verificarStock, type NuevaOperacion } from "../domain/operacion";

type Ejecutor = Pick<BaseDeDatos, "select" | "insert">;

// Las compras suman y las ventas restan; las anuladas no cuentan.
const pesoConSigno = sql<string>`sum(case when ${transacciones.tipo} = 'compra' then ${lineasTransaccion.pesoKg} else -${lineasTransaccion.pesoKg} end)`;

async function consultarStock(ejecutor: Ejecutor, materialIds?: string[]) {
  const filas = await ejecutor
    .select({ materialId: lineasTransaccion.materialId, pesoKg: pesoConSigno })
    .from(lineasTransaccion)
    .innerJoin(transacciones, eq(transacciones.id, lineasTransaccion.transaccionId))
    .where(
      and(
        eq(transacciones.estado, "activa"),
        materialIds ? inArray(lineasTransaccion.materialId, materialIds) : undefined,
      ),
    )
    .groupBy(lineasTransaccion.materialId);
  return new Map(filas.map((f) => [f.materialId, gramosDesdeNumeric(f.pesoKg)]));
}

async function insertar(ejecutor: Ejecutor, operacion: NuevaOperacion) {
  const [guardada] = await ejecutor
    .insert(transacciones)
    .values({ tipo: operacion.tipo, total: pesosANumeric(operacion.total) })
    .returning({ id: transacciones.id, consecutivo: transacciones.consecutivo });

  await ejecutor.insert(lineasTransaccion).values(
    operacion.lineas.map((linea) => ({
      transaccionId: guardada.id,
      materialId: linea.materialId,
      pesoKg: gramosANumeric(linea.gramos),
      cantidadPeso: linea.cantidadPeso.toFixed(3),
      unidadPeso: linea.unidadPeso,
      equivalenciaKg: linea.equivalenciaKg.toFixed(6),
      precioUnitario: pesosANumeric(linea.precioPorKg),
      tarifa: linea.tarifa,
      subtotal: pesosANumeric(linea.subtotal),
    })),
  );
  return guardada;
}

export function crearRepositorioOperaciones(obtenerDb: () => BaseDeDatos): RepositorioOperaciones {
  return {
    // Encabezado y líneas en una transacción: si algo falla no queda una operación parcial.
    guardar: (operacion) => obtenerDb().transaction((tx) => insertar(tx, operacion)),

    guardarVenta: (operacion) =>
      obtenerDb().transaction(async (tx) => {
        // Bloquea los materiales vendidos hasta el commit: otra venta concurrente del mismo
        // material espera aquí y luego ve el stock ya descontado. Orden fijo para evitar
        // interbloqueos. Cualquier operación futura que reduzca stock (p. ej. anular una
        // compra) debe tomar el mismo bloqueo.
        const ids = [...new Set(operacion.lineas.map((l) => l.materialId))];
        await tx
          .select({ id: materiales.id })
          .from(materiales)
          .where(inArray(materiales.id, ids))
          .orderBy(asc(materiales.id))
          .for("update");

        const stock = await consultarStock(tx, ids);
        const verificacion = verificarStock(operacion.lineas, stock);
        if (!verificacion.ok) return verificacion;

        return exito(await insertar(tx, operacion));
      }),

    consultarStock: (materialIds) => consultarStock(obtenerDb(), materialIds),

    async obtenerDetalle(id) {
      const db = obtenerDb();
      const [encabezado] = await db.select().from(transacciones).where(eq(transacciones.id, id));
      if (!encabezado) return null;

      const lineas = await db
        .select({
          material: materiales.nombre,
          pesoKg: lineasTransaccion.pesoKg,
          cantidadPeso: lineasTransaccion.cantidadPeso,
          unidadPeso: lineasTransaccion.unidadPeso,
          equivalenciaKg: lineasTransaccion.equivalenciaKg,
          precioUnitario: lineasTransaccion.precioUnitario,
          tarifa: lineasTransaccion.tarifa,
          subtotal: lineasTransaccion.subtotal,
        })
        .from(lineasTransaccion)
        .innerJoin(materiales, eq(materiales.id, lineasTransaccion.materialId))
        .where(eq(lineasTransaccion.transaccionId, id))
        .orderBy(asc(materiales.nombre), asc(lineasTransaccion.pesoKg));

      return {
        id: encabezado.id,
        consecutivo: encabezado.consecutivo,
        tipo: encabezado.tipo,
        estado: encabezado.estado,
        fecha: encabezado.fecha,
        total: pesosDesdeNumeric(encabezado.total),
        lineas: lineas.map((l) => ({
          material: l.material,
          gramos: gramosDesdeNumeric(l.pesoKg),
          cantidadPeso: Number(l.cantidadPeso),
          unidadPeso: l.unidadPeso as "kg" | "lb" | "otra",
          equivalenciaKg: Number(l.equivalenciaKg),
          precioPorKg: pesosDesdeNumeric(l.precioUnitario),
          tarifa: l.tarifa,
          subtotal: pesosDesdeNumeric(l.subtotal),
        })),
      };
    },

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
