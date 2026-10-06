import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { materiales } from "@/modules/materiales";
import { sirvePara, terceros } from "@/modules/terceros";
import { operaciones } from "@/modules/operaciones";
import { lineasParaCorregir } from "@/modules/operaciones/ui/correccion";
import { FormularioCompra } from "@/modules/operaciones/ui/formulario-compra";
import { ListaOperaciones } from "@/modules/operaciones/ui/lista-operaciones";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { claseEnlace } from "@/shared/ui/estilos";
import {
  crearMaterialDesdeCompraAccion,
  reactivarMaterialDesdeCompraAccion,
  registrarCompraAccion,
} from "./acciones";
import { esAdmin, exigirSesion } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Compras" };

export default async function PaginaCompras({ searchParams }: PageProps<"/compras">) {
  const sesion = await exigirSesion();
  await connection();
  const { corregir } = await searchParams;
  const [activos, recientes, original, todosTerceros] = await Promise.all([
    materiales.listarMaterialesActivos(),
    operaciones.listarRecientes("compra"),
    typeof corregir === "string" && esAdmin(sesion)
      ? operaciones.obtenerDetalle(corregir)
      : Promise.resolve(null),
    terceros.listarTerceros(),
  ]);
  const corrigiendo = original?.tipo === "compra" && original.estado === "activa" ? original : null;

  return (
    <>
      <EncabezadoPagina
        titulo={corrigiendo ? `Corregir compra N.º ${corrigiendo.consecutivo}` : "Compras"}
        descripcion="Registrar material comprado con su peso y precio."
      />
      {corregir !== undefined && !corrigiendo && (
        <Aviso tipo="error">Esta compra no se puede corregir: no existe o ya está anulada.</Aviso>
      )}
      <FormularioCompra
        // key: al pasar de corregir a registrar, el formulario empieza de cero.
        key={corrigiendo?.id ?? "nueva"}
        accion={registrarCompraAccion}
        crearMaterial={crearMaterialDesdeCompraAccion}
        reactivarMaterial={reactivarMaterialDesdeCompraAccion}
        terceros={todosTerceros
          .filter((t) => sirvePara(t, "compra"))
          .map((t) => ({ id: t.id, nombre: t.nombre, detalle: t.documento ?? undefined }))}
        materiales={activos.map(({ id, nombre, precioCompraMinorista, precioCompraMayorista }) => ({
          id,
          nombre,
          precioCompraMinorista,
          precioCompraMayorista,
        }))}
        inicial={
          corrigiendo
            ? {
                tarifa: corrigiendo.lineas[0]?.tarifa ?? "minorista",
                lineas: lineasParaCorregir(corrigiendo),
                terceroId: corrigiendo.tercero?.id ?? "",
              }
            : undefined
        }
        correccion={
          corrigiendo ? { id: corrigiendo.id, consecutivo: corrigiendo.consecutivo } : undefined
        }
      />
      <section className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-900">Compras recientes</h2>
          {esAdmin(sesion) && (
            <Link href="/historial?tipo=compra" className={`${claseEnlace} text-sm`}>
              Ver todas
            </Link>
          )}
        </div>
        <ListaOperaciones operaciones={recientes} />
      </section>
    </>
  );
}
