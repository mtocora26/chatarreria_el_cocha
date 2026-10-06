import { describe, expect, it } from "vitest";
import type { EventoMaterial } from "../domain/costos";
import { crearCasosDeUsoRentabilidad } from "./casos-de-uso";

const f = (d: number) => new Date(`2026-10-${String(d).padStart(2, "0")}T17:00:00Z`);
const eventos: EventoMaterial[] = [
  {
    materialId: "cobre",
    material: "Cobre",
    tipo: "compra",
    fecha: f(1),
    gramos: 10_000,
    subtotal: 300_000,
  },
  {
    materialId: "cobre",
    material: "Cobre",
    tipo: "venta",
    fecha: f(2),
    gramos: 4_000,
    subtotal: 160_000,
  },
  {
    materialId: "bronce",
    material: "Bronce",
    tipo: "compra",
    fecha: f(1),
    gramos: 5_000,
    subtotal: 90_000,
  },
];

function preparar(totalGastos = 50_000) {
  const filtros: unknown[] = [];
  const casos = crearCasosDeUsoRentabilidad(
    { listarEventos: async () => eventos },
    {
      listarMateriales: async () => [
        { id: "cobre", precioVenta: 40_000 },
        { id: "bronce", precioVenta: null },
      ],
    },
    {
      resumirGastos: async (filtro) => {
        filtros.push(filtro);
        return { total: totalGastos, cantidad: 1, anulados: 0, porCategoria: [] };
      },
    },
  );
  return { casos, filtros };
}

describe("consultarRentabilidad", () => {
  it("resta el costo de lo vendido y los gastos para llegar a la utilidad neta", async () => {
    const { casos } = preparar();
    const reporte = await casos.consultarRentabilidad({});
    expect(reporte).toMatchObject({
      ingresos: 160_000,
      costoVendido: 120_000,
      utilidadBruta: 40_000,
      utilidadNeta: -10_000,
    });
    expect(reporte.margenBruto).toBeCloseTo(0.25);
  });

  it("valora el inventario al costo y al precio de venta, y señala lo que no tiene precio", async () => {
    const { casos } = preparar();
    const { inventario } = await casos.consultarRentabilidad({});
    expect(inventario.valorCosto).toBe(180_000 + 90_000);
    // Cobre: 6 kg × 40.000 = 240.000 contra costo 180.000. El bronce no tiene precio.
    expect(inventario.valorVenta).toBe(240_000);
    expect(inventario.utilidadPotencial).toBe(60_000);
    expect(inventario.sinPrecio).toEqual(["Bronce"]);
  });

  it("pasa el período a los gastos como instantes y sin ventas el margen es null", async () => {
    const { casos, filtros } = preparar();
    const reporte = await casos.consultarRentabilidad({ desde: "2026-11-01", hasta: "2026-11-02" });
    expect(reporte.margenBruto).toBeNull();
    expect(filtros[0]).toEqual({
      desde: new Date("2026-11-01T05:00:00.000Z"),
      hasta: new Date("2026-11-03T05:00:00.000Z"),
    });
  });
});
