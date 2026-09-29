import type { Metadata } from "next";
import { FormularioMaterial } from "@/modules/materiales/ui/formulario-material";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { guardarMaterialAccion } from "../acciones";

export const metadata: Metadata = { title: "Nuevo material" };

export default function PaginaNuevoMaterial() {
  return (
    <>
      <EncabezadoPagina titulo="Nuevo material" />
      <FormularioMaterial accion={guardarMaterialAccion.bind(null, null)} />
    </>
  );
}
