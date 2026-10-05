"use client";

import { useActionState, useEffect, useRef } from "react";
import { Aviso } from "./aviso";
import { claseBotonPeligro, claseBotonPrimario, claseBotonSecundario } from "./estilos";

/** Estado de una acción confirmada: redirige si sale bien, o devuelve `hecho` para cerrar el diálogo en la misma página. */
export type EstadoAccionConfirmada = { error?: string; hecho?: boolean };

type DialogoConfirmacionProps = {
  textoBoton: string;
  claseBoton: string;
  titulo: string;
  textoConfirmar: string;
  accion: (estado: EstadoAccionConfirmada, formData: FormData) => Promise<EstadoAccionConfirmada>;
  peligro?: boolean;
  /** Texto y campos adicionales del formulario (p. ej. el motivo). */
  children?: React.ReactNode;
};

export function DialogoConfirmacion({
  textoBoton,
  claseBoton,
  titulo,
  textoConfirmar,
  accion,
  peligro = false,
  children,
}: DialogoConfirmacionProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const [estado, enviar, enviando] = useActionState(accion, {});

  useEffect(() => {
    if (estado.hecho) {
      dialogo.current?.close();
      formulario.current?.reset();
    }
  }, [estado]);

  return (
    <>
      <button type="button" onClick={() => dialogo.current?.showModal()} className={claseBoton}>
        {textoBoton}
      </button>
      <dialog
        ref={dialogo}
        aria-labelledby={`${titulo}-titulo`}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-900/50"
      >
        <form ref={formulario} action={enviar} className="space-y-4 p-5">
          <h2 id={`${titulo}-titulo`} className="text-lg font-semibold">
            {titulo}
          </h2>
          {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
          <div className="space-y-3 text-sm text-stone-700">{children}</div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              className={claseBotonSecundario}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className={peligro ? claseBotonPeligro : claseBotonPrimario}
            >
              {enviando ? "Procesando…" : textoConfirmar}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
