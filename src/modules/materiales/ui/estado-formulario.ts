import type { CampoMaterial, EntradaMaterial } from "../application/validacion";

export type EstadoFormularioMaterial = {
  mensaje?: string;
  errores?: Partial<Record<CampoMaterial, string>>;
  // Se devuelven para no borrar lo escrito cuando hay errores.
  valores?: EntradaMaterial;
};
