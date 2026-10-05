import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { gastos } from "@/modules/gastos";
import { formatearCOP } from "@/shared/dominio/dinero";
import { diaNegocio, formatearFechaHora, sumarDias } from "@/shared/dominio/fecha";
import { Aviso } from "@/shared/ui/aviso";
import { DialogoConfirmacion } from "@/shared/ui/dialogo-confirmacion";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPeligroSecundario,
  claseBotonPrimario,
  claseBotonSecundario,
  claseEnlace,
  claseEtiqueta,
  claseInput,
  claseInsignia,
  claseTarjeta,
} from "@/shared/ui/estilos";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { anularGastoAccion } from "./acciones";

export const metadata: Metadata = { title: "Gastos" };

const texto = (valor: string | string[] | undefined) =>
  typeof valor === "string" ? valor : undefined;

export default async function PaginaGastos({ searchParams }: PageProps<"/gastos">) {
  await exigirAdminPagina();
  await connection();
  const parametros = await searchParams;
  const [{ filtro, gastos: lista, hayMas, resumen }, categorias] = await Promise.all([
    gastos.consultarGastos({
      desde: texto(parametros.desde),
      hasta: texto(parametros.hasta),
      categoriaId: texto(parametros.categoriaId),
    }),
    gastos.listarCategorias(),
  ]);

  const hoy = diaNegocio(new Date());
  const periodos = [
    { etiqueta: "Hoy", desde: hoy, hasta: hoy },
    { etiqueta: "Últimos 7 días", desde: sumarDias(hoy, -6), hasta: hoy },
    { etiqueta: "Este mes", desde: `${hoy.slice(0, 8)}01`, hasta: hoy },
    { etiqueta: "Todo", desde: undefined, hasta: undefined },
  ];
  const enlace = (desde?: string, hasta?: string) => {
    const consulta = new URLSearchParams(
      Object.entries({ desde, hasta, categoriaId: filtro.categoriaId }).filter(
        (par): par is [string, string] => typeof par[1] === "string" && par[1] !== "",
      ),
    ).toString();
    return consulta ? `/gastos?${consulta}` : "/gastos";
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <EncabezadoPagina
          titulo="Gastos"
          descripcion="Dinero que sale del negocio: pagos, servicios, insumos y otros."
        />
        <div className="flex gap-2">
          <Link href="/gastos/categorias" className={claseBotonSecundario}>
            Categorías
          </Link>
          <Link href="/gastos/nuevo" className={claseBotonPrimario}>
            Nuevo gasto
          </Link>
        </div>
      </div>
      {texto(parametros.guardado) === "creado" && <Aviso tipo="exito">Gasto registrado.</Aviso>}

      <nav aria-label="Períodos" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {periodos.map(({ etiqueta, desde, hasta }) => {
          const activo = filtro.desde === desde && filtro.hasta === hasta;
          return (
            <Link
              key={etiqueta}
              href={enlace(desde, hasta)}
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

      <details className={`${claseTarjeta} mb-6`} open={Boolean(filtro.categoriaId)}>
        <summary className="min-h-11 cursor-pointer px-4 py-3 text-sm font-medium text-stone-700">
          Filtrar por fecha o categoría
        </summary>
        <form className="grid gap-3 border-t border-stone-200 p-4 sm:grid-cols-4 sm:items-end">
          <div>
            <label htmlFor="desde" className={claseEtiqueta}>
              Desde
            </label>
            <input
              id="desde"
              name="desde"
              type="date"
              defaultValue={filtro.desde ?? ""}
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
              defaultValue={filtro.hasta ?? ""}
              className={claseInput}
            />
          </div>
          <div>
            <label htmlFor="categoriaId" className={claseEtiqueta}>
              Categoría
            </label>
            <select
              id="categoriaId"
              name="categoriaId"
              defaultValue={filtro.categoriaId ?? ""}
              className={claseInput}
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={claseBotonPrimario}>
            Filtrar
          </button>
        </form>
      </details>

      <section aria-labelledby="resumen-gastos" className="mb-8">
        <h2 id="resumen-gastos" className="mb-3 text-lg font-semibold text-stone-900">
          Resumen
        </h2>
        <div className={`${claseTarjeta} p-4`}>
          <p className="text-sm text-stone-500">Total gastado</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatearCOP(resumen.total)}</p>
          <p className="text-xs text-stone-500">
            {resumen.cantidad} gastos
            {resumen.anulados > 0 && ` · ${resumen.anulados} anulados (no suman)`}
          </p>
        </div>
        {resumen.porCategoria.length > 0 && (
          <ul className={`${claseTarjeta} mt-3 divide-y divide-stone-200`}>
            {resumen.porCategoria.map((categoria) => (
              <li
                key={categoria.categoriaId}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span>
                  <span className="font-medium text-stone-900">{categoria.categoria}</span>
                  <span className="ml-2 text-xs text-stone-500">{categoria.cantidad}</span>
                </span>
                <span className="text-right">
                  <span className="font-semibold tabular-nums">
                    {formatearCOP(categoria.total)}
                  </span>
                  <span className="ml-2 text-xs text-stone-500 tabular-nums">
                    {resumen.total > 0 ? Math.round((categoria.total / resumen.total) * 100) : 0}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="lista-gastos">
        <h2 id="lista-gastos" className="mb-3 text-lg font-semibold text-stone-900">
          Gastos registrados
        </h2>
        {lista.length === 0 ? (
          <p className={`${claseTarjeta} p-6 text-center text-stone-500`}>
            No hay gastos en este período.{" "}
            <Link href="/gastos/nuevo" className={claseEnlace}>
              Registrar un gasto
            </Link>
          </p>
        ) : (
          <ul className={`${claseTarjeta} divide-y divide-stone-200`}>
            {lista.map((gasto) => {
              const anulado = gasto.estado === "anulada";
              return (
                <li
                  key={gasto.id}
                  className={`flex flex-wrap items-start justify-between gap-3 px-4 py-3 ${anulado ? "text-stone-400" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {gasto.categoria}
                      {anulado && (
                        <span className={`${claseInsignia} bg-red-100 text-red-800`}>Anulado</span>
                      )}
                    </p>
                    <p className="text-sm text-stone-500">
                      {formatearFechaHora(gasto.fecha).split(",")[0]}
                      {gasto.pagadoA && ` · ${gasto.pagadoA}`}
                      {gasto.medioPago && ` · ${gasto.medioPago}`}
                    </p>
                    {gasto.descripcion && <p className="text-sm">{gasto.descripcion}</p>}
                    {gasto.anulacion && (
                      <p className="text-xs">
                        Anulado por {gasto.anulacion.usuario}: {gasto.anulacion.motivo}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold tabular-nums ${anulado ? "line-through" : ""}`}>
                      {formatearCOP(gasto.monto)}
                    </span>
                    {!anulado && (
                      <DialogoConfirmacion
                        textoBoton="Anular"
                        claseBoton={claseBotonPeligroSecundario}
                        titulo={`¿Anular el gasto de ${formatearCOP(gasto.monto)}?`}
                        textoConfirmar="Anular"
                        peligro
                        accion={anularGastoAccion.bind(null, gasto.id)}
                      >
                        <p>
                          El gasto no se borra: queda marcado como anulado y deja de contar en los
                          totales.
                        </p>
                        <div>
                          <label htmlFor={`motivo-${gasto.id}`} className={claseEtiqueta}>
                            Motivo
                          </label>
                          <input
                            id={`motivo-${gasto.id}`}
                            name="motivo"
                            required
                            minLength={3}
                            maxLength={200}
                            placeholder="Ej.: se registró dos veces"
                            className={claseInput}
                          />
                        </div>
                      </DialogoConfirmacion>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {hayMas && (
          <p className="mt-3 text-sm text-stone-600">
            Se muestran los 200 más recientes; acota el período para ver el resto. Los totales
            incluyen todos.
          </p>
        )}
      </section>
    </>
  );
}
