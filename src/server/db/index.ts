import "server-only";
import { crearConexion, type BaseDeDatos } from "./cliente";

// En desarrollo la recarga en caliente re-ejecuta este módulo; se reutiliza el pool
// para no abrir conexiones nuevas en cada cambio.
const globalConDb = globalThis as typeof globalThis & { db?: BaseDeDatos };

export const db = globalConDb.db ?? crearConexion(process.env.DATABASE_URL).db;

if (process.env.NODE_ENV !== "production") {
  globalConDb.db = db;
}
