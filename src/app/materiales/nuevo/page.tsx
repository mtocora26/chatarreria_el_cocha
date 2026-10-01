import type { Metadata } from "next";
import { FormularioMaterial } from "@/modules/materiales/ui/formulario-material";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { guardarMaterialAccion } from "../acciones";
import { exigirSesion } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Nuevo material" };

export default async function PaginaNuevoMaterial() {
  await exigirSesion();
  return (
    <>
      <EncabezadoPagina titulo="Nuevo material" />
      <FormularioMaterial accion={guardarMaterialAccion.bind(null, null)} />
    </>
  );
}
