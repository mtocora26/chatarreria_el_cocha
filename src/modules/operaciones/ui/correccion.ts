import type { DetalleOperacion } from "../application/casos-de-uso";
import type { DatosLinea } from "./lineas";

/** Líneas de una operación guardada, listas para llenar el formulario al corregirla. */
export function lineasParaCorregir(operacion: DetalleOperacion): DatosLinea[] {
  return operacion.lineas.map((linea) => ({
    materialId: linea.materialId,
    pesoKg: String(linea.cantidadPeso).replace(".", ","),
    unidadPeso: linea.unidadPeso,
    equivalenciaKg: String(linea.equivalenciaKg).replace(".", ","),
    precioPorKg: String(linea.precioPorKg),
  }));
}
