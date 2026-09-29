import { formatearCOP } from "@/shared/dominio/dinero";
import { formatearFechaHora } from "@/shared/dominio/fecha";
import { formatearKg } from "@/shared/dominio/peso";
import type { DetalleOperacion } from "../application/casos-de-uso";

export const NOMBRE_NEGOCIO = "Chatarrería El Cocha";

const TITULOS = { compra: "Recibo interno de compra", venta: "Recibo interno de venta" } as const;

export function numeroRecibo(consecutivo: number): string {
  return String(consecutivo).padStart(6, "0");
}

export function Recibo({ operacion }: { operacion: DetalleOperacion }) {
  const tarifa = operacion.lineas.find((l) => l.tarifa)?.tarifa;

  return (
    <article className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-6 text-stone-900 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none">
      <header className="border-b border-stone-300 pb-4">
        <p className="text-xl font-bold">{NOMBRE_NEGOCIO}</p>
        <h1 className="mt-1 text-lg font-semibold">{TITULOS[operacion.tipo]}</h1>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-stone-600">N.º interno</dt>
          <dd className="font-mono font-semibold">{numeroRecibo(operacion.consecutivo)}</dd>
          <dt className="text-stone-600">Fecha</dt>
          <dd>{formatearFechaHora(operacion.fecha)}</dd>
          {tarifa && (
            <>
              <dt className="text-stone-600">Tarifa</dt>
              <dd className="capitalize">{tarifa}</dd>
            </>
          )}
        </dl>
        {operacion.estado === "anulada" && (
          <p className="mt-3 rounded border-2 border-red-700 px-3 py-1 text-center font-bold tracking-widest text-red-700 uppercase">
            Anulada
          </p>
        )}
      </header>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-left">
            <th scope="col" className="py-2 pr-2 font-semibold">
              Material
            </th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">
              Kilos
            </th>
            <th scope="col" className="px-2 py-2 text-right font-semibold">
              Precio/kg
            </th>
            <th scope="col" className="py-2 pl-2 text-right font-semibold">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {operacion.lineas.map((linea, indice) => (
            <tr key={indice} className="border-b border-stone-200">
              <td className="py-2 pr-2">{linea.material}</td>
              <td className="px-2 py-2 text-right whitespace-nowrap tabular-nums">
                {formatearKg(linea.gramos)}
              </td>
              <td className="px-2 py-2 text-right whitespace-nowrap tabular-nums">
                {formatearCOP(linea.precioPorKg)}
              </td>
              <td className="py-2 pl-2 text-right whitespace-nowrap tabular-nums">
                {formatearCOP(linea.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3} className="pt-3 text-right text-base font-semibold">
              Total
            </th>
            <td className="pt-3 pl-2 text-right text-base font-bold whitespace-nowrap tabular-nums">
              {formatearCOP(operacion.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <p className="mt-6 border-t border-stone-300 pt-3 text-xs text-stone-600">
        Documento de control interno. No es factura electrónica ni documento equivalente POS
        electrónico, y no ha sido validado por la DIAN.
      </p>
    </article>
  );
}
