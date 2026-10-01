import { describe, expect, it } from "vitest";
import type { Material } from "@/modules/materiales/domain/material";
import { crearCompra, crearVenta, verificarStock } from "./operacion";

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
            cantidadPeso: 2.5,
            unidadPeso: "kg",
            equivalenciaKg: 1,
            precioPorKg: 30000,
            tarifa: "minorista",
            subtotal: 75000,
          },
          {
            materialId: "chatarra",
            gramos: 12345,
            cantidadPeso: 12.345,
            unidadPeso: "kg",
            equivalenciaKg: 1,
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

describe("crearVenta", () => {
  it("usa el precio indicado en cada línea y no asigna tarifa", () => {
    const resultado = crearVenta([{ material: cobre, gramos: 1500, precioPorKg: 35000 }]);

    expect(resultado).toEqual({
      ok: true,
      valor: {
        tipo: "venta",
        lineas: [
          {
            materialId: "cobre",
            gramos: 1500,
            cantidadPeso: 1.5,
            unidadPeso: "kg",
            equivalenciaKg: 1,
            precioPorKg: 35000,
            tarifa: null,
            subtotal: 52500,
          },
        ],
        total: 52500,
      },
    });
  });

  it("aplica las mismas validaciones de líneas que la compra", () => {
    expect(crearVenta([{ material: cobre, gramos: 0, precioPorKg: 1 }])).toEqual({
      ok: false,
      error: { tipo: "peso_invalido", indice: 0 },
    });
  });
});

describe("verificarStock", () => {
  const stock = new Map([
    ["cobre", 5000],
    ["chatarra", 1000],
  ]);

  it("permite vender exactamente lo disponible", () => {
    expect(verificarStock([{ materialId: "cobre", gramos: 5000 }], stock).ok).toBe(true);
  });

  it("rechaza superar lo disponible", () => {
    expect(verificarStock([{ materialId: "chatarra", gramos: 1001 }], stock)).toEqual({
      ok: false,
      error: { tipo: "stock_insuficiente", indice: 0, disponible: 1000 },
    });
  });

  it("acumula varias líneas del mismo material", () => {
    const resultado = verificarStock(
      [
        { materialId: "cobre", gramos: 3000 },
        { materialId: "chatarra", gramos: 500 },
        { materialId: "cobre", gramos: 2001 },
      ],
      stock,
    );

    expect(resultado).toEqual({
      ok: false,
      error: { tipo: "stock_insuficiente", indice: 2, disponible: 5000 },
    });
  });

  it("un material sin movimientos tiene stock cero", () => {
    expect(verificarStock([{ materialId: "otro", gramos: 1 }], stock).ok).toBe(false);
  });
});
