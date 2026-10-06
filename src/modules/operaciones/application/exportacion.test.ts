import { describe, expect, it } from "vitest";
import { csvInventario, csvOperaciones } from "./exportacion";

const sinBom = (csv: string) => csv.replace("﻿", "");

describe("csvOperaciones", () => {
  it("escribe una fila por línea con fecha en hora de Colombia y peso en kg", () => {
    const csv = sinBom(
      csvOperaciones([
        {
          consecutivo: 7,
          fecha: new Date("2026-10-06T15:30:00Z"),
          tipo: "compra",
          estado: "anulada",
          tercero: "Juan; Pérez",
          material: "Cobre",
          gramos: 1500,
          precioPorKg: 30000,
          subtotal: 45000,
        },
      ]),
    );
    expect(csv.split("\r\n")).toEqual([
      "Recibo;Fecha;Tipo;Estado;Tercero;Material;Peso (kg);Precio por kg;Subtotal",
      '7;2026-10-06 10:30;Compra;Anulada;"Juan; Pérez";Cobre;1,5;30000;45000',
      "",
    ]);
  });

  it("sin líneas deja solo los encabezados", () => {
    expect(sinBom(csvOperaciones([])).split("\r\n")).toHaveLength(2);
  });
});

describe("csvInventario", () => {
  it("exporta el stock en kg y marca los inactivos", () => {
    const csv = sinBom(
      csvInventario([
        { id: "1", nombre: "Cobre", activo: true, stock: 12250 },
        { id: "2", nombre: "Bronce", activo: false, stock: 0 },
      ]),
    );
    expect(csv).toBe(
      "Material;Estado;Disponible (kg)\r\nCobre;Activo;12,25\r\nBronce;Inactivo;0\r\n",
    );
  });
});
