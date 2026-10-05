import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import type { BaseDeDatos } from "@/server/db/cliente";
import { terceros } from "@/server/db/schema";
import type { RepositorioTerceros } from "../application/casos-de-uso";
import type { Tercero } from "../domain/tercero";

const aTercero = (fila: typeof terceros.$inferSelect): Tercero => ({
  id: fila.id,
  nombre: fila.nombre,
  documento: fila.documento,
  telefono: fila.telefono,
  tipo: fila.tipo,
});

/** Escapa % y _ para que el texto buscado no actúe como comodín. */
const comodin = (texto: string) => `%${texto.replace(/[\\%_]/g, "\\$&")}%`;

export function crearRepositorioTerceros(obtenerDb: () => BaseDeDatos): RepositorioTerceros {
  return {
    async listar({ busqueda, tipo }) {
      const patron = busqueda ? comodin(busqueda) : null;
      const filas = await obtenerDb()
        .select()
        .from(terceros)
        .where(
          and(
            tipo ? eq(terceros.tipo, tipo) : undefined,
            patron
              ? or(
                  // unaccent no está instalado: se compara tal cual, sin distinguir mayúsculas.
                  ilike(terceros.nombre, patron),
                  ilike(sql`coalesce(${terceros.documento}, '')`, patron),
                  ilike(sql`coalesce(${terceros.telefono}, '')`, patron),
                )
              : undefined,
          ),
        )
        .orderBy(asc(sql`lower(${terceros.nombre})`));
      return filas.map(aTercero);
    },

    async obtener(id) {
      const [fila] = await obtenerDb().select().from(terceros).where(eq(terceros.id, id));
      return fila ? aTercero(fila) : null;
    },

    async crear(datos) {
      const [fila] = await obtenerDb().insert(terceros).values(datos).returning();
      return aTercero(fila);
    },

    async actualizar(id, datos) {
      const [fila] = await obtenerDb()
        .update(terceros)
        .set(datos)
        .where(eq(terceros.id, id))
        .returning();
      return fila ? aTercero(fila) : null;
    },
  };
}
