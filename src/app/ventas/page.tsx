import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { materiales } from "@/modules/materiales";
import { operaciones } from "@/modules/operaciones";
import { FormularioVenta } from "@/modules/operaciones/ui/formulario-venta";
import { OperacionesRecientes } from "@/modules/operaciones/ui/operaciones-recientes";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { registrarVentaAccion } from "./acciones";
import { exigirSesion } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Ventas" };

export default async function PaginaVentas() {
  await exigirSesion();
  await connection();
  const [activos, stock, recientes] = await Promise.all([
    materiales.listarMaterialesActivos(),
    operaciones.consultarStock(),
    operaciones.listarRecientes("venta"),
  ]);

  return (
    <>
      <EncabezadoPagina
        titulo="Ventas"
        descripcion="Registrar material vendido sin dejar stock negativo."
      />
      {activos.length === 0 ? (
        <Aviso tipo="error">
          No hay materiales activos.{" "}
          <Link href="/materiales/nuevo" className="font-medium underline">
            Crea un material
          </Link>{" "}
          y registra compras antes de vender.
        </Aviso>
      ) : (
        <FormularioVenta
          accion={registrarVentaAccion}
          materiales={activos.map(({ id, nombre, precioVenta }) => ({
            id,
            nombre,
            precioVenta,
            stock: stock.get(id) ?? 0,
          }))}
        />
      )}
      <OperacionesRecientes titulo="Ventas recientes" operaciones={recientes} />
    </>
  );
}
