import { describe, expect, it } from "vitest";
import { calcularCostos, type EventoMaterial } from "./costos";

const dia = (d: number) => new Date(`2026-10-${String(d).padStart(2, "0")}T17:00:00Z`);
const compra = (d: number, kg: number, subtotal: number, materialId = "cobre"): EventoMaterial => ({
  materialId,
  material: materialId,
  tipo: "compra",
  fecha: dia(d),
  gramos: kg * 1000,
  subtotal,
});
const venta = (d: number, kg: number, subtotal: number, materialId = "cobre"): EventoMaterial => ({
  ...compra(d, kg, subtotal, materialId),
  tipo: "venta",
});

describe("calcularCostos", () => {
  it("valora la venta al costo promedio ponderado de las compras anteriores", () => {
    // 10 kg a 30.000 y 10 kg a 32.000: promedio 31.000/kg; se venden 5 kg a 40.000.
    const resultado = calcularCostos([
      compra(1, 10, 300_000),
      compra(2, 10, 320_000),
      venta(3, 5, 200_000),
    ]);
    expect(resultado.ingresos).toBe(200_000);
    expect(resultado.costoVendido).toBe(155_000);
    expect(resultado.porMaterial[0]).toMatchObject({ utilidad: 45_000, sinCosto: false });
    expect(resultado.inventario).toEqual([
      { materialId: "cobre", material: "cobre", gramos: 15_000, valorCosto: 465_000 },
    ]);
  });

  it("una compra posterior no cambia el costo de una venta ya hecha", () => {
    const resultado = calcularCostos([
      compra(1, 10, 300_000),
      venta(2, 10, 400_000),
      compra(3, 10, 500_000),
    ]);
    expect(resultado.costoVendido).toBe(300_000);
    expect(resultado.inventario[0].valorCosto).toBe(500_000);
  });

  it("solo cuenta las ventas del período, pero usa todo el historial para el costo", () => {
    const resultado = calcularCostos(
      [compra(1, 10, 300_000), venta(2, 4, 160_000), venta(5, 4, 180_000)],
      { desde: dia(4), hasta: dia(6) },
    );
    expect(resultado.ingresos).toBe(180_000);
    expect(resultado.costoVendido).toBe(120_000);
  });

  it("señala la venta que no tiene compras que la respalden en lugar de inventar un costo", () => {
    const resultado = calcularCostos([compra(1, 2, 60_000), venta(2, 5, 200_000)]);
    expect(resultado.porMaterial[0]).toMatchObject({ costo: 60_000, sinCosto: true });
    expect(resultado.inventario).toEqual([]);
  });

  it("separa los materiales y ordena por utilidad", () => {
    const resultado = calcularCostos([
      compra(1, 10, 100_000, "a"),
      compra(1, 10, 100_000, "b"),
      venta(2, 10, 110_000, "a"),
      venta(2, 10, 150_000, "b"),
    ]);
    expect(resultado.porMaterial.map((m) => [m.materialId, m.utilidad])).toEqual([
      ["b", 50_000],
      ["a", 10_000],
    ]);
  });
});
