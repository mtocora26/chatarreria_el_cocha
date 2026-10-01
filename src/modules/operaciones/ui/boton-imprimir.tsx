"use client";

import { claseBotonPrimario } from "@/shared/ui/estilos";

export function BotonImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className={claseBotonPrimario}>
      Imprimir
    </button>
  );
}
