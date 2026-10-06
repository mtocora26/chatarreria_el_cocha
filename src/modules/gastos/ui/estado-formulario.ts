import type { ErroresGasto } from "../application/casos-de-uso";
import type { EntradaGasto } from "../application/validacion";

export type EstadoFormularioGasto = {
  mensaje?: string;
  errores?: ErroresGasto;
  valores?: EntradaGasto;
};
