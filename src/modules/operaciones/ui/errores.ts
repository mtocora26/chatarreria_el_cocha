import { useState } from "react";
import type { EstadoFormularioOperacion } from "./estado-formulario";

/**
 * Errores del último envío, ocultando los de campos que el usuario ya corrigió.
 * Las rutas editadas se descartan cuando llega un estado nuevo del servidor.
 */
export function useErroresVisibles(estado: EstadoFormularioOperacion) {
  const [editados, setEditados] = useState({ estado, rutas: new Set<string>() });
  const rutasEditadas = editados.estado === estado ? editados.rutas : new Set<string>();
  const errores = estado.errores ?? {};

  return {
    hayErrores: Object.keys(errores).length > 0,
    error: (ruta: string) => (rutasEditadas.has(ruta) ? undefined : errores[ruta]),
    marcarEditado: (ruta: string) =>
      setEditados({ estado, rutas: new Set(rutasEditadas).add(ruta) }),
  };
}
