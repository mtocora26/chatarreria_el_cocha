import { describe, expect, it } from "vitest";
import type { Material } from "@/modules/materiales/domain/material";
import { verificarStock, type NuevaOperacion } from "../domain/operacion";
import { crearCasosDeUsoOperaciones, type RepositorioOperaciones } from "./casos-de-uso";

const COBRE_ID = "7f0c1c8e-8a4e-4f8e-9b1a-1c2d3e4f5a6b";
const INACTIVO_ID = "0e1f2a3b-4c5d-4e6f-8a9b-0c1d2e3f4a5b";

const catalogo: Material[] = [
  {
    id: COBRE_ID,
    nombre: "Cobre",
    precioCompraMinorista: 30000,
    precioCompraMayorista: 31000,
    precioVenta: 34000,
    activo: true,
  },
  {
    id: INACTIVO_ID,
    nombre: "Bronce",
    precioCompraMinorista: 1,
    precioCompraMayorista: 1,
    precioVenta: 1,
    activo: false,
  },
];

function preparar(stockDisponible = new Map<string, number>()) {
  const guardadas: NuevaOperacion[] = [];
  const repositorio: RepositorioOperaciones = {
    guardar: async (operacion) => {
      guardadas.push(operacion);
      return { id: "id", consecutivo: guardadas.length };
    },
    guardarVenta: async (operacion) => {
      const verificacion = verificarStock(operacion.lineas, stockDisponible);
      if (!verificacion.ok) return verificacion;
      guardadas.push(operacion);
      return { ok: true, valor: { id: "id", consecutivo: guardadas.length } };
    },
    consultarStock: async () => stockDisponible,
    obtenerDetalle: async () => null,
    listarRecientes: async () => [],
  };
  const casos = crearCasosDeUsoOperaciones(repositorio, {
    listarMateriales: async () => catalogo,
    obtenerMateriales: async (ids) => catalogo.filter((m) => ids.includes(m.id)),
  });
  return { casos, guardadas };
}

describe("registrarCompra", () => {
  it("guarda con el precio del catálogo y el total calculado en servidor", async () => {
    const { casos, guardadas } = preparar();

    const resultado = await casos.registrarCompra({
      tarifa: "mayorista",
      lineas: [{ materialId: COBRE_ID, pesoKg: "2,5" }],
    });

    expect(resultado).toEqual({ ok: true, valor: { id: "id", consecutivo: 1 } });
    expect(guardadas[0]).toMatchObject({ tipo: "compra", total: 77500 });
    expect(guardadas[0].lineas[0]).toMatchObject({ gramos: 2500, precioPorKg: 31000 });
  });

  it("ubica los errores de validación por línea y no guarda", async () => {
    const { casos, guardadas } = preparar();

    const resultado = await casos.registrarCompra({
      tarifa: "otra",
      lineas: [
        { materialId: COBRE_ID, pesoKg: "1" },
        { materialId: "", pesoKg: "0" },
      ],
    });

    expect(resultado.ok).toBe(false);
    expect(!resultado.ok && Object.keys(resultado.error).sort()).toEqual([
      "lineas.1.materialId",
      "tarifa",
    ]);
    expect(guardadas).toHaveLength(0);
  });

  it("rechaza un material inactivo", async () => {
    const { casos, guardadas } = preparar();

    const resultado = await casos.registrarCompra({
      tarifa: "minorista",
      lineas: [{ materialId: INACTIVO_ID, pesoKg: "1" }],
    });

    expect(resultado).toEqual({
      ok: false,
      error: { "lineas.0.materialId": "Este material ya no está disponible." },
    });
    expect(guardadas).toHaveLength(0);
  });

  it("exige al menos una línea", async () => {
    const { casos } = preparar();

    const resultado = await casos.registrarCompra({ tarifa: "minorista", lineas: [] });

    expect(resultado).toEqual({ ok: false, error: { lineas: "Agrega al menos un material." } });
  });
});

describe("registrarVenta", () => {
  it("guarda con el precio indicado y el total calculado en servidor", async () => {
    const { casos, guardadas } = preparar(new Map([[COBRE_ID, 5000]]));

    const resultado = await casos.registrarVenta({
      lineas: [{ materialId: COBRE_ID, pesoKg: "1.5", precioPorKg: "35000" }],
    });

    expect(resultado.ok).toBe(true);
    expect(guardadas[0]).toMatchObject({ tipo: "venta", total: 52500 });
  });

  it("informa stock insuficiente en el peso de la línea", async () => {
    const { casos, guardadas } = preparar(new Map([[COBRE_ID, 1000]]));

    const resultado = await casos.registrarVenta({
      lineas: [{ materialId: COBRE_ID, pesoKg: "1.001", precioPorKg: "35000" }],
    });

    expect(resultado).toEqual({
      ok: false,
      error: { "lineas.0.pesoKg": "Stock insuficiente: hay 1,000 kg disponibles." },
    });
    expect(guardadas).toHaveLength(0);
  });

  it("exige precio por kilo mayor que cero", async () => {
    const { casos } = preparar(new Map([[COBRE_ID, 5000]]));

    const resultado = await casos.registrarVenta({
      lineas: [{ materialId: COBRE_ID, pesoKg: "1", precioPorKg: "0" }],
    });

    expect(!resultado.ok && Object.keys(resultado.error)).toEqual(["lineas.0.precioPorKg"]);
  });
});

describe("consultarInventario", () => {
  it("incluye todos los materiales y deja en cero los que no tienen movimientos", async () => {
    const { casos } = preparar(new Map([[COBRE_ID, 2500]]));

    const inventario = await casos.consultarInventario();

    expect(inventario).toEqual([
      { id: COBRE_ID, nombre: "Cobre", activo: true, stock: 2500 },
      { id: INACTIVO_ID, nombre: "Bronce", activo: false, stock: 0 },
    ]);
  });
});
