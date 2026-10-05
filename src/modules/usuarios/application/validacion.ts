import { z } from "zod";

export const DOMINIO_CORREO_INTERNO = "trabajadores.elcocha.local";

export const esquemaNuevoTrabajador = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(80, "Máximo 80 caracteres."),
  usuario: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, "De 3 a 30 caracteres: letras, números, punto o guion bajo."),
  // Opcional: muchos trabajadores no usan correo; se genera uno interno.
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .refine((valor) => valor === "" || z.email().safeParse(valor).success, "Correo no válido."),
  password: z.string().min(8, "Mínimo 8 caracteres.").max(128, "Máximo 128 caracteres."),
});

export type EntradaNuevoTrabajador = z.input<typeof esquemaNuevoTrabajador>;
export type CampoNuevoTrabajador = keyof EntradaNuevoTrabajador;

export const esquemaNuevaPassword = esquemaNuevoTrabajador.shape.password;

/** Correo con el que se crea la cuenta: el escrito o uno interno derivado del usuario. */
export function correoDeCuenta(usuario: string, correo: string): string {
  return correo === "" ? `${usuario}@${DOMINIO_CORREO_INTERNO}` : correo;
}
