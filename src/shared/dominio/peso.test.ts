import { describe, expect, it } from "vitest";
import {
  calcularSubtotal,
  convertirAPesoGramos,
  formatearKg,
  gramosANumeric,
  gramosDesdeNumeric,
  parsearKg,
} from "./peso";

describe("parsearKg", () => {
  it.each([
    ["12", 12000],
    ["12.5", 12500],
    ["12,5", 12500],
    ["0.001", 1],
    ["1,234", 1234],
  ])("%j → %i g", (texto, gramos) => {
    expect(parsearKg(texto)).toBe(gramos);
  });

  it.each(["", "-1", "1.2345", "1.2.3", "abc", ".5"])("rechaza %j", (texto) => {
    expect(parsearKg(texto)).toBeNull();
  });
});

describe("conversión numeric", () => {
  it("ida y vuelta sin pérdida", () => {
    expect(gramosANumeric(1005)).toBe("1.005");
    expect(gramosDesdeNumeric("1.005")).toBe(1005);
    expect(gramosDesdeNumeric("-2.250")).toBe(-2250);
    expect(gramosDesdeNumeric("0")).toBe(0);
  });
});

describe("unidades de captura", () => {
  it("convierte libras a gramos normalizados", () => {
    expect(convertirAPesoGramos("2", "lb")).toBe(907);
  });

  it("convierte una medida personalizada con equivalencia en kg", () => {
    expect(convertirAPesoGramos("3", "otra", "12,5")).toBe(37500);
  });
});

describe("calcularSubtotal", () => {
  it("multiplica kilos por precio por kilo", () => {
    expect(calcularSubtotal(12500, 3000)).toBe(37500);
  });

  it("redondea al peso más cercano, 0,5 hacia arriba", () => {
    expect(calcularSubtotal(1235, 3500)).toBe(4323); // 4322,5
    expect(calcularSubtotal(1001, 333)).toBe(333); // 333,333
  });
});

describe("formatearKg", () => {
  it("muestra siempre tres decimales", () => {
    expect(formatearKg(12500)).toBe("12,500 kg");
    expect(formatearKg(1234567)).toBe("1.234,567 kg");
  });
});
