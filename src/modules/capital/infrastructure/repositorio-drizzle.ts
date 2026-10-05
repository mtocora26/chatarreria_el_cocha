import { and, desc, eq, sql } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { authUser, movimientosCapital } from "@/server/db/schema";
import { ZONA_HORARIA_NEGOCIO } from "@/shared/dominio/fecha";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import type { RepositorioCapital } from "../application/casos-de-uso";
import { SIN_FLUJOS, type Concepto, type Flujos } from "../domain/saldo";

type FilaFlujo = { concepto: Concepto; dia?: string; total: string };

// Una sola lista con todo lo que mueve el dinero. Las anuladas no entran.
const MOVIMIENTOS = sql`
  select fecha, tipo::text as concepto, monto from movimientos_capital where estado = 'activa'
  union all select fecha, tipo::text as concepto, total as monto from transacciones where estado = 'activa'
  union all select fecha, 'gasto' as concepto, monto from gastos where estado = 'activa'
`;

function aFlujos(filas: FilaFlujo[]): Flujos {
  const flujos = { ...SIN_FLUJOS };
  for (const fila of filas) flujos[fila.concepto] += pesosDesdeNumeric(fila.total);
  return flujos;
}

export function crearRepositorioCapital(obtenerDb: () => BaseDeDatos): RepositorioCapital {
  return {
    async sumarFlujos(hasta) {
      const limite = hasta ?? new Date("9999-01-01T00:00:00Z");
      const { rows } = await obtenerDb().execute<FilaFlujo>(sql`
        select concepto, coalesce(sum(monto), 0)::text as total
        from (${MOVIMIENTOS}) m
        where fecha < ${limite.toISOString()}::timestamptz
        group by concepto`);
      return aFlujos(rows);
    },

    async flujosPorDia(desde, hasta) {
      const { rows } = await obtenerDb().execute<FilaFlujo & { dia: string }>(sql`
        select to_char(fecha at time zone ${ZONA_HORARIA_NEGOCIO}, 'YYYY-MM-DD') as dia,
               concepto, coalesce(sum(monto), 0)::text as total
        from (${MOVIMIENTOS}) m
        where fecha >= ${desde.toISOString()}::timestamptz and fecha < ${hasta.toISOString()}::timestamptz
        group by dia, concepto`);
      const porDia = new Map<string, FilaFlujo[]>();
      for (const fila of rows) porDia.set(fila.dia, [...(porDia.get(fila.dia) ?? []), fila]);
      return [...porDia].map(([dia, filas]) => ({ dia, flujos: aFlujos(filas) }));
    },

    async listarMovimientos(limite) {
      const filas = await obtenerDb()
        .select({
          id: movimientosCapital.id,
          fecha: movimientosCapital.fecha,
          tipo: movimientosCapital.tipo,
          monto: movimientosCapital.monto,
          nota: movimientosCapital.nota,
          estado: movimientosCapital.estado,
          anuladoEn: movimientosCapital.anuladoEn,
          motivoAnulacion: movimientosCapital.motivoAnulacion,
          usuarioAnulacion: authUser.name,
        })
        .from(movimientosCapital)
        .leftJoin(authUser, eq(authUser.id, movimientosCapital.anuladoPor))
        .orderBy(desc(movimientosCapital.fecha), desc(movimientosCapital.creadoEn))
        .limit(limite);
      return filas.map((fila) => ({
        id: fila.id,
        fecha: fila.fecha,
        tipo: fila.tipo,
        monto: pesosDesdeNumeric(fila.monto),
        nota: fila.nota,
        estado: fila.estado,
        anulacion:
          fila.anuladoEn && fila.motivoAnulacion
            ? {
                fecha: fila.anuladoEn,
                usuario: fila.usuarioAnulacion ?? "Usuario eliminado",
                motivo: fila.motivoAnulacion,
              }
            : null,
      }));
    },

    async crearMovimiento(datos, usuarioId) {
      const [fila] = await obtenerDb()
        .insert(movimientosCapital)
        .values({
          fecha: datos.fecha,
          tipo: datos.tipo,
          monto: pesosANumeric(datos.monto),
          nota: datos.nota,
          creadoPor: usuarioId,
        })
        .returning({ id: movimientosCapital.id });
      return fila;
    },

    async anularMovimiento(id, datos) {
      const db = obtenerDb();
      const [anulado] = await db
        .update(movimientosCapital)
        .set({
          estado: "anulada",
          anuladoEn: new Date(),
          anuladoPor: datos.usuarioId,
          motivoAnulacion: datos.motivo,
        })
        .where(and(eq(movimientosCapital.id, id), eq(movimientosCapital.estado, "activa")))
        .returning({ id: movimientosCapital.id });
      if (anulado) return "anulado";

      const [existente] = await db
        .select({ id: movimientosCapital.id })
        .from(movimientosCapital)
        .where(eq(movimientosCapital.id, id));
      return existente ? "ya_anulado" : "no_existe";
    },
  };
}
