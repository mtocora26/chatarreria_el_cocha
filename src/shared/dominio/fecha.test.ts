import { describe, expect, it } from "vitest";
import { diaNegocio, esDiaValido, inicioDiaNegocio, sumarDias } from "./fecha";

describe("fechas del negocio", () => {
  it("una operación a las 11 p. m. de Colombia cuenta en ese mismo día", () => {
    // 2026-09-30 23:00 en Bogotá = 2026-10-01 04:00 UTC
    expect(diaNegocio(new Date("2026-10-01T04:00:00Z"))).toBe("2026-09-30");
  });

  it("el día empieza a medianoche de Colombia", () => {
    expect(inicioDiaNegocio("2026-09-30").toISOString()).toBe("2026-09-30T05:00:00.000Z");
  });

  it("suma días cruzando meses", () => {
    expect(sumarDias("2026-09-30", 1)).toBe("2026-10-01");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
  });

  it.each(["", "2026-13-01", "2026-9-1", "hoy"])("rechaza %j", (dia) => {
    expect(esDiaValido(dia)).toBe(false);
  });
});
