import { describe, expect, it } from "vitest";
import type { Material } from "@/modules/materiales/domain/material";
import { crearCompra } from "./operacion";

const cobre: Material = {
  id: "cobre",
  nombre: "Cobre",
  precioCompraMinorista: 30000,
  precioCompraMayorista: 31000,
  precioVenta: 34000,
  activo: true,
};
const chatarra: Material = { ...cobre, id: "chatarra", precioCompraMinorista: 900 };

describe("crearCompra", () => {
  it("usa el precio de la tarifa y suma los subtotales", () => {
    const resultado = crearCompra(
      [
        { material: cobre, gramos: 2500 },
        { material: chatarra, gramos: 12345 },
      ],
      "minorista",
    );

    expect(resultado).toEqual({
      ok: true,
      valor: {
        tipo: "compra",
        lineas: [
          {
            materialId: "cobre",
            gramos: 2500,
            precioPorKg: 30000,
            tarifa: "minorista",
            subtotal: 75000,
          },
          {
            materialId: "chatarra",
            gramos: 12345,
            precioPorKg: 900,
            tarifa: "minorista",
            subtotal: 11111,
          },
        ],
        total: 86111,
      },
    });
  });

  it("aplica el precio mayorista cuando se elige esa tarifa", () => {
    const resultado = crearCompra([{ material: cobre, gramos: 1000 }], "mayorista");

    expect(resultado.ok && resultado.valor.total).toBe(31000);
  });

  it("exige al menos una línea", () => {
    expect(crearCompra([], "minorista")).toEqual({ ok: false, error: { tipo: "sin_lineas" } });
  });

  it.each([0, -1000, 1.5])("rechaza peso %d g indicando la línea", (gramos) => {
    const resultado = crearCompra(
      [
        { material: cobre, gramos: 1000 },
        { material: cobre, gramos },
      ],
      "minorista",
    );

    expect(resultado).toEqual({ ok: false, error: { tipo: "peso_invalido", indice: 1 } });
  });

  it("rechaza materiales inexistentes o inactivos", () => {
    expect(crearCompra([{ material: undefined, gramos: 1000 }], "minorista")).toEqual({
      ok: false,
      error: { tipo: "material_no_disponible", indice: 0 },
    });
    expect(
      crearCompra([{ material: { ...cobre, activo: false }, gramos: 1000 }], "minorista"),
    ).toEqual({
      ok: false,
      error: { tipo: "material_no_disponible", indice: 0 },
    });
  });
});
