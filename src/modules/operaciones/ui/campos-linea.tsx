"use client";

import { formatearCOP, type Pesos } from "@/shared/dominio/dinero";
import { claseBotonPrimario, claseControl, claseEtiqueta, claseInput } from "@/shared/ui/estilos";
import type { DatosLinea, LineaFormulario } from "./lineas";

type CamposCantidadProps = {
  linea: LineaFormulario;
  indice: number;
  error?: string;
  onCambiar: (cambios: Partial<DatosLinea>) => void;
};

/** Cantidad con su unidad en un solo control; "otra" pide la equivalencia en kg. */
export function CamposCantidad({ linea, indice, error, onCambiar }: CamposCantidadProps) {
  return (
    <div>
      <label htmlFor={`peso-${linea.clave}`} className={claseEtiqueta}>
        Cantidad
      </label>
      <div className="flex">
        <input
          id={`peso-${linea.clave}`}
          name="pesoKg"
          // Texto y no number: permite la coma decimal en cualquier idioma del navegador.
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={linea.pesoKg}
          onChange={(e) => onCambiar({ pesoKg: e.target.value })}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `peso-${linea.clave}-error` : undefined}
          className={`${claseControl} min-w-0 flex-1 rounded-r-none tabular-nums`}
        />
        <select
          name="unidadPeso"
          value={linea.unidadPeso}
          onChange={(e) => onCambiar({ unidadPeso: e.target.value as DatosLinea["unidadPeso"] })}
          className={`${claseControl} w-20 shrink-0 rounded-l-none border-l-0 bg-stone-50`}
          aria-label={`Unidad de la línea ${indice + 1}`}
        >
          <option value="kg">kg</option>
          <option value="lb">lb</option>
          <option value="otra">Otra</option>
        </select>
      </div>
      {linea.unidadPeso === "otra" ? (
        <input
          name="equivalenciaKg"
          type="text"
          inputMode="decimal"
          placeholder="¿Cuántos kg pesa cada unidad?"
          value={linea.equivalenciaKg}
          onChange={(e) => onCambiar({ equivalenciaKg: e.target.value })}
          className={`${claseInput} mt-2`}
          aria-label={`Equivalencia en kg de la línea ${indice + 1}`}
        />
      ) : (
        <input type="hidden" name="equivalenciaKg" value={linea.equivalenciaKg} />
      )}
      {error && (
        <p id={`peso-${linea.clave}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

type CampoPrecioProps = {
  linea: LineaFormulario;
  error?: string;
  ayuda?: string;
  onCambiar: (precioPorKg: string) => void;
};

export function CampoPrecio({ linea, error, ayuda, onCambiar }: CampoPrecioProps) {
  return (
    <div>
      <label htmlFor={`precio-${linea.clave}`} className={claseEtiqueta}>
        Precio por kg
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-500">
          $
        </span>
        <input
          id={`precio-${linea.clave}`}
          name="precioPorKg"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={linea.precioPorKg}
          onChange={(e) => onCambiar(e.target.value.replace(/\D/g, ""))}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `precio-${linea.clave}-error` : undefined}
          className={`${claseInput} pl-7 tabular-nums`}
        />
      </div>
      {ayuda && !error && <p className="mt-1 text-xs text-stone-500">{ayuda}</p>}
      {error && (
        <p id={`precio-${linea.clave}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

type EncabezadoLineaProps = {
  indice: number;
  subtotal: Pesos;
  puedeQuitar: boolean;
  onQuitar: () => void;
};

export function EncabezadoLinea({ indice, subtotal, puedeQuitar, onQuitar }: EncabezadoLineaProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-stone-500">Material {indice + 1}</p>
      <div className="flex items-center gap-1">
        <p className="font-semibold tabular-nums">{formatearCOP(subtotal)}</p>
        {puedeQuitar && (
          <button
            type="button"
            onClick={onQuitar}
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-700"
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
            <span className="sr-only">Quitar material {indice + 1}</span>
          </button>
        )}
      </div>
    </div>
  );
}

type BarraTotalProps = {
  total: Pesos;
  enviando: boolean;
  textoBoton: string;
};

/** Total y botón siempre visibles; en el teléfono quedan justo encima de la barra inferior. */
export function BarraTotal({ total, enviando, textoBoton }: BarraTotalProps) {
  return (
    <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:bottom-4 sm:mx-0 sm:rounded-xl sm:border sm:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <p className="text-stone-600">
          Total
          <strong className="block text-2xl font-bold text-stone-900 tabular-nums">
            {formatearCOP(total)}
          </strong>
        </p>
        <button type="submit" disabled={enviando} className={`${claseBotonPrimario} px-6`}>
          {enviando ? "Guardando…" : textoBoton}
        </button>
      </div>
    </div>
  );
}

export type CorreccionEnCurso = { id: string; consecutivo: number };

type BloqueCorreccionProps = {
  tipo: "compra" | "venta";
  correccion: CorreccionEnCurso;
  error?: string;
};

/** Al corregir, la operación original se anula en el mismo guardado; se exige el motivo. */
export function BloqueCorreccion({ tipo, correccion, error }: BloqueCorreccionProps) {
  return (
    <div className="border-oro-500 bg-oro-100 space-y-3 rounded-xl border p-4">
      <input type="hidden" name="corrigeA" value={correccion.id} />
      <p className="text-sm text-stone-800">
        Estás corrigiendo la {tipo} <strong>N.º {correccion.consecutivo}</strong>. Al guardar, la
        original queda <strong>anulada</strong> y esta la reemplaza.
      </p>
      <div>
        <label htmlFor="motivo" className={claseEtiqueta}>
          Motivo de la corrección
        </label>
        <input
          id="motivo"
          name="motivo"
          required
          maxLength={200}
          placeholder="Ej.: peso mal digitado"
          aria-invalid={Boolean(error)}
          className={claseInput}
        />
        {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
