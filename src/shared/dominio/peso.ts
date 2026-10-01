import type { Pesos } from "./dinero";

// Peso en gramos enteros para no acumular errores de punto flotante.
// En la BD se guarda en kg como numeric(10,3).
export type Gramos = number;
export type UnidadPeso = "kg" | "lb" | "otra";

const GRAMOS_POR_KG = 1000;
const MAXIMO_GRAMOS = 9_999_999_999;
const KG_POR_LIBRA = 0.453592;

const formatoKg = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const formatoKgResumido = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const MINIMO_RESUMIDO = 50; // por debajo de 50 g redondearía a "0 kg" aunque haya stock

/** Acepta "12", "12.5" o "12,5" (hasta 3 decimales). */
export function parsearKg(texto: string): Gramos | null {
  const coincidencia = /^(\d+)(?:[.,](\d{1,3}))?$/.exec(texto.trim());
  if (!coincidencia) return null;
  const [, enteros, decimales = ""] = coincidencia;
  const gramos = Number(enteros) * GRAMOS_POR_KG + Number(decimales.padEnd(3, "0"));
  return gramos <= MAXIMO_GRAMOS ? gramos : null;
}

function parsearDecimal(texto: string, maxDecimales: number): number | null {
  const coincidencia = new RegExp(`^(\\d+)(?:[.,](\\d{1,${maxDecimales}}))?$`).exec(texto.trim());
  if (!coincidencia) return null;
  const [, enteros, decimales = ""] = coincidencia;
  return Number(`${enteros}.${decimales || "0"}`);
}

export function convertirAPesoGramos(
  cantidadTexto: string,
  unidad: UnidadPeso,
  equivalenciaKgTexto = "",
): Gramos | null {
  const cantidad = parsearDecimal(cantidadTexto, 3);
  if (cantidad === null || cantidad <= 0) return null;
  const kgPorUnidad =
    unidad === "kg" ? 1 : unidad === "lb" ? KG_POR_LIBRA : parsearDecimal(equivalenciaKgTexto, 6);
  if (kgPorUnidad === null || kgPorUnidad <= 0) return null;
  const gramos = Math.round(cantidad * kgPorUnidad * GRAMOS_POR_KG);
  return gramos > 0 && gramos <= MAXIMO_GRAMOS ? gramos : null;
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

/** Para listados: un decimal como máximo. Recibos y validaciones usan `formatearKg`. */
export function formatearKgResumido(gramos: Gramos): string {
  if (gramos > 0 && gramos < MINIMO_RESUMIDO) return "< 0,1 kg";
  return `${formatoKgResumido.format(gramos / GRAMOS_POR_KG)} kg`;
}

/** Subtotal redondeado al peso más cercano (0,5 sube). */
export function calcularSubtotal(gramos: Gramos, precioPorKg: Pesos): Pesos {
  return Math.round((gramos * precioPorKg) / GRAMOS_POR_KG);
}
