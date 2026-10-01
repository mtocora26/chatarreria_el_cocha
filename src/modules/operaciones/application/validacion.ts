import { z } from "zod";
import { parsearPesos } from "@/shared/dominio/dinero";
import { convertirAPesoGramos, type UnidadPeso } from "@/shared/dominio/peso";

export const MAXIMO_LINEAS = 30;

const lineaBase = {
  materialId: z.uuid({ error: "Elige un material." }),
  pesoKg: z.string(),
  unidadPeso: z.enum(["kg", "lb", "otra"]).default("kg"),
  equivalenciaKg: z.string().default("1"),
};

const precioPorKg = z.string().transform((texto, ctx) => {
  if (texto.trim() === "") return null;
  const pesos = parsearPesos(texto);
  if (pesos === null || pesos === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Define un precio por kg mayor que cero para esta línea.",
    });
    return z.NEVER;
  }
  return pesos;
});

const lineaConPeso = z
  .object({ ...lineaBase, precioPorKg: precioPorKg.optional().default(null) })
  .transform((linea, ctx) => {
    const gramos = convertirAPesoGramos(
      linea.pesoKg,
      linea.unidadPeso as UnidadPeso,
      linea.equivalenciaKg,
    );
    if (gramos === null) {
      ctx.addIssue({
        code: "custom",
        path: ["pesoKg"],
        message:
          linea.unidadPeso === "otra"
            ? "Ingresa una equivalencia válida en kg."
            : "Ingresa una cantidad mayor que cero.",
      });
      return z.NEVER;
    }
    return {
      ...linea,
      gramos,
      cantidadPeso: Number(linea.pesoKg.replace(",", ".")),
      equivalenciaKg:
        linea.unidadPeso === "kg"
          ? 1
          : linea.unidadPeso === "lb"
            ? 0.453592
            : Number(linea.equivalenciaKg.replace(",", ".")),
    };
  });

export const esquemaCompra = z.object({
  tarifa: z.enum(["minorista", "mayorista"], { error: "Elige la tarifa." }),
  lineas: z
    .array(lineaConPeso)
    .min(1, "Agrega al menos un material.")
    .max(MAXIMO_LINEAS, `Máximo ${MAXIMO_LINEAS} materiales por operación.`),
});

export const esquemaVenta = z.object({
  lineas: z
    .array(lineaConPeso)
    .min(1, "Agrega al menos un material.")
    .max(MAXIMO_LINEAS, `Máximo ${MAXIMO_LINEAS} materiales por operación.`),
});

// Lo que llega del formulario, todavía sin validar.
export type EntradaVenta = {
  lineas: {
    materialId: string;
    pesoKg: string;
    unidadPeso?: string;
    equivalenciaKg?: string;
    precioPorKg?: string;
  }[];
};

export type EntradaCompra = {
  tarifa: string;
  lineas: {
    materialId: string;
    pesoKg: string;
    unidadPeso?: string;
    equivalenciaKg?: string;
    precioPorKg?: string;
  }[];
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
