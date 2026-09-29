import { describe, expect, it } from "vitest";
import type { Material } from "@/modules/materiales/domain/material";
import type { NuevaOperacion } from "../domain/operacion";
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

function preparar() {
  const guardadas: NuevaOperacion[] = [];
  const repositorio: RepositorioOperaciones = {
    guardar: async (operacion) => {
      guardadas.push(operacion);
      return { id: "id", consecutivo: guardadas.length };
    },
    listarRecientes: async () => [],
  };
  const casos = crearCasosDeUsoOperaciones(repositorio, {
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
      "lineas.1.pesoKg",
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
