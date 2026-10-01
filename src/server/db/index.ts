import "server-only";
import { crearConexion, type BaseDeDatos } from "./cliente";

// Se conecta en la primera consulta y no al importar, para que `next build`
// no exija DATABASE_URL. En desarrollo la recarga en caliente re-ejecuta este
// módulo; guardar la instancia en globalThis evita abrir pools nuevos.
const globalConDb = globalThis as typeof globalThis & { db?: BaseDeDatos };

export function obtenerDb(): BaseDeDatos {
  globalConDb.db ??= crearConexion(process.env.DATABASE_URL).db;
  return globalConDb.db;
}
