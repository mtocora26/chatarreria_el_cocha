import { describe, expect, it } from "vitest";
import { sirvePara } from "./tercero";

describe("sirvePara", () => {
  it("las compras son con proveedores y las ventas con clientes", () => {
    expect(sirvePara({ tipo: "proveedor" }, "compra")).toBe(true);
    expect(sirvePara({ tipo: "proveedor" }, "venta")).toBe(false);
    expect(sirvePara({ tipo: "cliente" }, "venta")).toBe(true);
    expect(sirvePara({ tipo: "cliente" }, "compra")).toBe(false);
  });

  it("quien es ambos sirve para las dos", () => {
    expect(sirvePara({ tipo: "ambos" }, "compra")).toBe(true);
    expect(sirvePara({ tipo: "ambos" }, "venta")).toBe(true);
  });
});
