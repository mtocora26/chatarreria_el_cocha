import type { Metadata } from "next";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";

export const metadata: Metadata = { title: "Ventas" };

export default function PaginaVentas() {
  return (
    <>
      <EncabezadoPagina
        titulo="Ventas"
        descripcion="Registrar material vendido sin dejar stock negativo."
      />
      <p className="text-stone-500">En construcción (I05).</p>
    </>
  );
}
