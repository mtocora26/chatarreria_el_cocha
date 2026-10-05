import { describe, expect, it } from "vitest";
import type { Tercero } from "../domain/tercero";
import { crearCasosDeUsoTerceros, type RepositorioTerceros } from "./casos-de-uso";

const ID = "7f0c1c8e-8a4e-4f8e-9b1a-1c2d3e4f5a6b";

function preparar() {
  const guardados: Tercero[] = [];
  const filtros: unknown[] = [];
  const repositorio: RepositorioTerceros = {
    listar: async (filtro) => {
      filtros.push(filtro);
      return guardados;
    },
    obtener: async (id) => guardados.find((t) => t.id === id) ?? null,
    crear: async (datos) => {
      const tercero = { id: ID, ...datos };
      guardados.push(tercero);
      return tercero;
    },
    actualizar: async (id, datos) => {
      const indice = guardados.findIndex((t) => t.id === id);
      if (indice < 0) return null;
      guardados[indice] = { id, ...datos };
      return guardados[indice];
    },
  };
  return { casos: crearCasosDeUsoTerceros(repositorio), guardados, filtros };
}

describe("guardarTercero", () => {
  it("crea un tercero y deja vacíos el documento y el teléfono opcionales", async () => {
    const { casos } = preparar();
    const resultado = await casos.guardarTercero(null, {
      nombre: "  Juan Pérez ",
      documento: " ",
      telefono: "",
      tipo: "proveedor",
    });
    expect(resultado).toEqual({
      ok: true,
      valor: { id: ID, nombre: "Juan Pérez", documento: null, telefono: null, tipo: "proveedor" },
    });
  });

  it("rechaza nombre vacío y tipo inválido", async () => {
    const { casos } = preparar();
    const resultado = await casos.guardarTercero(null, {
      nombre: " ",
      documento: "",
      telefono: "",
      tipo: "otro",
    });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok && resultado.error.tipo === "validacion") {
      expect(Object.keys(resultado.error.errores).sort()).toEqual(["nombre", "tipo"]);
    }
  });

  it("actualiza un tercero existente y avisa si no existe", async () => {
    const { casos } = preparar();
    await casos.guardarTercero(null, {
      nombre: "Ana",
      documento: "",
      telefono: "",
      tipo: "cliente",
    });
    const editado = await casos.guardarTercero(ID, {
      nombre: "Ana Gómez",
      documento: "123",
      telefono: "300",
      tipo: "ambos",
    });
    expect(editado.ok && editado.valor.nombre).toBe("Ana Gómez");

    const inexistente = await casos.guardarTercero("no-es-un-id", {
      nombre: "X",
      documento: "",
      telefono: "",
      tipo: "cliente",
    });
    expect(inexistente).toEqual({ ok: false, error: { tipo: "no_encontrado" } });
  });
});

describe("listarTerceros", () => {
  it("ignora tipos inválidos y recorta la búsqueda", async () => {
    const { casos, filtros } = preparar();
    await casos.listarTerceros({ busqueda: "  juan ", tipo: "cualquiera" });
    await casos.listarTerceros({ busqueda: "  ", tipo: "cliente" });
    expect(filtros).toEqual([
      { busqueda: "juan", tipo: undefined },
      { busqueda: undefined, tipo: "cliente" },
    ]);
  });
});
