// Importa ./instancia y no "@/server/db": ese último incluye `server-only`, que
// rompe la CLI de Better Auth (npm run auth:crear-admin). Comparten el mismo pool.
import { obtenerDb } from "@/server/db/instancia";

export function obtenerDbAuth() {
  return obtenerDb();
}
