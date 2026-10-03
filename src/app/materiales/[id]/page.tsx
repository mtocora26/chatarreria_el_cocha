import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { materiales } from "@/modules/materiales";
import { operaciones } from "@/modules/operaciones";
import { FormularioMaterial } from "@/modules/materiales/ui/formulario-material";
import { formatearKgResumido } from "@/shared/dominio/peso";
import { DialogoConfirmacion } from "@/shared/ui/dialogo-confirmacion";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPeligroSecundario,
  claseBotonSecundario,
  claseTarjeta,
} from "@/shared/ui/estilos";
import {
  cambiarActivoMaterialAccion,
  eliminarMaterialAccion,
  guardarMaterialAccion,
} from "../acciones";
import { exigirAdminPagina } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Editar material" };

export default async function PaginaEditarMaterial({ params }: PageProps<"/materiales/[id]">) {
  await exigirAdminPagina();
  const { id } = await params;
  const material = await materiales.obtenerMaterial(id);
  if (!material) notFound();
  const [tieneMovimientos, stock] = await Promise.all([
    materiales.tieneMovimientos(material.id),
    operaciones.consultarStock([material.id]),
  ]);
  const disponible = stock.get(material.id) ?? 0;

  return (
    <>
      <EncabezadoPagina titulo={`Editar ${material.nombre}`} />
      <FormularioMaterial
        accion={guardarMaterialAccion.bind(null, material.id)}
        valoresIniciales={{
          nombre: material.nombre,
          precioCompraMinorista: String(material.precioCompraMinorista ?? ""),
          precioCompraMayorista: String(material.precioCompraMayorista ?? ""),
          precioVenta: String(material.precioVenta ?? ""),
          activo: material.activo,
        }}
      />

      <section className={`${claseTarjeta} mt-10 max-w-xl space-y-3 p-5`}>
        <h2 className="font-semibold text-stone-900">
          {tieneMovimientos ? "Desactivar material" : "Eliminar material"}
        </h2>
        {!tieneMovimientos ? (
          <>
            <p className="text-sm text-stone-600">
              Este material no tiene compras ni ventas, así que se puede eliminar por completo.
            </p>
            <DialogoConfirmacion
              textoBoton="Eliminar material"
              claseBoton={claseBotonPeligroSecundario}
              titulo={`¿Eliminar ${material.nombre}?`}
              textoConfirmar="Eliminar"
              peligro
              accion={eliminarMaterialAccion.bind(null, material.id)}
            >
              <p>Esta acción no se puede deshacer.</p>
            </DialogoConfirmacion>
          </>
        ) : material.activo ? (
          <>
            <p className="text-sm text-stone-600">
              Tiene compras o ventas registradas, por eso no se puede eliminar: sus recibos lo
              necesitan. Al desactivarlo deja de aparecer en compras y ventas nuevas.
            </p>
            <DialogoConfirmacion
              textoBoton="Desactivar material"
              claseBoton={claseBotonPeligroSecundario}
              titulo={`¿Desactivar ${material.nombre}?`}
              textoConfirmar="Desactivar"
              peligro
              accion={cambiarActivoMaterialAccion.bind(null, material.id, false)}
            >
              {disponible > 0 ? (
                <p className="font-medium text-red-800">
                  Quedan {formatearKgResumido(disponible)} en inventario. Mientras esté inactivo no
                  podrás venderlos.
                </p>
              ) : (
                <p>Puedes reactivarlo cuando quieras.</p>
              )}
            </DialogoConfirmacion>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-600">
              Está inactivo: no aparece en compras ni ventas nuevas.
            </p>
            <DialogoConfirmacion
              textoBoton="Reactivar material"
              claseBoton={claseBotonSecundario}
              titulo={`¿Reactivar ${material.nombre}?`}
              textoConfirmar="Reactivar"
              accion={cambiarActivoMaterialAccion.bind(null, material.id, true)}
            >
              <p>Volverá a aparecer en compras y ventas.</p>
            </DialogoConfirmacion>
          </>
        )}
      </section>
    </>
  );
}
