import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { materiales } from "@/modules/materiales";
import { TablaMateriales } from "@/modules/materiales/ui/tabla-materiales";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { claseBotonPrimario } from "@/shared/ui/estilos";

export const metadata: Metadata = { title: "Materiales" };

const MENSAJES_GUARDADO: Record<string, string> = {
  creado: "Material creado.",
  actualizado: "Cambios guardados.",
};

export default async function PaginaMateriales({ searchParams }: PageProps<"/materiales">) {
  await connection();
  const [{ guardado }, lista] = await Promise.all([searchParams, materiales.listarMateriales()]);
  const mensaje = typeof guardado === "string" ? MENSAJES_GUARDADO[guardado] : undefined;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <EncabezadoPagina
          titulo="Materiales"
          descripcion="Materiales y precios por kilo de compra y venta."
        />
        <Link href="/materiales/nuevo" className={claseBotonPrimario}>
          Nuevo material
        </Link>
      </div>
      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}
      <TablaMateriales materiales={lista} />
    </>
  );
}
