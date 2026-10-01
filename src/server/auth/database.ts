import { crearConexion, type BaseDeDatos } from "@/server/db/cliente";

const globalConDb = globalThis as typeof globalThis & { dbAuth?: BaseDeDatos };

export function obtenerDbAuth() {
  globalConDb.dbAuth ??= crearConexion(process.env.DATABASE_URL).db;
  return globalConDb.dbAuth;
}
