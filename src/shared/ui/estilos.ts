// Clases reutilizadas por formularios y botones; se mantienen aquí para no repetirlas.
// Alto mínimo de 44 px (min-h-11) en todo lo que se toca: se usa mucho desde el teléfono.
const baseBoton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-oro-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export const claseBotonPrimario = `${baseBoton} bg-marca-900 text-white shadow-sm hover:bg-marca-800`;

export const claseBotonSecundario = `${baseBoton} border border-stone-300 bg-white text-stone-700 hover:bg-stone-100`;

export const claseBotonPeligro = `${baseBoton} bg-red-700 text-white shadow-sm hover:bg-red-800`;

export const claseBotonPeligroSecundario = `${baseBoton} border border-red-300 bg-white text-red-700 hover:bg-red-50`;

// Sin ancho: para controles que se combinan en una fila (p. ej. cantidad + unidad).
export const claseControl =
  "block min-h-11 rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-marca-600 focus:ring-2 focus:ring-oro-500/40 focus:outline-none aria-invalid:border-red-500 sm:text-sm";

export const claseInput = `${claseControl} w-full`;

export const claseEtiqueta = "mb-1 block text-sm font-medium text-stone-700";

export const claseTarjeta = "rounded-xl border border-stone-200 bg-white shadow-sm";

export const claseEnlace = "font-medium text-marca-700 underline-offset-2 hover:underline";

export const claseInsignia =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";
