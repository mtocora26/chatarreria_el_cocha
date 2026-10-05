import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ETIQUETA_TIPO_TERCERO, terceros } from "@/modules/terceros";
import { ListaTerceros } from "@/modules/terceros/ui/lista-terceros";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPrimario,
  claseBotonSecundario,
  claseEtiqueta,
  claseInput,
  claseTarjeta,
} from "@/shared/ui/estilos";
import { esAdmin, exigirSesion } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Terceros" };

const MENSAJES_GUARDADO: Record<string, string> = {
  creado: "Tercero creado.",
  actualizado: "Cambios guardados.",
};

const texto = (valor: string | string[] | undefined) => (typeof valor === "string" ? valor : "");

export default async function PaginaTerceros({ searchParams }: PageProps<"/terceros">) {
  const sesion = await exigirSesion();
  await connection();
  const parametros = await searchParams;
  const busqueda = texto(parametros.q);
  const tipo = texto(parametros.tipo);
  const lista = await terceros.listarTerceros({ busqueda, tipo });
  const mensaje = MENSAJES_GUARDADO[texto(parametros.guardado)];
  const filtrando = busqueda.trim() !== "" || tipo !== "";

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <EncabezadoPagina
          titulo="Clientes y proveedores"
          descripcion="Terceros que se asocian a compras y ventas."
        />
        <Link href="/terceros/nuevo" className={claseBotonPrimario}>
          Nuevo tercero
        </Link>
      </div>
      {mensaje && <Aviso tipo="exito">{mensaje}</Aviso>}

      <form
        className={`${claseTarjeta} mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end`}
      >
        <div>
          <label htmlFor="q" className={claseEtiqueta}>
            Buscar por nombre, documento o teléfono
          </label>
          <input id="q" name="q" type="search" defaultValue={busqueda} className={claseInput} />
        </div>
        <div>
          <label htmlFor="tipo" className={claseEtiqueta}>
            Tipo
          </label>
          <select id="tipo" name="tipo" defaultValue={tipo} className={claseInput}>
            <option value="">Todos</option>
            {Object.entries(ETIQUETA_TIPO_TERCERO).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={claseBotonPrimario}>
            Buscar
          </button>
          {filtrando && (
            <Link href="/terceros" className={claseBotonSecundario}>
              Limpiar
            </Link>
          )}
        </div>
      </form>

      <ListaTerceros
        terceros={lista}
        puedeEditar={esAdmin(sesion)}
        vacio={
          filtrando
            ? "Ningún tercero coincide con la búsqueda."
            : "Aún no hay clientes ni proveedores. Crea el primero para asociarlo a compras y ventas."
        }
      />
    </>
  );
}
