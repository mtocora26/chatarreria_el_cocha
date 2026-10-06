import type { Metadata } from "next";
import { connection } from "next/server";
import { capital } from "@/modules/capital";
import { formatearCOP } from "@/shared/dominio/dinero";
import { diaNegocio, formatearFechaHora } from "@/shared/dominio/fecha";
import { DialogoConfirmacion } from "@/shared/ui/dialogo-confirmacion";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPeligroSecundario,
  claseBotonPrimario,
  claseEtiqueta,
  claseInput,
  claseInsignia,
  claseTarjeta,
} from "@/shared/ui/estilos";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { anularMovimientoAccion } from "./acciones";
import { FormularioMovimiento } from "./formulario-movimiento";

export const metadata: Metadata = { title: "Capital" };

const texto = (valor: string | string[] | undefined) =>
  typeof valor === "string" ? valor : undefined;

export default async function PaginaCapital({ searchParams }: PageProps<"/capital">) {
  await exigirAdminPagina();
  await connection();
  const parametros = await searchParams;
  const hoy = diaNegocio(new Date());
  const [saldo, movimientos, evolucion] = await Promise.all([
    capital.consultarSaldo(),
    capital.listarMovimientos(),
    capital.consultarEvolucion(
      { desde: texto(parametros.desde), hasta: texto(parametros.hasta) },
      hoy,
    ),
  ]);

  const desglose = [
    { etiqueta: "Capital aportado", valor: saldo.aporte, signo: "+" },
    { etiqueta: "Ventas", valor: saldo.venta, signo: "+" },
    { etiqueta: "Compras de material", valor: saldo.compra, signo: "−" },
    { etiqueta: "Gastos", valor: saldo.gasto, signo: "−" },
    { etiqueta: "Retiros", valor: saldo.retiro, signo: "−" },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Capital del negocio"
        descripcion="Dinero disponible: baja con cada compra y gasto, y sube con cada venta."
      />

      <section aria-labelledby="saldo-actual" className="mb-8">
        <div className={`${claseTarjeta} p-5`}>
          <h2 id="saldo-actual" className="text-sm text-stone-500">
            Saldo actual
          </h2>
          <p
            className={`mt-1 text-3xl font-bold tabular-nums ${saldo.saldo < 0 ? "text-red-700" : "text-stone-900"}`}
          >
            {formatearCOP(saldo.saldo)}
          </p>
          {saldo.aporte === 0 && (
            <p className="mt-2 text-sm text-stone-600">
              Aún no hay capital registrado: registra el capital inicial como un aporte para que el
              saldo sea el real.
            </p>
          )}
        </div>
        <ul className={`${claseTarjeta} mt-3 divide-y divide-stone-200`}>
          {desglose.map(({ etiqueta, valor, signo }) => (
            <li key={etiqueta} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-stone-700">{etiqueta}</span>
              <span className="font-semibold tabular-nums">
                <span className="mr-1 text-stone-400">{signo}</span>
                {formatearCOP(valor)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="registrar-movimiento" className={`${claseTarjeta} mb-8 p-4 sm:p-5`}>
        <h2 id="registrar-movimiento" className="mb-4 text-lg font-semibold text-stone-900">
          Registrar aporte o retiro
        </h2>
        <FormularioMovimiento hoy={hoy} />
      </section>

      <section aria-labelledby="evolucion" className="mb-8">
        <h2 id="evolucion" className="mb-3 text-lg font-semibold text-stone-900">
          Evolución del saldo
        </h2>
        <form className="mb-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="desde" className={claseEtiqueta}>
              Desde
            </label>
            <input
              id="desde"
              name="desde"
              type="date"
              defaultValue={evolucion.desde}
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
              defaultValue={evolucion.hasta}
              className={claseInput}
            />
          </div>
          <button type="submit" className={claseBotonPrimario}>
            Ver
          </button>
        </form>
        <p className="mb-2 text-sm text-stone-600">
          Saldo al empezar:{" "}
          <strong className="tabular-nums">{formatearCOP(evolucion.saldoInicial)}</strong>
          {" · "}al terminar:{" "}
          <strong className="tabular-nums">{formatearCOP(evolucion.saldoFinal)}</strong>
        </p>
        {evolucion.dias.length === 0 ? (
          <p className={`${claseTarjeta} p-6 text-center text-stone-500`}>
            No hay movimientos en este período.
          </p>
        ) : (
          <div className={`${claseTarjeta} overflow-hidden`}>
            <div
              aria-hidden
              className="hidden grid-cols-4 gap-4 bg-stone-100 px-4 py-2 text-xs font-semibold tracking-wide text-stone-600 uppercase sm:grid"
            >
              <span>Día</span>
              <span className="text-right">Entradas</span>
              <span className="text-right">Salidas</span>
              <span className="text-right">Saldo</span>
            </div>
            <ul className="divide-y divide-stone-200">
              {[...evolucion.dias].reverse().map((dia) => (
                <li
                  key={dia.dia}
                  className="grid grid-cols-3 gap-x-4 gap-y-1 px-4 py-3 text-sm sm:grid-cols-4 sm:items-center"
                >
                  <span className="col-span-3 font-semibold sm:col-span-1">{dia.dia}</span>
                  <span className="tabular-nums sm:text-right">
                    <span className="block text-xs text-stone-500 sm:hidden">Entradas</span>
                    {formatearCOP(dia.entradas)}
                  </span>
                  <span className="tabular-nums sm:text-right">
                    <span className="block text-xs text-stone-500 sm:hidden">Salidas</span>
                    {formatearCOP(dia.salidas)}
                  </span>
                  <span className="font-semibold tabular-nums sm:text-right">
                    <span className="block text-xs font-normal text-stone-500 sm:hidden">
                      Saldo
                    </span>
                    {formatearCOP(dia.saldo)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="movimientos-capital">
        <h2 id="movimientos-capital" className="mb-3 text-lg font-semibold text-stone-900">
          Aportes y retiros
        </h2>
        {movimientos.length === 0 ? (
          <p className={`${claseTarjeta} p-6 text-center text-stone-500`}>
            Todavía no hay aportes ni retiros.
          </p>
        ) : (
          <ul className={`${claseTarjeta} divide-y divide-stone-200`}>
            {movimientos.map((movimiento) => {
              const anulado = movimiento.estado === "anulada";
              return (
                <li
                  key={movimiento.id}
                  className={`flex flex-wrap items-start justify-between gap-3 px-4 py-3 ${anulado ? "text-stone-400" : ""}`}
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {movimiento.tipo === "aporte" ? "Aporte" : "Retiro"}
                      {anulado && (
                        <span className={`${claseInsignia} bg-red-100 text-red-800`}>Anulado</span>
                      )}
                    </p>
                    <p className="text-sm text-stone-500">
                      {formatearFechaHora(movimiento.fecha).split(",")[0]}
                      {movimiento.nota && ` · ${movimiento.nota}`}
                    </p>
                    {movimiento.anulacion && (
                      <p className="text-xs">
                        Anulado por {movimiento.anulacion.usuario}: {movimiento.anulacion.motivo}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold tabular-nums ${anulado ? "line-through" : ""}`}>
                      {formatearCOP(movimiento.monto)}
                    </span>
                    {!anulado && (
                      <DialogoConfirmacion
                        textoBoton="Anular"
                        claseBoton={claseBotonPeligroSecundario}
                        titulo={`¿Anular este ${movimiento.tipo}?`}
                        textoConfirmar="Anular"
                        peligro
                        accion={anularMovimientoAccion.bind(null, movimiento.id)}
                      >
                        <p>No se borra: queda marcado como anulado y deja de contar en el saldo.</p>
                        <div>
                          <label htmlFor={`motivo-${movimiento.id}`} className={claseEtiqueta}>
                            Motivo
                          </label>
                          <input
                            id={`motivo-${movimiento.id}`}
                            name="motivo"
                            required
                            minLength={3}
                            maxLength={200}
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
      </section>
    </>
  );
}
