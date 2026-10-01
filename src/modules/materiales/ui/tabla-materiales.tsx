import Link from "next/link";
import { formatearCOP, type Pesos } from "@/shared/dominio/dinero";
import { claseInsignia, claseTarjeta } from "@/shared/ui/estilos";
import type { Material } from "../domain/material";

const precio = (valor: Pesos | null) => (valor === null ? "—" : formatearCOP(valor));

const COLUMNAS = "sm:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_5rem]";

export function TablaMateriales({ materiales }: { materiales: Material[] }) {
  if (materiales.length === 0) {
    return (
      <p className={`${claseTarjeta} p-6 text-center text-stone-600`}>
        Aún no hay materiales. Crea el primero para empezar a registrar compras.
      </p>
    );
  }

  return (
    <div className={`${claseTarjeta} overflow-hidden`}>
      <div
        aria-hidden
        className={`hidden gap-4 bg-stone-100 px-4 py-2 text-xs font-semibold tracking-wide text-stone-600 uppercase sm:grid ${COLUMNAS}`}
      >
        <span>Material</span>
        <span className="text-right">Compra minorista</span>
        <span className="text-right">Compra mayorista</span>
        <span className="text-right">Venta</span>
        <span />
      </div>
      <ul className="divide-y divide-stone-200">
        {materiales.map((material) => (
          <li key={material.id}>
            <Link
              href={`/materiales/${material.id}`}
              className={`hover:bg-marca-50 grid grid-cols-3 gap-x-4 gap-y-1 px-4 py-3 transition-colors sm:items-center ${COLUMNAS} ${material.activo ? "" : "text-stone-400"}`}
            >
              <span className="col-span-3 flex items-center gap-2 font-semibold sm:col-span-1">
                {material.nombre}
                {!material.activo && (
                  <span className={`${claseInsignia} bg-stone-100 text-stone-600`}>Inactivo</span>
                )}
              </span>
              <span className="text-sm tabular-nums sm:text-right">
                <span className="block text-xs text-stone-500 sm:hidden">Minorista</span>
                {precio(material.precioCompraMinorista)}
              </span>
              <span className="text-sm tabular-nums sm:text-right">
                <span className="block text-xs text-stone-500 sm:hidden">Mayorista</span>
                {precio(material.precioCompraMayorista)}
              </span>
              <span className="text-sm tabular-nums sm:text-right">
                <span className="block text-xs text-stone-500 sm:hidden">Venta</span>
                {precio(material.precioVenta)}
              </span>
              <span className="text-marca-700 hidden text-right text-sm font-medium sm:block">
                Editar
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
