import { formatearKg } from "@/shared/dominio/peso";
import { claseTarjeta } from "@/shared/ui/estilos";
import type { ExistenciaMaterial } from "../application/casos-de-uso";

export function TablaInventario({ existencias }: { existencias: ExistenciaMaterial[] }) {
  if (existencias.length === 0) {
    return (
      <p className={`${claseTarjeta} p-6 text-center text-stone-600`}>
        Aún no hay materiales registrados.
      </p>
    );
  }

  return (
    <div className={`${claseTarjeta} relative overflow-x-auto`}>
      <table className="w-full text-sm">
        <caption className="sr-only">Stock disponible por material en kilogramos</caption>
        <thead className="bg-stone-100 text-left text-stone-700">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Material
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Disponible
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {existencias.map((existencia) => (
            <tr key={existencia.id} className={existencia.activo ? "" : "text-stone-400"}>
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {existencia.nombre}
                {!existencia.activo && <span className="ml-2 text-xs font-normal">(inactivo)</span>}
              </th>
              <td
                className={`px-4 py-3 text-right tabular-nums ${existencia.stock === 0 ? "text-stone-400" : "font-semibold"}`}
              >
                {formatearKg(existencia.stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
