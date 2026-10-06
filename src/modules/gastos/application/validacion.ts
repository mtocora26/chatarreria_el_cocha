import { z } from "zod";
import { parsearPesos } from "@/shared/dominio/dinero";
import { esDiaValido } from "@/shared/dominio/fecha";

const opcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `Máximo ${maximo} caracteres.`)
    .transform((texto) => (texto === "" ? null : texto));

export const esquemaGasto = z.object({
  fecha: z.string().refine(esDiaValido, "Elige una fecha válida."),
  categoriaId: z.uuid({ error: "Elige una categoría." }),
  monto: z.string().transform((texto, ctx) => {
    const pesos = parsearPesos(texto);
    if (pesos === null || pesos <= 0) {
      ctx.addIssue({ code: "custom", message: "Ingresa un monto en pesos mayor que cero." });
      return z.NEVER;
    }
    return pesos;
  }),
  descripcion: opcional(200),
  pagadoA: opcional(80),
  medioPago: opcional(40),
});

export type EntradaGasto = z.input<typeof esquemaGasto>;
export type CampoGasto = keyof EntradaGasto;

export const esquemaCategoria = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(60, "Máximo 60 caracteres."),
});

export const esquemaMotivo = z
  .string()
  .trim()
  .min(3, "Escribe el motivo de la anulación.")
  .max(200, "Máximo 200 caracteres.");
