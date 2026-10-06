import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { terceros } from "@/modules/terceros";
import { FormularioTercero } from "@/modules/terceros/ui/formulario-tercero";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { guardarTerceroAccion } from "../acciones";
import { exigirAdminPagina } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Editar tercero" };

export default async function PaginaEditarTercero({ params }: PageProps<"/terceros/[id]">) {
  await exigirAdminPagina();
  await connection();
  const { id } = await params;
  const tercero = await terceros.obtenerTercero(id);
  if (!tercero) notFound();

  return (
    <>
      <EncabezadoPagina titulo={`Editar ${tercero.nombre}`} />
      <p className="mb-4 max-w-xl text-sm text-stone-600">
        Cambiar los datos no altera las compras y ventas ya registradas: solo cambia el nombre con
        que se muestran.
      </p>
      <FormularioTercero
        accion={guardarTerceroAccion.bind(null, tercero.id)}
        valoresIniciales={{
          nombre: tercero.nombre,
          tipo: tercero.tipo,
          documento: tercero.documento ?? "",
          telefono: tercero.telefono ?? "",
        }}
      />
    </>
  );
}
