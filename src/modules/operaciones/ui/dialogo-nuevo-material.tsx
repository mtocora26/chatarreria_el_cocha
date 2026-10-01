"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Aviso } from "@/shared/ui/aviso";
import {
  claseBotonPrimario,
  claseBotonSecundario,
  claseEtiqueta,
  claseInput,
} from "@/shared/ui/estilos";
import type { MaterialParaCompra } from "./formulario-compra";

export type ResultadoNuevoMaterial =
  | { material: MaterialParaCompra }
  | { inactivo: { id: string; nombre: string } }
  | { error: string };

type DialogoNuevoMaterialProps = {
  nombreInicial: string;
  crear: (nombre: string, precio: string) => Promise<ResultadoNuevoMaterial>;
  reactivar: (id: string) => Promise<ResultadoNuevoMaterial>;
  onCreado: (material: MaterialParaCompra) => void;
  onCerrar: () => void;
};

/**
 * Se monta fuera del formulario de la compra (portal): un formulario no puede ir dentro
 * de otro y Enter aquí no debe registrar la compra.
 */
export function DialogoNuevoMaterial({
  nombreInicial,
  crear,
  reactivar,
  onCreado,
  onCerrar,
}: DialogoNuevoMaterialProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [nombre, setNombre] = useState(nombreInicial);
  const [precio, setPrecio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoNuevoMaterial | null>(null);

  useEffect(() => {
    dialogo.current?.showModal();
  }, []);

  async function ejecutar(accion: () => Promise<ResultadoNuevoMaterial>) {
    setEnviando(true);
    const respuesta = await accion();
    setEnviando(false);
    if ("material" in respuesta) {
      onCreado(respuesta.material);
      return;
    }
    setResultado(respuesta);
  }

  return createPortal(
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      aria-labelledby="nuevo-material-titulo"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-900/50"
    >
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void ejecutar(() => crear(nombre, precio));
        }}
      >
        <h2 id="nuevo-material-titulo" className="text-lg font-semibold">
          Nuevo material
        </h2>
        {resultado && "error" in resultado && <Aviso tipo="error">{resultado.error}</Aviso>}
        {resultado && "inactivo" in resultado ? (
          <div className="space-y-3">
            <p className="text-sm text-stone-700">
              Ya existe <strong>{resultado.inactivo.nombre}</strong>, pero está inactivo. ¿Quieres
              reactivarlo y usarlo en esta compra?
            </p>
            <button
              type="button"
              disabled={enviando}
              onClick={() => void ejecutar(() => reactivar(resultado.inactivo.id))}
              className={`${claseBotonPrimario} w-full`}
            >
              Reactivar {resultado.inactivo.nombre}
            </button>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="nuevo-material-nombre" className={claseEtiqueta}>
                Nombre
              </label>
              <input
                id="nuevo-material-nombre"
                required
                maxLength={80}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={claseInput}
              />
            </div>
            <div>
              <label htmlFor="nuevo-material-precio" className={claseEtiqueta}>
                Precio de compra por kg (opcional)
              </label>
              <input
                id="nuevo-material-precio"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value.replace(/\D/g, ""))}
                className={claseInput}
              />
              <p className="mt-1 text-xs text-stone-500">
                Se usa para minorista y mayorista. El precio de venta se define después en
                Materiales.
              </p>
            </div>
          </>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            className={claseBotonSecundario}
          >
            Cancelar
          </button>
          {!(resultado && "inactivo" in resultado) && (
            <button type="submit" disabled={enviando} className={claseBotonPrimario}>
              {enviando ? "Creando…" : "Crear y usar"}
            </button>
          )}
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
