"use client";

import { useEffect } from "react";
import { claseBotonPrimario, claseTarjeta } from "@/shared/ui/estilos";

export default function ErrorDePantalla({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className={`${claseTarjeta} mx-auto max-w-md p-6 text-center`}>
      <h1 className="text-lg font-semibold text-stone-900">No pudimos cargar esta pantalla</h1>
      <p className="mt-2 text-sm text-stone-600">
        Tus datos no se perdieron. Intenta de nuevo; si sigue fallando, avisa al administrador.
      </p>
      {error.digest && <p className="mt-2 text-xs text-stone-600">Código: {error.digest}</p>}
      <button type="button" onClick={() => retry()} className={`${claseBotonPrimario} mt-4`}>
        Intentar de nuevo
      </button>
    </div>
  );
}
