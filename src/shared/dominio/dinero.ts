// Dinero en pesos colombianos enteros. En la BD se guarda como numeric(14,2).
export type Pesos = number;

const MAXIMO_PESOS = 999_999_999_999;

const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatearCOP(pesos: Pesos): string {
  return formatoCOP.format(pesos);
}

/** Acepta solo dígitos (el navegador ya entrega el valor sin separadores). */
export function parsearPesos(texto: string): Pesos | null {
  const limpio = texto.trim();
  if (!/^\d+$/.test(limpio)) return null;
  const pesos = Number(limpio);
  return pesos <= MAXIMO_PESOS ? pesos : null;
}

/** Convierte el texto numeric de PostgreSQL ("3500.00") a pesos enteros. */
export function pesosDesdeNumeric(valor: string): Pesos {
  return Math.round(Number(valor));
}

export function pesosANumeric(pesos: Pesos): string {
  return pesos.toFixed(2);
}
