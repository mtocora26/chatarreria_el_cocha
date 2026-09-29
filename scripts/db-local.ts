// PostgreSQL local para desarrollo y demos, sin Docker ni instalación del sistema.
// Usa binarios oficiales de PostgreSQL empaquetados en npm; los datos quedan en
// .postgres-local/ (ignorado por Git). Se detiene con Ctrl+C.
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const DIRECTORIO = ".postgres-local";
const PUERTO = 5433;
const USUARIO = "postgres";
// Solo escucha en localhost y es para datos de desarrollo: no es un secreto.
const CLAVE = "local";

const postgres = new EmbeddedPostgres({
  databaseDir: DIRECTORIO,
  user: USUARIO,
  password: CLAVE,
  port: PUERTO,
  persistent: true,
});

async function main() {
  if (!existsSync(`${DIRECTORIO}/PG_VERSION`)) await postgres.initialise();
  await postgres.start();
  console.log(`\nPostgreSQL local listo. En .env.local usa:
DATABASE_URL=postgresql://${USUARIO}:${CLAVE}@127.0.0.1:${PUERTO}/postgres

Ctrl+C para detenerlo.`);

  const detener = async () => {
    await postgres.stop();
    process.exit(0);
  };
  process.on("SIGINT", detener);
  process.on("SIGTERM", detener);
}

main().catch((error: unknown) => {
  console.error("✗ No se pudo iniciar PostgreSQL local:", error);
  process.exit(1);
});
