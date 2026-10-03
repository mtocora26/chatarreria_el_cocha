// Asigna el nombre de usuario con el que una cuenta existente inicia sesión.
// Uso: npm run auth:asignar-usuario -- --email correo@dominio --usuario nombre
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { parseArgs } from "node:util";
import { crearConexion } from "../src/server/db/cliente";
import { authUser } from "../src/server/db/schema";

loadEnvConfig(process.cwd());

const { values } = parseArgs({
  options: { email: { type: "string" }, usuario: { type: "string" } },
});
const email = values.email?.trim().toLowerCase();
const usuario = values.usuario?.trim().toLowerCase();

async function main() {
  if (!email || !usuario) throw new Error("Uso: --email <correo> --usuario <nombre>");
  if (!/^[a-z0-9_.]{3,30}$/.test(usuario)) {
    throw new Error("El usuario admite de 3 a 30 letras minúsculas, números, punto o guion bajo.");
  }
  const { db, pool } = crearConexion(process.env.DATABASE_URL);
  try {
    const actualizados = await db
      .update(authUser)
      .set({ username: usuario })
      .where(eq(authUser.email, email))
      .returning({ id: authUser.id });
    if (actualizados.length === 0) throw new Error(`No existe una cuenta con el correo ${email}.`);
    console.log(`✓ ${email} ahora inicia sesión con el usuario "${usuario}".`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
