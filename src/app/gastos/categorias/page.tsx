import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { gastos } from "@/modules/gastos";
import { DialogoConfirmacion } from "@/shared/ui/dialogo-confirmacion";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPrimario,
  claseBotonSecundario,
  claseEtiqueta,
  claseInput,
  claseInsignia,
  claseTarjeta,
} from "@/shared/ui/estilos";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { cambiarActivoCategoriaAccion, crearCategoriaAccion } from "../acciones";

export const metadata: Metadata = { title: "Categorías de gasto" };

export default async function PaginaCategoriasGasto() {
  await exigirAdminPagina();
  await connection();
  const categorias = await gastos.listarCategorias();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <EncabezadoPagina
          titulo="Categorías de gasto"
          descripcion="Una categoría desactivada deja de ofrecerse, pero conserva sus gastos."
        />
        <div className="flex gap-2">
          <Link href="/gastos" className={claseBotonSecundario}>
            Volver a gastos
          </Link>
          <DialogoConfirmacion
            textoBoton="Nueva categoría"
            claseBoton={claseBotonPrimario}
            titulo="Nueva categoría"
            textoConfirmar="Crear"
            accion={crearCategoriaAccion}
          >
            <div>
              <label htmlFor="nombre-categoria" className={claseEtiqueta}>
                Nombre
              </label>
              <input
                id="nombre-categoria"
                name="nombre"
                required
                maxLength={60}
                className={claseInput}
              />
            </div>
          </DialogoConfirmacion>
        </div>
      </div>

      <ul className={`${claseTarjeta} divide-y divide-stone-200`}>
        {categorias.map((categoria) => (
          <li
            key={categoria.id}
            className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${categoria.activo ? "" : "text-stone-400"}`}
          >
            <span className="flex items-center gap-2 font-semibold">
              {categoria.nombre}
              {!categoria.activo && (
                <span className={`${claseInsignia} bg-stone-100 text-stone-600`}>Inactiva</span>
              )}
            </span>
            <DialogoConfirmacion
              textoBoton={categoria.activo ? "Desactivar" : "Reactivar"}
              claseBoton={claseBotonSecundario}
              titulo={`${categoria.activo ? "Desactivar" : "Reactivar"} «${categoria.nombre}»`}
              textoConfirmar={categoria.activo ? "Desactivar" : "Reactivar"}
              accion={cambiarActivoCategoriaAccion.bind(null, categoria.id, !categoria.activo)}
            >
              <p>
                {categoria.activo
                  ? "Ya no aparecerá al registrar gastos nuevos. Los gastos anteriores se conservan."
                  : "Volverá a aparecer al registrar gastos."}
              </p>
            </DialogoConfirmacion>
          </li>
        ))}
      </ul>
    </>
  );
}
