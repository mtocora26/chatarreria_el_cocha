import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function crearConexion(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local y completa la conexión.");
  }
  const pool = new Pool({ connectionString: databaseUrl });
  return { pool, db: drizzle({ client: pool, schema, casing: "snake_case" }) };
}

export type BaseDeDatos = ReturnType<typeof crearConexion>["db"];
