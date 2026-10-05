import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { esViolacionUnica } from "@/server/db/errores";
import { authUser, categoriasGasto, gastos } from "@/server/db/schema";
import { pesosANumeric, pesosDesdeNumeric } from "@/shared/dominio/dinero";
import { exito, fallo } from "@/shared/dominio/resultado";
import type { RepositorioGastos } from "../application/casos-de-uso";
import type { FiltroGastos } from "../domain/gasto";

function condiciones(filtro: FiltroGastos) {
  return [
    filtro.desde ? gte(gastos.fecha, filtro.desde) : undefined,
    filtro.hasta ? lt(gastos.fecha, filtro.hasta) : undefined,
    filtro.categoriaId ? eq(gastos.categoriaId, filtro.categoriaId) : undefined,
  ];
}

export function crearRepositorioGastos(obtenerDb: () => BaseDeDatos): RepositorioGastos {
  return {
    async listar(filtro, limite) {
      const filas = await obtenerDb()
        .select({
          id: gastos.id,
          fecha: gastos.fecha,
          categoriaId: gastos.categoriaId,
          categoria: categoriasGasto.nombre,
          monto: gastos.monto,
          descripcion: gastos.descripcion,
          pagadoA: gastos.pagadoA,
          medioPago: gastos.medioPago,
          estado: gastos.estado,
          anuladoEn: gastos.anuladoEn,
          motivoAnulacion: gastos.motivoAnulacion,
          usuarioAnulacion: authUser.name,
        })
        .from(gastos)
        .innerJoin(categoriasGasto, eq(categoriasGasto.id, gastos.categoriaId))
        .leftJoin(authUser, eq(authUser.id, gastos.anuladoPor))
        .where(and(...condiciones(filtro)))
        .orderBy(desc(gastos.fecha), desc(gastos.creadoEn))
        .limit(limite);

      return filas.map((fila) => ({
        id: fila.id,
        fecha: fila.fecha,
        categoriaId: fila.categoriaId,
        categoria: fila.categoria,
        monto: pesosDesdeNumeric(fila.monto),
        descripcion: fila.descripcion,
        pagadoA: fila.pagadoA,
        medioPago: fila.medioPago,
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

    async resumir(filtro) {
      const filas = await obtenerDb()
        .select({
          categoriaId: gastos.categoriaId,
          categoria: categoriasGasto.nombre,
          estado: gastos.estado,
          cantidad: sql<number>`count(*)::int`,
          total: sql<string>`coalesce(sum(${gastos.monto}), 0)`,
        })
        .from(gastos)
        .innerJoin(categoriasGasto, eq(categoriasGasto.id, gastos.categoriaId))
        .where(and(...condiciones(filtro)))
        .groupBy(gastos.categoriaId, categoriasGasto.nombre, gastos.estado);

      const activas = filas.filter((f) => f.estado === "activa");
      const porCategoria = activas
        .map((f) => ({
          categoriaId: f.categoriaId,
          categoria: f.categoria,
          total: pesosDesdeNumeric(f.total),
          cantidad: f.cantidad,
        }))
        .sort((a, b) => b.total - a.total);
      return {
        total: porCategoria.reduce((suma, c) => suma + c.total, 0),
        cantidad: porCategoria.reduce((suma, c) => suma + c.cantidad, 0),
        anulados: filas.filter((f) => f.estado === "anulada").reduce((s, f) => s + f.cantidad, 0),
        porCategoria,
      };
    },

    async categoriaActiva(id) {
      const [fila] = await obtenerDb()
        .select({ activo: categoriasGasto.activo })
        .from(categoriasGasto)
        .where(eq(categoriasGasto.id, id));
      return fila?.activo === true;
    },

    async crear(datos, usuarioId) {
      const [fila] = await obtenerDb()
        .insert(gastos)
        .values({
          fecha: datos.fecha,
          categoriaId: datos.categoriaId,
          monto: pesosANumeric(datos.monto),
          descripcion: datos.descripcion,
          pagadoA: datos.pagadoA,
          medioPago: datos.medioPago,
          creadoPor: usuarioId,
        })
        .returning({ id: gastos.id });
      return fila;
    },

    async anular(id, datos) {
      const db = obtenerDb();
      const [anulado] = await db
        .update(gastos)
        .set({
          estado: "anulada",
          anuladoEn: new Date(),
          anuladoPor: datos.usuarioId,
          motivoAnulacion: datos.motivo,
        })
        .where(and(eq(gastos.id, id), eq(gastos.estado, "activa")))
        .returning({ id: gastos.id });
      if (anulado) return "anulado";

      const [existente] = await db.select({ id: gastos.id }).from(gastos).where(eq(gastos.id, id));
      return existente ? "ya_anulado" : "no_existe";
    },

    async listarCategorias(filtro) {
      return obtenerDb()
        .select({
          id: categoriasGasto.id,
          nombre: categoriasGasto.nombre,
          activo: categoriasGasto.activo,
        })
        .from(categoriasGasto)
        .where(filtro?.soloActivas ? eq(categoriasGasto.activo, true) : undefined)
        .orderBy(asc(sql`lower(${categoriasGasto.nombre})`));
    },

    async crearCategoria(nombre) {
      try {
        const [fila] = await obtenerDb().insert(categoriasGasto).values({ nombre }).returning({
          id: categoriasGasto.id,
          nombre: categoriasGasto.nombre,
          activo: categoriasGasto.activo,
        });
        return exito(fila);
      } catch (error) {
        if (esViolacionUnica(error)) return fallo("nombre_duplicado");
        throw error;
      }
    },

    async cambiarActivoCategoria(id, activo) {
      const filas = await obtenerDb()
        .update(categoriasGasto)
        .set({ activo })
        .where(eq(categoriasGasto.id, id))
        .returning({ id: categoriasGasto.id });
      return filas.length > 0;
    },
  };
}
