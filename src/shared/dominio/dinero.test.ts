import { describe, expect, it } from "vitest";
import { formatearCOP, parsearPesos, pesosANumeric, pesosDesdeNumeric } from "./dinero";

describe("parsearPesos", () => {
  it("acepta enteros no negativos", () => {
    expect(parsearPesos("3500")).toBe(3500);
    expect(parsearPesos(" 0 ")).toBe(0);
  });

  it.each(["", "-1", "3.5", "3,500", "abc", "1e3", "1000000000000"])("rechaza %j", (texto) => {
    expect(parsearPesos(texto)).toBeNull();
  });
});

describe("conversión numeric", () => {
  it("ida y vuelta sin pérdida", () => {
    expect(pesosANumeric(34000)).toBe("34000.00");
    expect(pesosDesdeNumeric("34000.00")).toBe(34000);
  });
});

describe("formatearCOP", () => {
  it("usa separador de miles colombiano y sin decimales", () => {
    expect(formatearCOP(1234567).replace(/\s/g, " ")).toBe("$ 1.234.567");
  });
});
