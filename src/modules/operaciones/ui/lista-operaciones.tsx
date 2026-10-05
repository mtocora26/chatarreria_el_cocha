import Link from "next/link";
import { formatearCOP } from "@/shared/dominio/dinero";
import { formatearFechaHora } from "@/shared/dominio/fecha";
import { claseInsignia, claseTarjeta } from "@/shared/ui/estilos";
import type { ResumenOperacion } from "../application/casos-de-uso";

type ListaOperacionesProps = {
  operaciones: ResumenOperacion[];
  /** Muestra si es compra o venta; sobra en las páginas de un solo tipo. */
  mostrarTipo?: boolean;
  vacio?: string;
};

export const ETIQUETA_TIPO = { compra: "Compra", venta: "Venta" } as const;

export const ESTILO_TIPO = {
  compra: "bg-marca-100 text-marca-800",
  venta: "bg-oro-100 text-oro-600",
} as const;

/**
 * Una sola lista que cambia de forma: tarjetas en el teléfono y columnas en pantallas
 * anchas, sin desplazamiento horizontal. Cada fila abre el recibo.
 */
export function ListaOperaciones({
  operaciones,
  mostrarTipo = false,
  vacio = "Todavía no hay registros.",
}: ListaOperacionesProps) {
  if (operaciones.length === 0) {
    return <p className={`${claseTarjeta} p-6 text-center text-stone-500`}>{vacio}</p>;
  }

  const columnas = mostrarTipo
    ? "sm:grid-cols-[9rem_5.5rem_10rem_minmax(0,1fr)_8rem]"
    : "sm:grid-cols-[9rem_10rem_minmax(0,1fr)_8rem]";

  return (
    <div className={`${claseTarjeta} overflow-hidden`}>
      <div
        aria-hidden
        className={`hidden gap-4 bg-stone-100 px-4 py-2 text-xs font-semibold tracking-wide text-stone-600 uppercase sm:grid ${columnas}`}
      >
        <span>N.º</span>
        {mostrarTipo && <span>Tipo</span>}
        <span>Fecha</span>
        <span>Materiales</span>
        <span className="text-right">Total</span>
      </div>
      <ul className="divide-y divide-stone-200">
        {operaciones.map((operacion) => {
          const anulada = operacion.estado === "anulada";
          return (
            <li key={operacion.id}>
              <Link
                href={`/recibos/${operacion.id}`}
                className={`hover:bg-marca-50 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-4 py-3 transition-colors sm:items-center ${columnas} ${anulada ? "text-stone-400" : ""}`}
              >
                <span className="flex items-center gap-2 font-semibold whitespace-nowrap tabular-nums">
                  N.º {operacion.consecutivo}
                  {anulada && (
                    <span className={`${claseInsignia} bg-red-100 text-red-800`}>Anulada</span>
                  )}
                  {mostrarTipo && (
                    <span className={`${claseInsignia} ${ESTILO_TIPO[operacion.tipo]} sm:hidden`}>
                      {ETIQUETA_TIPO[operacion.tipo]}
                    </span>
                  )}
                </span>
                {mostrarTipo && (
                  <span className="hidden sm:block">
                    <span className={`${claseInsignia} ${ESTILO_TIPO[operacion.tipo]}`}>
                      {ETIQUETA_TIPO[operacion.tipo]}
                    </span>
                  </span>
                )}
                <span className="col-start-1 text-sm whitespace-nowrap text-stone-500 sm:col-start-auto sm:text-stone-700">
                  {formatearFechaHora(operacion.fecha)}
                </span>
                <span className="col-span-2 truncate text-sm sm:col-span-1">
                  {operacion.tercero && <span className="font-medium">{operacion.tercero} · </span>}
                  {operacion.materiales.join(", ")}
                </span>
                <span
                  className={`col-start-2 row-start-1 text-right font-semibold tabular-nums sm:col-start-auto sm:row-start-auto ${anulada ? "line-through" : ""}`}
                >
                  {formatearCOP(operacion.total)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
