// Comprueba que la aplicación puede escribir y leer en PostgreSQL.
// Todo ocurre dentro de una transacción que se revierte: no deja datos.
import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
import { crearConexion } from "../src/server/db/cliente";
import { materiales } from "../src/server/db/schema";

loadEnvConfig(process.cwd());

class Revertir extends Error {}

async function main() {
  const { db, pool } = crearConexion(process.env.DATABASE_URL);
  try {
    await db.transaction(async (tx) => {
      const [creado] = await tx
        .insert(materiales)
        .values({
          nombre: `Prueba de conexión ${Date.now()}`,
          precioCompraMinorista: "1000.00",
          precioCompraMayorista: "1100.00",
          precioVenta: "1300.00",
        })
        .returning();

      const [leido] = await tx.select().from(materiales).where(eq(materiales.id, creado.id));
      if (leido?.precioVenta !== "1300.00") {
        throw new Error("El registro leído no coincide con el escrito.");
      }
      console.log(`✓ Escritura y lectura correctas (material ${leido.id}).`);
      throw new Revertir();
    });
  } catch (error) {
    if (!(error instanceof Revertir)) throw error;
    console.log("✓ Transacción revertida; la base quedó sin cambios.");
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("✗ No se pudo verificar la base de datos:", error);
  process.exitCode = 1;
});
