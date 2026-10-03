import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { materiales } from "@/modules/materiales";
import { operaciones, type Historial } from "@/modules/operaciones";
import { ListaOperaciones } from "@/modules/operaciones/ui/lista-operaciones";
import { formatearCOP } from "@/shared/dominio/dinero";
import { diaNegocio, sumarDias } from "@/shared/dominio/fecha";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPrimario,
  claseBotonSecundario,
  claseEtiqueta,
  claseInput,
  claseTarjeta,
} from "@/shared/ui/estilos";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { medirTiempo } from "@/server/medir-tiempo";

export const metadata: Metadata = { title: "Historial" };

const texto = (valor: string | string[] | undefined) =>
  typeof valor === "string" ? valor : undefined;

function enlace(filtro: Historial["filtro"], extra: Record<string, string> = {}) {
  const parametros = new URLSearchParams(
    Object.entries({ ...filtro, ...extra }).filter(
      (par): par is [string, string] => typeof par[1] === "string" && par[1] !== "",
    ),
  );
  const consulta = parametros.toString();
  return consulta ? `/historial?${consulta}` : "/historial";
}

export default async function PaginaHistorial({ searchParams }: PageProps<"/historial">) {
  await medirTiempo("historial", "sesion", exigirAdminPagina);
  await connection();
  const parametros = await searchParams;
  const [historial, catalogo] = await medirTiempo("historial", "datos_total", () =>
    Promise.all([
      medirTiempo("historial", "operaciones_y_resumen", () =>
        operaciones.consultarHistorial({
          desde: texto(parametros.desde),
          hasta: texto(parametros.hasta),
          tipo: texto(parametros.tipo),
          materialId: texto(parametros.materialId),
          antesDe: texto(parametros.antesDe),
        }),
      ),
      medirTiempo("historial", "catalogo_materiales", () => materiales.listarMateriales()),
    ]),
  );
  const { filtro, resumen } = historial;

  const hoy = diaNegocio(new Date());
  const periodos = [
    { etiqueta: "Hoy", desde: hoy, hasta: hoy },
    { etiqueta: "Últimos 7 días", desde: sumarDias(hoy, -6), hasta: hoy },
    { etiqueta: "Este mes", desde: `${hoy.slice(0, 8)}01`, hasta: hoy },
    { etiqueta: "Todo", desde: undefined, hasta: undefined },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Historial"
        descripcion="Todas las compras y ventas registradas. Abre una para ver su detalle."
      />

      <nav aria-label="Períodos" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {periodos.map(({ etiqueta, desde, hasta }) => {
          const activo = filtro.desde === desde && filtro.hasta === hasta;
          return (
            <Link
              key={etiqueta}
              href={enlace({ ...filtro, desde, hasta })}
              aria-current={activo ? "page" : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium ${
                activo
                  ? "border-marca-900 bg-marca-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
              }`}
            >
              {etiqueta}
            </Link>
          );
        })}
      </nav>

      <details className={`${claseTarjeta} mb-6`} open={Boolean(filtro.tipo || filtro.materialId)}>
        <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold text-stone-700">
          Filtrar por fecha, tipo o material
        </summary>
        <form method="get" className="grid gap-3 border-t border-stone-200 p-4 sm:grid-cols-4">
          <div>
            <label htmlFor="desde" className={claseEtiqueta}>
              Desde
            </label>
            <input
              id="desde"
              name="desde"
              type="date"
              defaultValue={filtro.desde}
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="hasta" className={claseEtiqueta}>
              Hasta
            </label>
            <input
              id="hasta"
              name="hasta"
              type="date"
              defaultValue={filtro.hasta}
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="tipo" className={claseEtiqueta}>
              Tipo
            </label>
            <select id="tipo" name="tipo" defaultValue={filtro.tipo ?? ""} className={claseInput}>
              <option value="">Compras y ventas</option>
              <option value="compra">Solo compras</option>
              <option value="venta">Solo ventas</option>
            </select>
          </div>
          <div>
            <label htmlFor="materialId" className={claseEtiqueta}>
              Material
            </label>
            <select
              id="materialId"
              name="materialId"
              defaultValue={filtro.materialId ?? ""}
              className={claseInput}
            >
              <option value="">Todos</option>
              {catalogo.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                  {m.activo ? "" : " (inactivo)"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 sm:col-span-4">
            <button type="submit" className={claseBotonPrimario}>
              Aplicar
            </button>
            <Link href="/historial" className={claseBotonSecundario}>
              Limpiar
            </Link>
          </div>
        </form>
      </details>

      <section
        aria-label="Resumen del período"
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        <div className={`${claseTarjeta} p-4`}>
          <p className="text-sm text-stone-500">Comprado</p>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
            {formatearCOP(resumen.compras.total)}
          </p>
          <p className="text-xs text-stone-500">{resumen.compras.cantidad} compras</p>
        </div>
        <div className={`${claseTarjeta} p-4`}>
          <p className="text-sm text-stone-500">Vendido</p>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
            {formatearCOP(resumen.ventas.total)}
          </p>
          <p className="text-xs text-stone-500">{resumen.ventas.cantidad} ventas</p>
        </div>
        <div className={`${claseTarjeta} col-span-2 p-4 sm:col-span-1`}>
          <p className="text-sm text-stone-500">Anuladas</p>
          <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{resumen.anuladas}</p>
          <p className="text-xs text-stone-500">No cuentan en los totales</p>
        </div>
      </section>

      <ListaOperaciones
        operaciones={historial.operaciones}
        mostrarTipo={!filtro.tipo}
        vacio="No hay operaciones con estos filtros."
      />

      {(historial.siguiente || parametros.antesDe) && (
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          {parametros.antesDe ? (
            <Link href={enlace(filtro)} className={claseBotonSecundario}>
              ← Más recientes
            </Link>
          ) : (
            <span />
          )}
          {historial.siguiente && (
            <Link
              href={enlace(filtro, { antesDe: String(historial.siguiente) })}
              className={claseBotonSecundario}
            >
              Más antiguas →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
