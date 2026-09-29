import type { Metadata } from "next";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";

export const metadata: Metadata = { title: "Materiales" };

export default function PaginaMateriales() {
  return (
    <>
      <EncabezadoPagina
        titulo="Materiales"
        descripcion="Materiales y precios por kilo de compra y venta."
      />
      <p className="text-stone-500">En construcción (I03).</p>
    </>
  );
}
