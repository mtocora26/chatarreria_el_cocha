import type { Metadata } from "next";
import { FormularioTercero } from "@/modules/terceros/ui/formulario-tercero";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { guardarTerceroAccion } from "../acciones";
import { exigirSesion } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Nuevo tercero" };

export default async function PaginaNuevoTercero() {
  await exigirSesion();
  return (
    <>
      <EncabezadoPagina titulo="Nuevo tercero" />
      <FormularioTercero accion={guardarTerceroAccion.bind(null, null)} />
    </>
  );
}
