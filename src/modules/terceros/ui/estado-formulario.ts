import type { CampoTercero, EntradaTercero } from "../application/validacion";

export type EstadoFormularioTercero = {
  mensaje?: string;
  errores?: Partial<Record<CampoTercero, string>>;
  // Se devuelven para no borrar lo escrito cuando hay errores.
  valores?: EntradaTercero;
};
