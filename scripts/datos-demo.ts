// Carga datos FICTICIOS para la demostración: precios y operaciones inventados,
// sin información del cliente. Usa los mismos casos de uso que la aplicación,
// así que los totales y el stock se calculan igual que en uso real.
// Solo se ejecuta sobre una base sin materiales, para no mezclarse con datos reales.
import { loadEnvConfig } from "@next/env";
import { count } from "drizzle-orm";
import { crearCasosDeUsoMateriales } from "../src/modules/materiales/application/casos-de-uso";
import { crearRepositorioMateriales } from "../src/modules/materiales/infrastructure/repositorio-drizzle";
import { crearCasosDeUsoTerceros } from "../src/modules/terceros/application/casos-de-uso";
import { crearRepositorioTerceros } from "../src/modules/terceros/infrastructure/repositorio-drizzle";
import { crearCasosDeUsoOperaciones } from "../src/modules/operaciones/application/casos-de-uso";
import { crearRepositorioOperaciones } from "../src/modules/operaciones/infrastructure/repositorio-drizzle";
import { crearConexion } from "../src/server/db/cliente";
import { materiales as tablaMateriales } from "../src/server/db/schema";

loadEnvConfig(process.cwd());

const MATERIALES_DEMO = [
  { nombre: "Cobre", minorista: 30000, mayorista: 31500, venta: 34000 },
  { nombre: "Bronce", minorista: 18000, mayorista: 19000, venta: 21000 },
  { nombre: "Aluminio", minorista: 4000, mayorista: 4300, venta: 5000 },
  { nombre: "Chatarra ferrosa", minorista: 900, mayorista: 1000, venta: 1200 },
  { nombre: "Baterías", minorista: 2500, mayorista: 2700, venta: 3200 },
];

async function main() {
  const { db, pool } = crearConexion(process.env.DATABASE_URL);
  try {
    const [{ total }] = await db.select({ total: count() }).from(tablaMateriales);
    if (total > 0) {
      console.error(
        "✗ La base ya tiene materiales. Los datos de demo solo se cargan en una base vacía.",
      );
      process.exitCode = 1;
      return;
    }

    const materiales = crearCasosDeUsoMateriales(crearRepositorioMateriales(() => db));
    const operaciones = crearCasosDeUsoOperaciones(
      crearRepositorioOperaciones(() => db),
      materiales,
      {
        obtenerTercero: crearCasosDeUsoTerceros(crearRepositorioTerceros(() => db)).obtenerTercero,
      },
    );

    const ids = new Map<string, string>();
    for (const m of MATERIALES_DEMO) {
      const creado = await materiales.guardarMaterial(null, {
        nombre: m.nombre,
        precioCompraMinorista: String(m.minorista),
        precioCompraMayorista: String(m.mayorista),
        precioVenta: String(m.venta),
        activo: true,
      });
      if (!creado.ok)
        throw new Error(`No se pudo crear ${m.nombre}: ${JSON.stringify(creado.error)}`);
      ids.set(m.nombre, creado.valor.id);
    }
    const id = (nombre: string) => ids.get(nombre) ?? "";

    // En secuencia: la venta necesita el stock de las compras anteriores.
    const resultados = [
      await operaciones.registrarCompra({
        tarifa: "minorista",
        lineas: [
          { materialId: id("Cobre"), pesoKg: "3.250" },
          { materialId: id("Aluminio"), pesoKg: "12.5" },
        ],
      }),
      await operaciones.registrarCompra({
        tarifa: "mayorista",
        lineas: [
          { materialId: id("Chatarra ferrosa"), pesoKg: "480" },
          { materialId: id("Baterías"), pesoKg: "35" },
        ],
      }),
      await operaciones.registrarCompra({
        tarifa: "minorista",
        lineas: [{ materialId: id("Bronce"), pesoKg: "6.8" }],
      }),
      await operaciones.registrarVenta({
        lineas: [
          { materialId: id("Chatarra ferrosa"), pesoKg: "300", precioPorKg: "1200" },
          { materialId: id("Aluminio"), pesoKg: "10", precioPorKg: "5100" },
        ],
      }),
    ];
    const fallida = resultados.find((r) => !r.ok);
    if (fallida && !fallida.ok)
      throw new Error(`Operación de demo rechazada: ${JSON.stringify(fallida.error)}`);

    console.log(
      `✓ Datos de demostración (ficticios) cargados: ${MATERIALES_DEMO.length} materiales, 3 compras y 1 venta.`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("✗ No se pudieron cargar los datos de demostración:", error);
  process.exitCode = 1;
});
