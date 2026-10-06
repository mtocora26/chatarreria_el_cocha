import { z } from "zod";
import { parsearPesos } from "@/shared/dominio/dinero";
import { esDiaValido } from "@/shared/dominio/fecha";

export const esquemaMovimiento = z.object({
  fecha: z.string().refine(esDiaValido, "Elige una fecha válida."),
  tipo: z.enum(["aporte", "retiro"], { error: "Elige si es un aporte o un retiro." }),
  monto: z.string().transform((texto, ctx) => {
    const pesos = parsearPesos(texto);
    if (pesos === null || pesos <= 0) {
      ctx.addIssue({ code: "custom", message: "Ingresa un monto en pesos mayor que cero." });
      return z.NEVER;
    }
    return pesos;
  }),
  nota: z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres.")
    .transform((texto) => (texto === "" ? null : texto)),
});

// El tipo llega como texto del formulario; la validación lo restringe.
export type EntradaMovimiento = Omit<z.input<typeof esquemaMovimiento>, "tipo"> & { tipo: string };
export type CampoMovimiento = keyof EntradaMovimiento;

export const esquemaMotivo = z
  .string()
  .trim()
  .min(3, "Escribe el motivo de la anulación.")
  .max(200, "Máximo 200 caracteres.");
