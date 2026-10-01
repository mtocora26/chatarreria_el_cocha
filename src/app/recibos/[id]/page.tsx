import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { operaciones } from "@/modules/operaciones";
import { BotonImprimir } from "@/modules/operaciones/ui/boton-imprimir";
import { numeroRecibo, Recibo } from "@/modules/operaciones/ui/recibo";
import { Aviso } from "@/shared/ui/aviso";
import { claseBotonSecundario } from "@/shared/ui/estilos";
import { exigirSesion } from "@/server/auth/sesion";

const RUTA_LISTADO = { compra: "/compras", venta: "/ventas" } as const;
const NOMBRE = { compra: "Compra", venta: "Venta" } as const;

async function cargar(id: string) {
  await exigirSesion();
  const operacion = await operaciones.obtenerDetalle(id);
  if (!operacion) notFound();
  return operacion;
}

export async function generateMetadata({ params }: PageProps<"/recibos/[id]">): Promise<Metadata> {
  const operacion = await cargar((await params).id);
  return { title: `Recibo ${numeroRecibo(operacion.consecutivo)}` };
}

export default async function PaginaRecibo({ params, searchParams }: PageProps<"/recibos/[id]">) {
  const [{ id }, { nuevo }] = await Promise.all([params, searchParams]);
  const operacion = await cargar(id);
  const listado = RUTA_LISTADO[operacion.tipo];

  return (
    <>
      <div className="mx-auto max-w-2xl print:hidden">
        {nuevo === "1" && (
          <Aviso tipo="exito">
            {NOMBRE[operacion.tipo]} N.º {operacion.consecutivo} registrada.
          </Aviso>
        )}
        <div className="mb-4 flex flex-wrap gap-3">
          <BotonImprimir />
          <Link href={listado} className={claseBotonSecundario}>
            {nuevo === "1" ? `Registrar otra ${operacion.tipo}` : "Volver"}
          </Link>
        </div>
      </div>
      <Recibo operacion={operacion} />
    </>
  );
}
