import type { Metadata } from "next";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";

export const metadata: Metadata = { title: "Compras" };

export default function PaginaCompras() {
  return (
    <>
      <EncabezadoPagina
        titulo="Compras"
        descripcion="Registrar material comprado con su peso y precio."
      />
      <p className="text-stone-500">En construcción (I04).</p>
    </>
  );
}
