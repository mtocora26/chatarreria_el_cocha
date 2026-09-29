import Link from "next/link";
import { formatearCOP } from "@/shared/dominio/dinero";
import { claseTarjeta } from "@/shared/ui/estilos";
import type { Material } from "../domain/material";

export function TablaMateriales({ materiales }: { materiales: Material[] }) {
  if (materiales.length === 0) {
    return (
      <p className={`${claseTarjeta} p-6 text-center text-stone-600`}>
        Aún no hay materiales. Crea el primero para empezar a registrar compras.
      </p>
    );
  }

  return (
    <div className={`${claseTarjeta} relative overflow-x-auto`}>
      <table className="w-full min-w-xl text-sm">
        <caption className="sr-only">Materiales y precios por kilo en COP</caption>
        <thead className="bg-stone-100 text-left text-stone-700">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Material
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Compra minorista
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Compra mayorista
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Venta
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Estado
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {materiales.map((material) => (
            <tr key={material.id} className={material.activo ? "" : "text-stone-400"}>
              <th scope="row" className="px-4 py-3 text-left font-medium">
                {material.nombre}
              </th>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatearCOP(material.precioCompraMinorista)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatearCOP(material.precioCompraMayorista)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatearCOP(material.precioVenta)}
              </td>
              <td className="px-4 py-3">{material.activo ? "Activo" : "Inactivo"}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/materiales/${material.id}`}
                  className="font-medium text-amber-700 hover:underline"
                >
                  Editar<span className="sr-only"> {material.nombre}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
