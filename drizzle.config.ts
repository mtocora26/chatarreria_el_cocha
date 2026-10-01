import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Carga .env.local igual que Next.js.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local y completa la conexión.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
