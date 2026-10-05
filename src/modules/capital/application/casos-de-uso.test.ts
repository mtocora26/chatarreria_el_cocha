import { describe, expect, it } from "vitest";
import { SIN_FLUJOS, type Flujos } from "../domain/saldo";
import {
  crearCasosDeUsoCapital,
  type DatosMovimiento,
  type RepositorioCapital,
} from "./casos-de-uso";

function preparar(
  antes: Partial<Flujos> = {},
  porDia: { dia: string; flujos: Partial<Flujos> }[] = [],
) {
  const creados: DatosMovimiento[] = [];
  const consultas: unknown[] = [];
  const repositorio: RepositorioCapital = {
    sumarFlujos: async (hasta) => {
      consultas.push(hasta);
      return { ...SIN_FLUJOS, ...antes };
    },
    flujosPorDia: async () =>
      porDia.map((d) => ({ dia: d.dia, flujos: { ...SIN_FLUJOS, ...d.flujos } })),
    listarMovimientos: async () => [],
    crearMovimiento: async (datos) => {
      creados.push(datos);
      return { id: "m1" };
    },
    anularMovimiento: async (id) =>
      id === "7f0c1c8e-8a4e-4f8e-9b1a-000000000001" ? "ya_anulado" : "anulado",
  };
  return { casos: crearCasosDeUsoCapital(repositorio), creados, consultas };
}

describe("registrarMovimiento", () => {
  it("guarda un aporte con la nota vacía como null y la fecha al mediodía del negocio", async () => {
    const { casos, creados } = preparar();
    const resultado = await casos.registrarMovimiento(
      { fecha: "2026-10-04", tipo: "aporte", monto: "20000000", nota: "" },
      "u1",
    );
    expect(resultado.ok).toBe(true);
    expect(creados[0]).toMatchObject({ tipo: "aporte", monto: 20_000_000, nota: null });
    expect(creados[0].fecha.toISOString()).toBe("2026-10-04T17:00:00.000Z");
  });

  it("rechaza monto cero, tipo inválido y fecha inválida", async () => {
    const { casos, creados } = preparar();
    const resultado = await casos.registrarMovimiento(
      { fecha: "x", tipo: "otro", monto: "0", nota: "" },
      "u1",
    );
    expect(!resultado.ok && Object.keys(resultado.error).sort()).toEqual([
      "fecha",
      "monto",
      "tipo",
    ]);
    expect(creados).toHaveLength(0);
  });
});

describe("anularMovimiento", () => {
  it("exige motivo y distingue los ya anulados", async () => {
    const { casos } = preparar();
    expect(
      (
        await casos.anularMovimiento("7f0c1c8e-8a4e-4f8e-9b1a-000000000002", {
          usuarioId: "u",
          motivo: "",
        })
      ).ok,
    ).toBe(false);
    expect(
      await casos.anularMovimiento("7f0c1c8e-8a4e-4f8e-9b1a-000000000001", {
        usuarioId: "u",
        motivo: "Duplicado",
      }),
    ).toEqual({
      ok: false,
      error: "El movimiento ya estaba anulado.",
    });
  });
});

describe("consultarEvolucion", () => {
  it("parte del saldo anterior al período y acumula día a día", async () => {
    const { casos, consultas } = preparar({ aporte: 1000, venta: 500, compra: 200 }, [
      { dia: "2026-10-03", flujos: { gasto: 100 } },
      { dia: "2026-10-04", flujos: { venta: 50 } },
    ]);
    const evolucion = await casos.consultarEvolucion({}, "2026-10-04");
    expect(evolucion.desde).toBe("2026-09-05");
    expect(evolucion.saldoInicial).toBe(1300);
    expect(evolucion.dias.map((d) => d.saldo)).toEqual([1200, 1250]);
    expect(evolucion.saldoFinal).toBe(1250);
    expect(consultas[0]).toEqual(new Date("2026-09-05T05:00:00.000Z"));
  });

  it("sin movimientos el saldo final es el inicial", async () => {
    const { casos } = preparar({ aporte: 700 });
    const evolucion = await casos.consultarEvolucion(
      { desde: "2026-10-01", hasta: "2026-10-02" },
      "2026-10-04",
    );
    expect(evolucion).toMatchObject({ saldoInicial: 700, saldoFinal: 700, dias: [] });
  });
});
