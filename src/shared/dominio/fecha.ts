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

// Colombia no tiene horario de verano: el desfase es fijo.
const DESFASE_NEGOCIO = "-05:00";
const DIA = /^\d{4}-\d{2}-\d{2}$/;

const formatoDia = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA_NEGOCIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Día calendario (AAAA-MM-DD) en que ocurrió `fecha` según la hora del negocio. */
export function diaNegocio(fecha: Date): string {
  return formatoDia.format(fecha);
}

export function esDiaValido(dia: string): boolean {
  return DIA.test(dia) && !Number.isNaN(inicioDiaNegocio(dia).getTime());
}

/** Medianoche del día dado en la hora del negocio. */
export function inicioDiaNegocio(dia: string): Date {
  return new Date(`${dia}T00:00:00${DESFASE_NEGOCIO}`);
}

export function sumarDias(dia: string, dias: number): string {
  const fecha = new Date(`${dia}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

const formatoFechaLarga = new Intl.DateTimeFormat("es-CO", {
  timeZone: ZONA_HORARIA_NEGOCIO,
  dateStyle: "full",
});

export function formatearFechaLarga(fecha: Date): string {
  return formatoFechaLarga.format(fecha);
}
