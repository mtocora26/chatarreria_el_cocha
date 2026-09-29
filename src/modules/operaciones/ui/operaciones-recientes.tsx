import { formatearCOP } from "@/shared/dominio/dinero";
import { formatearFechaHora } from "@/shared/dominio/fecha";
import { claseTarjeta } from "@/shared/ui/estilos";
import type { ResumenOperacion } from "../application/casos-de-uso";

type OperacionesRecientesProps = {
  titulo: string;
  operaciones: ResumenOperacion[];
};

export function OperacionesRecientes({ titulo, operaciones }: OperacionesRecientesProps) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-semibold text-stone-900">{titulo}</h2>
      {operaciones.length === 0 ? (
        <p className="text-stone-500">Todavía no hay registros.</p>
      ) : (
        <div className={`${claseTarjeta} relative overflow-x-auto`}>
          <table className="w-full min-w-md text-sm">
            <thead className="bg-stone-100 text-left text-stone-700">
              <tr>
                <th scope="col" className="px-4 py-2 font-semibold">
                  N.º
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-2 font-semibold">
                  Materiales
                </th>
                <th scope="col" className="px-4 py-2 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {operaciones.map((operacion) => (
                <tr key={operacion.id}>
                  <td className="px-4 py-2 tabular-nums">{operacion.consecutivo}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatearFechaHora(operacion.fecha)}
                  </td>
                  <td className="px-4 py-2">{operacion.materiales.join(", ")}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">
                    {formatearCOP(operacion.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
