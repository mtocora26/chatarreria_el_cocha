import { describe, expect, it } from "vitest";
import { exito, fallo } from "@/shared/dominio/resultado";
import type { Material } from "../domain/material";
import { crearCasosDeUsoMateriales, type RepositorioMateriales } from "./casos-de-uso";
import type { EntradaMaterial } from "./validacion";

function repositorioEnMemoria(): RepositorioMateriales {
  const guardados: Material[] = [];
  const nombreOcupado = (nombre: string, excepto?: string) =>
    guardados.some((m) => m.id !== excepto && m.nombre.toLowerCase() === nombre.toLowerCase());

  return {
    listar: async (filtro) => guardados.filter((m) => !filtro?.soloActivos || m.activo),
    obtener: async (id) => guardados.find((m) => m.id === id) ?? null,
    async crear(datos) {
      if (nombreOcupado(datos.nombre)) return fallo("nombre_duplicado");
      const material = { ...datos, id: crypto.randomUUID() };
      guardados.push(material);
      return exito(material);
    },
    async actualizar(id, datos) {
      const indice = guardados.findIndex((m) => m.id === id);
      if (indice === -1) return fallo("no_encontrado");
      if (nombreOcupado(datos.nombre, id)) return fallo("nombre_duplicado");
      guardados[indice] = { ...datos, id };
      return exito(guardados[indice]);
    },
  };
}

const entradaValida: EntradaMaterial = {
  nombre: "  Cobre  ",
  precioCompraMinorista: "30000",
  precioCompraMayorista: "31000",
  precioVenta: "34000",
  activo: true,
};

describe("guardarMaterial", () => {
  it("crea un material con precios en pesos y nombre sin espacios sobrantes", async () => {
    const casos = crearCasosDeUsoMateriales(repositorioEnMemoria());

    const resultado = await casos.guardarMaterial(null, entradaValida);

    expect(resultado.ok && resultado.valor).toMatchObject({
      nombre: "Cobre",
      precioCompraMinorista: 30000,
      precioVenta: 34000,
    });
  });

  it("rechaza precios negativos y nombre vacío indicando el campo", async () => {
    const casos = crearCasosDeUsoMateriales(repositorioEnMemoria());

    const resultado = await casos.guardarMaterial(null, {
      ...entradaValida,
      nombre: " ",
      precioVenta: "-5",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok || resultado.error.tipo !== "validacion") throw new Error("se esperaba error");
    expect(Object.keys(resultado.error.errores).sort()).toEqual(["nombre", "precioVenta"]);
  });

  it("informa nombre duplicado", async () => {
    const casos = crearCasosDeUsoMateriales(repositorioEnMemoria());
    await casos.guardarMaterial(null, entradaValida);

    const resultado = await casos.guardarMaterial(null, { ...entradaValida, nombre: "COBRE" });

    expect(resultado).toEqual({ ok: false, error: { tipo: "nombre_duplicado" } });
  });

  it("los inactivos no se listan como disponibles para operaciones", async () => {
    const casos = crearCasosDeUsoMateriales(repositorioEnMemoria());
    await casos.guardarMaterial(null, entradaValida);
    await casos.guardarMaterial(null, { ...entradaValida, nombre: "Bronce", activo: false });

    const activos = await casos.listarMaterialesActivos();

    expect(activos.map((m) => m.nombre)).toEqual(["Cobre"]);
  });

  it("un id inválido se trata como no encontrado sin consultar la base", async () => {
    const casos = crearCasosDeUsoMateriales(repositorioEnMemoria());

    expect(await casos.obtenerMaterial("no-es-uuid")).toBeNull();
    expect(await casos.guardarMaterial("no-es-uuid", entradaValida)).toEqual({
      ok: false,
      error: { tipo: "no_encontrado" },
    });
  });
});
