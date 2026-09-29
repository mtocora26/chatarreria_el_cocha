import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { materiales } from "@/modules/materiales";
import { operaciones } from "@/modules/operaciones";
import { FormularioCompra } from "@/modules/operaciones/ui/formulario-compra";
import { OperacionesRecientes } from "@/modules/operaciones/ui/operaciones-recientes";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { registrarCompraAccion } from "./acciones";

export const metadata: Metadata = { title: "Compras" };

export default async function PaginaCompras({ searchParams }: PageProps<"/compras">) {
  await connection();
  const [{ registrada }, activos, recientes] = await Promise.all([
    searchParams,
    materiales.listarMaterialesActivos(),
    operaciones.listarRecientes("compra"),
  ]);

  return (
    <>
      <EncabezadoPagina
        titulo="Compras"
        descripcion="Registrar material comprado con su peso y precio."
      />
      {typeof registrada === "string" && (
        <Aviso tipo="exito">Compra N.º {registrada} registrada.</Aviso>
      )}
      {activos.length === 0 ? (
        <Aviso tipo="error">
          No hay materiales activos.{" "}
          <Link href="/materiales/nuevo" className="font-medium underline">
            Crea un material
          </Link>{" "}
          para registrar compras.
        </Aviso>
      ) : (
        <FormularioCompra
          accion={registrarCompraAccion}
          materiales={activos.map(
            ({ id, nombre, precioCompraMinorista, precioCompraMayorista }) => ({
              id,
              nombre,
              precioCompraMinorista,
              precioCompraMayorista,
            }),
          )}
        />
      )}
      <OperacionesRecientes titulo="Compras recientes" operaciones={recientes} />
    </>
  );
}
