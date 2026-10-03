import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export function crearConexion(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local y completa la conexión.");
  }
  // Pocas conexiones: el pooler de Neon ya las multiplexa. El tiempo de espera
  // hace fallar rápido, en vez de colgar la petición, si la base tarda en despertar.
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 300_000,
    connectionTimeoutMillis: 10_000,
  });
  return { pool, db: drizzle({ client: pool, schema, casing: "snake_case" }) };
}

export type BaseDeDatos = ReturnType<typeof crearConexion>["db"];
