import type { ErroresOperacion } from "../application/validacion";

export type EstadoFormularioOperacion = {
  mensaje?: string;
  errores?: ErroresOperacion;
};

export type AccionFormularioOperacion = (
  estado: EstadoFormularioOperacion,
  formData: FormData,
) => Promise<EstadoFormularioOperacion>;
