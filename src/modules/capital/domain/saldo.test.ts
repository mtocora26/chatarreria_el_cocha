import { describe, expect, it } from "vitest";
import { calcularSaldo, evolucionDiaria, SIN_FLUJOS } from "./saldo";

describe("calcularSaldo", () => {
  it("las compras y gastos bajan el saldo y las ventas lo suben", () => {
    const resultado = calcularSaldo({
      aporte: 10_000_000,
      retiro: 500_000,
      venta: 3_000_000,
      compra: 2_000_000,
      gasto: 250_000,
    });
    expect(resultado.saldo).toBe(10_250_000);
  });

  it("sin movimientos el saldo es cero", () => {
    expect(calcularSaldo(SIN_FLUJOS).saldo).toBe(0);
  });
});

describe("evolucionDiaria", () => {
  it("acumula el saldo día a día desde el saldo inicial, en orden", () => {
    const dias = evolucionDiaria(1_000, [
      { dia: "2026-10-03", flujos: { ...SIN_FLUJOS, venta: 500, gasto: 100 } },
      { dia: "2026-10-02", flujos: { ...SIN_FLUJOS, compra: 300 } },
    ]);
    expect(dias).toEqual([
      { dia: "2026-10-02", entradas: 0, salidas: 300, saldo: 700 },
      { dia: "2026-10-03", entradas: 500, salidas: 100, saldo: 1_100 },
    ]);
  });
});
