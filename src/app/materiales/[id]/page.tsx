import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { materiales } from "@/modules/materiales";
import { FormularioMaterial } from "@/modules/materiales/ui/formulario-material";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { guardarMaterialAccion } from "../acciones";
import { exigirSesion } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Editar material" };

export default async function PaginaEditarMaterial({ params }: PageProps<"/materiales/[id]">) {
  await exigirSesion();
  const { id } = await params;
  const material = await materiales.obtenerMaterial(id);
  if (!material) notFound();

  return (
    <>
      <EncabezadoPagina titulo={`Editar ${material.nombre}`} />
      <FormularioMaterial
        accion={guardarMaterialAccion.bind(null, material.id)}
        valoresIniciales={{
          nombre: material.nombre,
          precioCompraMinorista: String(material.precioCompraMinorista),
          precioCompraMayorista: String(material.precioCompraMayorista),
          precioVenta: String(material.precioVenta),
          activo: material.activo,
        }}
      />
    </>
  );
}
