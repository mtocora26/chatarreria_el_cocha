// Zona horaria del negocio: las fechas se muestran en hora de Colombia sin importar el servidor.
export const ZONA_HORARIA_NEGOCIO = "America/Bogota";

const formatoFechaHora = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA_HORARIA_NEGOCIO,
  dateStyle: "short",
  timeStyle: "short",
});

export function formatearFechaHora(fecha: Date): string {
  return formatoFechaHora.format(fecha);
}
