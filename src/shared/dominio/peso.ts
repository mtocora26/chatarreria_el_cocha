import type { Pesos } from "./dinero";

// Peso en gramos enteros para no acumular errores de punto flotante.
// En la BD se guarda en kg como numeric(10,3).
export type Gramos = number;

const GRAMOS_POR_KG = 1000;
const MAXIMO_GRAMOS = 9_999_999_999;

const formatoKg = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/** Acepta "12", "12.5" o "12,5" (hasta 3 decimales). */
export function parsearKg(texto: string): Gramos | null {
  const coincidencia = /^(\d+)(?:[.,](\d{1,3}))?$/.exec(texto.trim());
  if (!coincidencia) return null;
  const [, enteros, decimales = ""] = coincidencia;
  const gramos = Number(enteros) * GRAMOS_POR_KG + Number(decimales.padEnd(3, "0"));
  return gramos <= MAXIMO_GRAMOS ? gramos : null;
}

/** Convierte el texto numeric de PostgreSQL ("1.500", "-2.250") a gramos. */
export function gramosDesdeNumeric(valor: string): Gramos {
  const negativo = valor.startsWith("-");
  const [enteros, decimales = ""] = valor.replace("-", "").split(".");
  const gramos = Number(enteros) * GRAMOS_POR_KG + Number(decimales.padEnd(3, "0").slice(0, 3));
  return negativo ? -gramos : gramos;
}

export function gramosANumeric(gramos: Gramos): string {
  return (gramos / GRAMOS_POR_KG).toFixed(3);
}

export function formatearKg(gramos: Gramos): string {
  return `${formatoKg.format(gramos / GRAMOS_POR_KG)} kg`;
}

/** Subtotal redondeado al peso más cercano (0,5 sube). */
export function calcularSubtotal(gramos: Gramos, precioPorKg: Pesos): Pesos {
  return Math.round((gramos * precioPorKg) / GRAMOS_POR_KG);
}
