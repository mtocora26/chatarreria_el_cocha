import { z } from "zod";
import { parsearPesos } from "@/shared/dominio/dinero";
import { parsearKg } from "@/shared/dominio/peso";

export const MAXIMO_LINEAS = 30;

const pesoKg = z.string().transform((texto, ctx) => {
  const gramos = parsearKg(texto);
  if (gramos === null || gramos === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Ingresa un peso mayor que cero (hasta 3 decimales).",
    });
    return z.NEVER;
  }
  return gramos;
});

const precioPorKg = z.string().transform((texto, ctx) => {
  const pesos = parsearPesos(texto);
  if (pesos === null || pesos === 0) {
    ctx.addIssue({ code: "custom", message: "Ingresa un precio por kilo mayor que cero." });
    return z.NEVER;
  }
  return pesos;
});

const lineaBase = {
  materialId: z.uuid({ error: "Elige un material." }),
  pesoKg,
};

export const esquemaCompra = z.object({
  tarifa: z.enum(["minorista", "mayorista"], { error: "Elige la tarifa." }),
  lineas: z
    .array(z.object(lineaBase))
    .min(1, "Agrega al menos un material.")
    .max(MAXIMO_LINEAS, `Máximo ${MAXIMO_LINEAS} materiales por operación.`),
});

export const esquemaVenta = z.object({
  lineas: z
    .array(z.object({ ...lineaBase, precioPorKg }))
    .min(1, "Agrega al menos un material.")
    .max(MAXIMO_LINEAS, `Máximo ${MAXIMO_LINEAS} materiales por operación.`),
});

// Lo que llega del formulario, todavía sin validar.
export type EntradaVenta = {
  lineas: { materialId: string; pesoKg: string; precioPorKg: string }[];
};

export type EntradaCompra = {
  tarifa: string;
  lineas: { materialId: string; pesoKg: string }[];
};

/** Errores indexados por ruta del campo: "tarifa", "lineas", "lineas.0.pesoKg". */
export type ErroresOperacion = Record<string, string>;

export function erroresPorRuta(error: z.ZodError): ErroresOperacion {
  const errores: ErroresOperacion = {};
  for (const issue of error.issues) {
    errores[issue.path.join(".")] ??= issue.message;
  }
  return errores;
}
