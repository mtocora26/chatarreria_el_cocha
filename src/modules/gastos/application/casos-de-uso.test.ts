import { describe, expect, it } from "vitest";
import type { DatosGasto } from "../domain/gasto";
import { crearCasosDeUsoGastos, type RepositorioGastos } from "./casos-de-uso";

const CATEGORIA = "7f0c1c8e-8a4e-4f8e-9b1a-1c2d3e4f5a6b";
const INACTIVA = "0e1f2a3b-4c5d-4e6f-8a9b-0c1d2e3f4a5b";

function preparar() {
  const creados: DatosGasto[] = [];
  const filtros: unknown[] = [];
  const repositorio: RepositorioGastos = {
    listar: async (filtro) => {
      filtros.push(filtro);
      return [];
    },
    resumir: async () => ({ total: 0, cantidad: 0, anulados: 0, porCategoria: [] }),
    categoriaActiva: async (id) => id === CATEGORIA,
    crear: async (datos) => {
      creados.push(datos);
      return { id: "g1" };
    },
    anular: async (id) =>
      id === "7f0c1c8e-8a4e-4f8e-9b1a-000000000001" ? "ya_anulado" : "anulado",
    listarCategorias: async () => [],
    crearCategoria: async (nombre) => ({ ok: true, valor: { id: "c1", nombre, activo: true } }),
    cambiarActivoCategoria: async () => true,
  };
  return { casos: crearCasosDeUsoGastos(repositorio), creados, filtros };
}

const valido = {
  fecha: "2026-10-04",
  categoriaId: CATEGORIA,
  monto: "150000",
  descripcion: "",
  pagadoA: "",
  medioPago: "",
};

describe("registrarGasto", () => {
  it("guarda con los opcionales vacíos como null y la fecha al mediodía del negocio", async () => {
    const { casos, creados } = preparar();
    const resultado = await casos.registrarGasto(valido, "u1");
    expect(resultado.ok).toBe(true);
    expect(creados[0]).toMatchObject({
      monto: 150000,
      descripcion: null,
      pagadoA: null,
      medioPago: null,
    });
    expect(creados[0].fecha.toISOString()).toBe("2026-10-04T17:00:00.000Z");
  });

  it("rechaza monto cero, fecha inválida y categoría inexistente", async () => {
    const { casos, creados } = preparar();
    const resultado = await casos.registrarGasto(
      { ...valido, monto: "0", fecha: "ayer", categoriaId: "x" },
      "u1",
    );
    expect(!resultado.ok && Object.keys(resultado.error).sort()).toEqual([
      "categoriaId",
      "fecha",
      "monto",
    ]);
    expect(creados).toHaveLength(0);
  });

  it("rechaza una categoría desactivada", async () => {
    const { casos } = preparar();
    const resultado = await casos.registrarGasto({ ...valido, categoriaId: INACTIVA }, "u1");
    expect(resultado).toEqual({
      ok: false,
      error: { categoriaId: "Esta categoría ya no está disponible." },
    });
  });
});

describe("anularGasto", () => {
  it("exige un motivo y distingue gastos ya anulados", async () => {
    const { casos } = preparar();
    const id = "7f0c1c8e-8a4e-4f8e-9b1a-000000000002";
    expect((await casos.anularGasto(id, { usuarioId: "u", motivo: " " })).ok).toBe(false);
    expect(
      (await casos.anularGasto(id, { usuarioId: "u", motivo: "Error de digitación" })).ok,
    ).toBe(true);
    const repetido = await casos.anularGasto("7f0c1c8e-8a4e-4f8e-9b1a-000000000001", {
      usuarioId: "u",
      motivo: "Duplicado",
    });
    expect(repetido).toEqual({ ok: false, error: { general: "El gasto ya estaba anulado." } });
  });
});

describe("consultarGastos", () => {
  it("convierte el rango de días y ignora filtros inválidos", async () => {
    const { casos, filtros } = preparar();
    await casos.consultarGastos({ desde: "2026-10-01", hasta: "2026-10-03", categoriaId: "no" });
    expect(filtros[0]).toMatchObject({
      desde: new Date("2026-10-01T05:00:00.000Z"),
      hasta: new Date("2026-10-04T05:00:00.000Z"),
      categoriaId: undefined,
    });
  });
});
