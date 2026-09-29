import { z } from "zod";
import { parsearPesos } from "@/shared/dominio/dinero";

const LARGO_MAXIMO_NOMBRE = 80;

const precioPorKg = z.string().transform((texto, ctx) => {
  const pesos = parsearPesos(texto);
  if (pesos === null) {
    ctx.addIssue({ code: "custom", message: "Ingresa un valor en pesos, entero y sin negativos." });
    return z.NEVER;
  }
  return pesos;
});

export const esquemaMaterial = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(LARGO_MAXIMO_NOMBRE, `Máximo ${LARGO_MAXIMO_NOMBRE} caracteres.`),
  precioCompraMinorista: precioPorKg,
  precioCompraMayorista: precioPorKg,
  precioVenta: precioPorKg,
  activo: z.boolean(),
});

export type EntradaMaterial = z.input<typeof esquemaMaterial>;
export type CampoMaterial = keyof EntradaMaterial;
