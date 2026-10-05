import { describe, expect, it } from "vitest";
import { seccionesPara } from "./secciones";

const rutas = (esAdmin: boolean) => seccionesPara(esAdmin).map(({ href }) => href);

describe("seccionesPara", () => {
  it("el trabajador solo registra compras y ventas y consulta materiales", () => {
    expect(rutas(false)).toEqual(["/compras", "/ventas", "/materiales", "/terceros"]);
  });

  it("el administrador ve todas las secciones, incluidos inventario, historial y usuarios", () => {
    expect(rutas(true)).toEqual([
      "/compras",
      "/ventas",
      "/inventario",
      "/historial",
      "/materiales",
      "/terceros",
      "/gastos",
      "/capital",
      "/usuarios",
    ]);
  });
});
