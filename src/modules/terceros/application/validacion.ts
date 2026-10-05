import { z } from "zod";

const opcional = (maximo: number) =>
  z
    .string()
    .trim()
    .max(maximo, `Máximo ${maximo} caracteres.`)
    .transform((texto) => (texto === "" ? null : texto));

export const esquemaTercero = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(80, "Máximo 80 caracteres."),
  documento: opcional(30),
  telefono: opcional(30),
  tipo: z.enum(["cliente", "proveedor", "ambos"], { error: "Elige el tipo." }),
});

// El tipo llega como texto del formulario; la validación lo restringe.
export type EntradaTercero = Omit<z.input<typeof esquemaTercero>, "tipo"> & { tipo: string };
export type CampoTercero = keyof EntradaTercero;
