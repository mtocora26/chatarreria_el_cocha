import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { materiales } from "@/modules/materiales";
import { operaciones } from "@/modules/operaciones";
import { lineasParaCorregir } from "@/modules/operaciones/ui/correccion";
import { FormularioVenta } from "@/modules/operaciones/ui/formulario-venta";
import { ListaOperaciones } from "@/modules/operaciones/ui/lista-operaciones";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { claseEnlace } from "@/shared/ui/estilos";
import { registrarVentaAccion } from "./acciones";
import { esAdmin, exigirSesion } from "@/server/auth/sesion";
import { medirTiempo } from "@/server/medir-tiempo";

export const metadata: Metadata = { title: "Ventas" };

export default async function PaginaVentas({ searchParams }: PageProps<"/ventas">) {
  const sesion = await medirTiempo("ventas", "sesion", exigirSesion);
  await connection();
  const { corregir } = await searchParams;
  const [activos, stock, recientes, original] = await medirTiempo("ventas", "datos_total", () =>
    Promise.all([
      medirTiempo("ventas", "materiales_activos", () => materiales.listarMaterialesActivos()),
      medirTiempo("ventas", "stock", () => operaciones.consultarStock()),
      medirTiempo("ventas", "ventas_recientes", () => operaciones.listarRecientes("venta")),
      typeof corregir === "string" && esAdmin(sesion)
        ? medirTiempo("ventas", "detalle_correccion", () => operaciones.obtenerDetalle(corregir))
        : Promise.resolve(null),
    ]),
  );
  const corrigiendo = original?.tipo === "venta" && original.estado === "activa" ? original : null;
  // Al corregir, lo vendido en la original vuelve a estar disponible para la nueva.
  for (const linea of corrigiendo?.lineas ?? []) {
    stock.set(linea.materialId, (stock.get(linea.materialId) ?? 0) + linea.gramos);
  }

  return (
    <>
      <EncabezadoPagina
        titulo={corrigiendo ? `Corregir venta N.º ${corrigiendo.consecutivo}` : "Ventas"}
        descripcion="Registrar material vendido sin dejar stock negativo."
      />
      {corregir !== undefined && !corrigiendo && (
        <Aviso tipo="error">Esta venta no se puede corregir: no existe o ya está anulada.</Aviso>
      )}
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
          key={corrigiendo?.id ?? "nueva"}
          accion={registrarVentaAccion}
          materiales={activos.map(({ id, nombre, precioVenta }) => ({
            id,
            nombre,
            precioVenta,
            stock: stock.get(id) ?? 0,
          }))}
          inicial={corrigiendo ? { lineas: lineasParaCorregir(corrigiendo) } : undefined}
          correccion={
            corrigiendo ? { id: corrigiendo.id, consecutivo: corrigiendo.consecutivo } : undefined
          }
        />
      )}
      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-900">Ventas recientes</h2>
          <Link href="/historial?tipo=venta" className={`${claseEnlace} text-sm`}>
            Ver todas
          </Link>
        </div>
        <ListaOperaciones operaciones={recientes} />
      </section>
    </>
  );
}
