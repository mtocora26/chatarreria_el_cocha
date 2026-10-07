import Link from "next/link";
import { connection } from "next/server";
import { capital } from "@/modules/capital";
import { operaciones } from "@/modules/operaciones";
import { ListaOperaciones } from "@/modules/operaciones/ui/lista-operaciones";
import { formatearCOP } from "@/shared/dominio/dinero";
import { diaNegocio, formatearFechaLarga } from "@/shared/dominio/fecha";
import { claseEnlace, claseTarjeta } from "@/shared/ui/estilos";
import { esAdmin, exigirSesion } from "@/server/auth/sesion";

export default async function Inicio() {
  const sesion = await exigirSesion();
  await connection();
  const administrador = esAdmin(sesion);
  // Los totales del día son solo del administrador: el trabajador no los consulta.
  const hoy = diaNegocio(new Date());
  const [delDia, saldo] = administrador
    ? await Promise.all([
        operaciones.consultarHistorial({ desde: hoy, hasta: hoy }),
        capital.consultarSaldo(),
      ])
    : [null, null];

  return (
    <>
      <header className="mb-5">
        <p className="text-sm text-stone-600 first-letter:uppercase">
          {formatearFechaLarga(new Date())}
        </p>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Hola, {sesion.user.name.split(" ")[0]}
        </h1>
      </header>

      {/* La compra es el trabajo de todos los días: va grande; la venta, a su lado y más liviana. */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <Link
          href="/compras"
          className="bg-marca-900 hover:bg-marca-800 focus-visible:ring-oro-500 flex min-h-28 items-center justify-between gap-4 rounded-2xl p-5 text-white shadow-sm transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] sm:col-span-3"
        >
          <span>
            <span className="text-marca-100 block text-sm">Lo de todos los días</span>
            <span className="block text-2xl font-bold">Nueva compra</span>
          </span>
          <span className="bg-oro-500 text-marca-950 flex size-12 shrink-0 items-center justify-center rounded-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              aria-hidden
              className="size-6"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </Link>
        <Link
          href="/ventas"
          className="border-oro-500 text-marca-900 hover:bg-oro-100 focus-visible:ring-oro-500 flex min-h-16 items-center justify-between gap-4 rounded-2xl border-2 bg-white px-5 py-4 text-lg font-semibold transition-[background-color,transform] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] sm:col-span-2 sm:min-h-28"
        >
          Nueva venta
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-6"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {delDia && (
        <>
          {saldo && (
            <Link
              href="/capital"
              className={`${claseTarjeta} hover:border-oro-500 mb-6 block p-4 transition`}
            >
              <p className="text-sm text-stone-600">Capital disponible</p>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums sm:text-3xl ${saldo.saldo < 0 ? "text-red-700" : ""}`}
              >
                {formatearCOP(saldo.saldo)}
              </p>
            </Link>
          )}

          <section aria-labelledby="resumen-hoy" className="mb-8">
            <h2 id="resumen-hoy" className="mb-3 text-lg font-semibold text-stone-900">
              Hoy
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className={`${claseTarjeta} p-4`}>
                <p className="text-sm text-stone-600">Comprado</p>
                <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                  {formatearCOP(delDia.resumen.compras.total)}
                </p>
                <p className="text-xs text-stone-600">{delDia.resumen.compras.cantidad} compras</p>
              </div>
              <div className={`${claseTarjeta} p-4`}>
                <p className="text-sm text-stone-600">Vendido</p>
                <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                  {formatearCOP(delDia.resumen.ventas.total)}
                </p>
                <p className="text-xs text-stone-600">{delDia.resumen.ventas.cantidad} ventas</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="movimientos-hoy" className="mb-8">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 id="movimientos-hoy" className="text-lg font-semibold text-stone-900">
                Movimientos de hoy
              </h2>
              <Link href="/historial" className={`${claseEnlace} text-sm`}>
                Ver historial
              </Link>
            </div>
            <ListaOperaciones
              operaciones={delDia.operaciones.slice(0, 8)}
              mostrarTipo
              vacio="Todavía no hay movimientos hoy."
            />
          </section>
        </>
      )}
    </>
  );
}
