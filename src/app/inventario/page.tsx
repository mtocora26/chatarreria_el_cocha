import type { Metadata } from "next";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";

export const metadata: Metadata = { title: "Inventario" };

export default function PaginaInventario() {
  return (
    <>
      <EncabezadoPagina titulo="Inventario" descripcion="Kilos disponibles de cada material." />
      <p className="text-stone-500">En construcción (I06).</p>
    </>
  );
}
