import { and, asc, desc, eq, exists, gte, inArray, lt, sql, type SQL } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { authUser, lineasTransaccion, materiales, transacciones } from "@/server/db/schema";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { gramosANumeric, gramosDesdeNumeric } from "@/shared/dominio/peso";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";
import type {
  DatosAnulacion,
  ErrorAnulacion,
  FiltroHistorial,
  RepositorioOperaciones,
} from "../application/casos-de-uso";
import { verificarStock, type NuevaOperacion, type StockInsuficiente } from "../domain/operacion";

type Ejecutor = Pick<BaseDeDatos, "select" | "selectDistinct" | "insert" | "update">;

// Las compras suman y las ventas restan; las anuladas no cuentan.
const pesoConSigno = sql<string>`sum(case when ${transacciones.tipo} = 'compra' then ${lineasTransaccion.pesoKg} else -${lineasTransaccion.pesoKg} end)`;

/** Un resultado fallido dentro de la transacción la revierte y se devuelve tal cual. */
class Reversion<E> extends Error {
  constructor(readonly error: E) {
    super("Transacción revertida");
  }
}

async function enTransaccion<T, E>(
  db: BaseDeDatos,
  trabajo: (tx: Ejecutor) => Promise<Resultado<T, E>>,
): Promise<Resultado<T, E>> {
  try {
    return await db.transaction(async (tx) => {
      const resultado = await trabajo(tx);
      if (!resultado.ok) throw new Reversion(resultado.error);
      return resultado;
    });
  } catch (error) {
    if (error instanceof Reversion) return fallo(error.error as E);
    throw error;
  }
}

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

/**
 * Bloquea los materiales hasta el commit: otra operación concurrente sobre el mismo
 * material espera aquí y luego ve el stock actualizado. Orden fijo para evitar
 * interbloqueos. Toda operación que reduzca stock debe pasar por aquí.
 */
async function bloquearMateriales(ejecutor: Ejecutor, ids: string[]) {
  if (ids.length === 0) return;
  await ejecutor
    .select({ id: materiales.id })
    .from(materiales)
    .where(inArray(materiales.id, ids))
    .orderBy(asc(materiales.id))
    .for("update");
}

async function materialesDe(ejecutor: Ejecutor, transaccionId: string) {
  const filas = await ejecutor
    .selectDistinct({ materialId: lineasTransaccion.materialId })
    .from(lineasTransaccion)
    .where(eq(lineasTransaccion.transaccionId, transaccionId));
  return filas.map((f) => f.materialId);
}

/** Primer material cuyo stock quedó negativo, por nombre; null si todos están bien. */
async function materialConStockNegativo(ejecutor: Ejecutor, ids: string[]) {
  const stock = await consultarStock(ejecutor, ids);
  const negativos = ids.filter((id) => (stock.get(id) ?? 0) < 0);
  if (negativos.length === 0) return null;
  const [material] = await ejecutor
    .select({ nombre: materiales.nombre })
    .from(materiales)
    .where(inArray(materiales.id, negativos))
    .orderBy(asc(materiales.nombre))
    .limit(1);
  return material.nombre;
}

/**
 * Marca la operación como anulada solo si sigue activa: dos anulaciones simultáneas
 * no pueden aplicar el ajuste dos veces.
 */
async function marcarAnulada(
  ejecutor: Ejecutor,
  id: string,
  datos: DatosAnulacion,
): Promise<Resultado<"compra" | "venta", ErrorAnulacion>> {
  const [anulada] = await ejecutor
    .update(transacciones)
    .set({
      estado: "anulada",
      anuladaEn: new Date(),
      anuladaPor: datos.usuarioId,
      motivoAnulacion: datos.motivo,
    })
    .where(and(eq(transacciones.id, id), eq(transacciones.estado, "activa")))
    .returning({ tipo: transacciones.tipo });
  if (anulada) return exito(anulada.tipo);

  const [existente] = await ejecutor
    .select({ id: transacciones.id })
    .from(transacciones)
    .where(eq(transacciones.id, id));
  return fallo({ tipo: existente ? "ya_anulada" : "no_encontrada" });
}

async function insertar(ejecutor: Ejecutor, operacion: NuevaOperacion, corrigeA?: string) {
  const [guardada] = await ejecutor
    .insert(transacciones)
    .values({ tipo: operacion.tipo, total: pesosANumeric(operacion.total), corrigeA })
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

function condicionesHistorial(filtro: FiltroHistorial, ejecutor: Ejecutor) {
  return [
    filtro.tipo ? eq(transacciones.tipo, filtro.tipo) : undefined,
    filtro.desde ? gte(transacciones.fecha, filtro.desde) : undefined,
    filtro.hasta ? lt(transacciones.fecha, filtro.hasta) : undefined,
    filtro.materialId
      ? exists(
          ejecutor
            .select({ uno: sql`1` })
            .from(lineasTransaccion)
            .where(
              and(
                eq(lineasTransaccion.transaccionId, transacciones.id),
                eq(lineasTransaccion.materialId, filtro.materialId),
              ),
            ),
        )
      : undefined,
  ];
}

export function crearRepositorioOperaciones(obtenerDb: () => BaseDeDatos): RepositorioOperaciones {
  return {
    // Encabezado y líneas en una transacción: si algo falla no queda una operación parcial.
    guardar: (operacion) => obtenerDb().transaction((tx) => insertar(tx, operacion)),

    guardarVenta: (operacion) =>
      obtenerDb().transaction(async (tx) => {
        const ids = [...new Set(operacion.lineas.map((l) => l.materialId))];
        await bloquearMateriales(tx, ids);

        const stock = await consultarStock(tx, ids);
        const verificacion = verificarStock(operacion.lineas, stock);
        if (!verificacion.ok) return verificacion;

        return exito(await insertar(tx, operacion));
      }),

    anular: (id, datos) =>
      enTransaccion<void, ErrorAnulacion>(obtenerDb(), async (tx) => {
        const ids = await materialesDe(tx, id);
        await bloquearMateriales(tx, ids);

        const anulada = await marcarAnulada(tx, id, datos);
        if (!anulada.ok) return anulada;

        // Anular una venta devuelve stock; anular una compra lo quita y puede dejarlo negativo.
        if (anulada.valor === "compra") {
          const material = await materialConStockNegativo(tx, ids);
          if (material) return fallo({ tipo: "stock_negativo", material });
        }
        return exito(undefined);
      }),

    guardarCorreccion: (id, nueva, datos) =>
      enTransaccion<{ id: string; consecutivo: number }, ErrorAnulacion | StockInsuficiente>(
        obtenerDb(),
        async (tx) => {
          const nuevosIds = nueva.lineas.map((l) => l.materialId);
          const ids = [...new Set([...(await materialesDe(tx, id)), ...nuevosIds])];
          await bloquearMateriales(tx, ids);

          const anulada = await marcarAnulada(tx, id, datos);
          if (!anulada.ok) return anulada;
          if (anulada.valor !== nueva.tipo) return fallo({ tipo: "tipo_distinto" });

          // El stock ya excluye la operación anulada: la venta corregida puede usar lo que
          // devolvió la original.
          if (nueva.tipo === "venta") {
            const verificacion = verificarStock(nueva.lineas, await consultarStock(tx, nuevosIds));
            if (!verificacion.ok) return verificacion;
          }

          const guardada = await insertar(tx, nueva, id);

          if (nueva.tipo === "compra") {
            const material = await materialConStockNegativo(tx, ids);
            if (material) return fallo({ tipo: "stock_negativo", material });
          }
          return exito(guardada);
        },
      ),

    consultarStock: (materialIds) => consultarStock(obtenerDb(), materialIds),

    async obtenerDetalle(id) {
      const db = obtenerDb();
      const [transaccion] = await db
        .select({
          id: transacciones.id,
          consecutivo: transacciones.consecutivo,
          tipo: transacciones.tipo,
          estado: transacciones.estado,
          fecha: transacciones.fecha,
          total: transacciones.total,
          anuladaEn: transacciones.anuladaEn,
          motivoAnulacion: transacciones.motivoAnulacion,
          usuarioAnulacion: authUser.name,
          corrigeA: transacciones.corrigeA,
        })
        .from(transacciones)
        .leftJoin(authUser, eq(authUser.id, transacciones.anuladaPor))
        .where(eq(transacciones.id, id));
      if (!transaccion) return null;

      const referencia = (condicion: SQL) =>
        db
          .select({ id: transacciones.id, consecutivo: transacciones.consecutivo })
          .from(transacciones)
          .where(condicion)
          .then(([fila]) => fila ?? null);

      const [lineas, corrigeA, corregidaPor] = await Promise.all([
        db
          .select({
            materialId: lineasTransaccion.materialId,
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
          .orderBy(asc(materiales.nombre), asc(lineasTransaccion.pesoKg)),
        transaccion.corrigeA ? referencia(eq(transacciones.id, transaccion.corrigeA)) : null,
        referencia(eq(transacciones.corrigeA, id)),
      ]);

      return {
        id: transaccion.id,
        consecutivo: transaccion.consecutivo,
        tipo: transaccion.tipo,
        estado: transaccion.estado,
        fecha: transaccion.fecha,
        total: pesosDesdeNumeric(transaccion.total),
        anulacion:
          transaccion.anuladaEn && transaccion.motivoAnulacion
            ? {
                fecha: transaccion.anuladaEn,
                usuario: transaccion.usuarioAnulacion ?? "Usuario eliminado",
                motivo: transaccion.motivoAnulacion,
              }
            : null,
        corrigeA,
        corregidaPor,
        lineas: lineas.map((l) => ({
          materialId: l.materialId,
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

    async listar(filtro, limite, antesDe) {
      const db = obtenerDb();
      // Los nombres de materiales se agregan en la misma consulta: cada consulta
      // adicional es una ida y vuelta de red a la base de datos.
      const filas = await db
        .select({
          id: transacciones.id,
          consecutivo: transacciones.consecutivo,
          tipo: transacciones.tipo,
          estado: transacciones.estado,
          fecha: transacciones.fecha,
          total: transacciones.total,
          // Drizzle omite el nombre de la tabla en las columnas dentro de sql``: sin los
          // nombres explícitos, "id" sería ambiguo entre la subconsulta y la externa.
          materiales: sql<string[]>`coalesce((
            select array_agg(distinct m.nombre order by m.nombre)
            from lineas_transaccion l
            inner join materiales m on m.id = l.material_id
            where l.transaccion_id = transacciones.id
          ), '{}')`,
        })
        .from(transacciones)
        .where(
          and(
            ...condicionesHistorial(filtro, db),
            antesDe ? lt(transacciones.consecutivo, antesDe) : undefined,
          ),
        )
        // El consecutivo crece con cada registro: sirve de cursor estable aunque entren nuevas.
        .orderBy(desc(transacciones.consecutivo))
        .limit(limite);

      return filas.map((fila) => ({ ...fila, total: pesosDesdeNumeric(fila.total) }));
    },

    async resumir(filtro) {
      const db = obtenerDb();
      const filas = await db
        .select({
          tipo: transacciones.tipo,
          estado: transacciones.estado,
          cantidad: sql<number>`count(*)::int`,
          total: sql<string>`coalesce(sum(${transacciones.total}), 0)`,
        })
        .from(transacciones)
        .where(and(...condicionesHistorial(filtro, db)))
        .groupBy(transacciones.tipo, transacciones.estado);

      const activas = (tipo: "compra" | "venta") => {
        const fila = filas.find((f) => f.tipo === tipo && f.estado === "activa");
        return { cantidad: fila?.cantidad ?? 0, total: pesosDesdeNumeric(fila?.total ?? "0") };
      };
      return {
        compras: activas("compra"),
        ventas: activas("venta"),
        anuladas: filas
          .filter((f) => f.estado === "anulada")
          .reduce((suma, f) => suma + f.cantidad, 0),
      };
    },
  };
}
