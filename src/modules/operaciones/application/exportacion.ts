import { generarCsv } from "@/shared/dominio/csv";
import { formatearFechaHoraIso } from "@/shared/dominio/fecha";
import type { ExistenciaMaterial, LineaExportable } from "./casos-de-uso";

const TIPO = { compra: "Compra", venta: "Venta" } as const;
const ESTADO = { activa: "Activa", anulada: "Anulada" } as const;

export function csvOperaciones(lineas: LineaExportable[]): string {
  return generarCsv(
    [
      "Recibo",
      "Fecha",
      "Tipo",
      "Estado",
      "Tercero",
      "Material",
      "Peso (kg)",
      "Precio por kg",
      "Subtotal",
    ],
    lineas.map((l) => [
      l.consecutivo,
      formatearFechaHoraIso(l.fecha),
      TIPO[l.tipo],
      ESTADO[l.estado],
      l.tercero,
      l.material,
      l.gramos / 1000,
      l.precioPorKg,
      l.subtotal,
    ]),
  );
}

export function csvInventario(existencias: ExistenciaMaterial[]): string {
  return generarCsv(
    ["Material", "Estado", "Disponible (kg)"],
    existencias.map((e) => [e.nombre, e.activo ? "Activo" : "Inactivo", e.stock / 1000]),
  );
}
