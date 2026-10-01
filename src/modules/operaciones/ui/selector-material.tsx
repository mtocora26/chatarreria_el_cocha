"use client";

import { useId, useState } from "react";
import { claseInput } from "@/shared/ui/estilos";

export type OpcionMaterial = {
  id: string;
  nombre: string;
  /** Texto secundario: precio o stock. */
  detalle?: string;
  deshabilitado?: boolean;
};

type SelectorMaterialProps = {
  id: string;
  etiqueta: string;
  opciones: OpcionMaterial[];
  valor: string;
  onElegir: (materialId: string) => void;
  /** Si se define, ofrece crear un material con el texto buscado cuando no existe. */
  onCrear?: (nombre: string) => void;
  invalido?: boolean;
};

/** Minúsculas y sin tildes: "cobre" encuentra "Cóbre". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Lista con búsqueda (patrón combobox de ARIA). El id elegido viaja en un campo oculto
 * `materialId` para que el formulario siga funcionando igual que con un <select>.
 */
export function SelectorMaterial({
  id,
  etiqueta,
  opciones,
  valor,
  onElegir,
  onCrear,
  invalido = false,
}: SelectorMaterialProps) {
  const idLista = useId();
  const elegido = opciones.find((o) => o.id === valor);
  const [busqueda, setBusqueda] = useState<string | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const texto = busqueda ?? elegido?.nombre ?? "";
  const consulta = normalizar(busqueda ?? "");
  const filtradas = consulta
    ? opciones.filter((o) => normalizar(o.nombre).includes(consulta))
    : opciones;
  const existeExacta = opciones.some((o) => normalizar(o.nombre) === consulta);
  const puedeCrear = Boolean(onCrear) && consulta !== "" && !existeExacta;
  const total = filtradas.length + (puedeCrear ? 1 : 0);
  const indiceActivo = Math.min(activo, Math.max(total - 1, 0));

  function cerrar() {
    setAbierto(false);
    setBusqueda(null);
  }

  function elegir(indice: number) {
    if (indice < filtradas.length) {
      const opcion = filtradas[indice];
      if (opcion.deshabilitado) return;
      onElegir(opcion.id);
    } else if (puedeCrear) {
      onCrear?.((busqueda ?? "").trim());
    }
    cerrar();
  }

  function alPresionarTecla(evento: React.KeyboardEvent<HTMLInputElement>) {
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        setAbierto(true);
        setActivo(abierto ? (indiceActivo + 1) % Math.max(total, 1) : 0);
        break;
      case "ArrowUp":
        evento.preventDefault();
        setAbierto(true);
        setActivo((indiceActivo - 1 + total) % Math.max(total, 1));
        break;
      case "Enter":
        // Sin esto, Enter enviaría el formulario de la operación.
        if (abierto && total > 0) {
          evento.preventDefault();
          elegir(indiceActivo);
        }
        break;
      case "Escape":
        if (abierto) {
          evento.preventDefault();
          cerrar();
        }
        break;
    }
  }

  const idOpcion = (indice: number) => `${idLista}-${indice}`;

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {etiqueta}
      </label>
      <input type="hidden" name="materialId" value={valor} />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={abierto && total > 0 ? idOpcion(indiceActivo) : undefined}
        aria-invalid={invalido}
        autoComplete="off"
        placeholder="Escribe para buscar…"
        value={texto}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setAbierto(true);
          setActivo(0);
        }}
        onFocus={(e) => {
          e.target.select();
          setAbierto(true);
        }}
        onBlur={cerrar}
        onKeyDown={alPresionarTecla}
        className={claseInput}
      />
      {abierto && (
        <ul
          id={idLista}
          role="listbox"
          aria-label={etiqueta}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
        >
          {filtradas.map((opcion, indice) => (
            <li
              key={opcion.id}
              id={idOpcion(indice)}
              role="option"
              aria-selected={opcion.id === valor}
              aria-disabled={opcion.deshabilitado}
              // mousedown y no click: el clic llega después del blur que cierra la lista.
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(indice);
              }}
              onMouseEnter={() => setActivo(indice)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm ${
                indice === indiceActivo ? "bg-marca-50" : ""
              } ${opcion.deshabilitado ? "cursor-not-allowed text-stone-400" : "text-stone-900"}`}
            >
              <span className={opcion.id === valor ? "font-semibold" : ""}>{opcion.nombre}</span>
              {opcion.detalle && (
                <span className="shrink-0 text-xs text-stone-500 tabular-nums">
                  {opcion.detalle}
                </span>
              )}
            </li>
          ))}
          {puedeCrear && (
            <li
              id={idOpcion(filtradas.length)}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(filtradas.length);
              }}
              onMouseEnter={() => setActivo(filtradas.length)}
              className={`text-marca-700 flex min-h-11 cursor-pointer items-center gap-2 border-t border-stone-100 px-3 py-2 text-sm font-semibold ${
                indiceActivo === filtradas.length ? "bg-marca-50" : ""
              }`}
            >
              <span aria-hidden>＋</span> Crear «{(busqueda ?? "").trim()}»
            </li>
          )}
          {total === 0 && (
            <li className="px-3 py-2 text-sm text-stone-500">No hay materiales con ese nombre.</li>
          )}
        </ul>
      )}
    </div>
  );
}
