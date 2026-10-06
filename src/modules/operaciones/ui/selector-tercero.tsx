"use client";

import { SelectorMaterial, type OpcionMaterial } from "./selector-material";

type SelectorTerceroProps = {
  tipo: "compra" | "venta";
  opciones: OpcionMaterial[];
  valor: string;
  onElegir: (terceroId: string) => void;
  error?: string;
};

/** Cliente o proveedor de la operación; es opcional y se puede quitar. */
export function SelectorTercero({ tipo, opciones, valor, onElegir, error }: SelectorTerceroProps) {
  const etiqueta = tipo === "compra" ? "Proveedor (opcional)" : "Cliente (opcional)";
  return (
    <div>
      <SelectorMaterial
        id="tercero"
        etiqueta={etiqueta}
        opciones={opciones}
        valor={valor}
        onElegir={onElegir}
        nombreCampo="terceroId"
        placeholder="Sin tercero · escribe para buscar…"
        sinResultados={`No hay ${tipo === "compra" ? "proveedores" : "clientes"} con ese nombre.`}
        invalido={Boolean(error)}
      />
      <div className="mt-1 flex items-center justify-between gap-3 text-sm">
        {error ? <p className="text-red-700">{error}</p> : <span />}
        {valor && (
          <button
            type="button"
            onClick={() => onElegir("")}
            className="text-marca-700 min-h-8 font-medium underline-offset-2 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>
    </div>
  );
}
