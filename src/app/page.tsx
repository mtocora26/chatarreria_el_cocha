import Link from "next/link";
import { connection } from "next/server";
import { capital } from "@/modules/capital";
import { operaciones } from "@/modules/operaciones";
import { ListaOperaciones } from "@/modules/operaciones/ui/lista-operaciones";
import { formatearCOP } from "@/shared/dominio/dinero";
import { diaNegocio, formatearFechaLarga } from "@/shared/dominio/fecha";
import { seccionesPara } from "@/shared/navegacion/secciones";
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
      <header className="mb-6">
        <p className="text-sm text-stone-500 first-letter:uppercase">
          {formatearFechaLarga(new Date())}
        </p>
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Hola, {sesion.user.name.split(" ")[0]}
        </h1>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/compras"
          className="bg-marca-900 hover:bg-marca-800 flex min-h-24 flex-col justify-between rounded-xl p-4 text-white shadow-sm transition"
        >
          <span className="text-2xl" aria-hidden>
            ＋
          </span>
          <span className="text-lg font-semibold">Nueva compra</span>
        </Link>
        <Link
          href="/ventas"
          className="bg-oro-500 text-marca-950 hover:bg-oro-600 flex min-h-24 flex-col justify-between rounded-xl p-4 shadow-sm transition"
        >
          <span className="text-2xl" aria-hidden>
            →
          </span>
          <span className="text-lg font-semibold">Nueva venta</span>
        </Link>
      </div>

      {delDia && (
        <>
          {saldo && (
            <Link
              href="/capital"
              className={`${claseTarjeta} hover:border-oro-500 mb-6 block p-4 transition`}
            >
              <p className="text-sm text-stone-500">Capital disponible</p>
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
                <p className="text-sm text-stone-500">Comprado</p>
                <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                  {formatearCOP(delDia.resumen.compras.total)}
                </p>
                <p className="text-xs text-stone-500">{delDia.resumen.compras.cantidad} compras</p>
              </div>
              <div className={`${claseTarjeta} p-4`}>
                <p className="text-sm text-stone-500">Vendido</p>
                <p className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">
                  {formatearCOP(delDia.resumen.ventas.total)}
                </p>
                <p className="text-xs text-stone-500">{delDia.resumen.ventas.cantidad} ventas</p>
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

      {/* En el teléfono estas secciones ya están en la barra inferior. */}
      <ul className="hidden gap-3 sm:grid sm:grid-cols-3">
        {seccionesPara(administrador)
          .filter(({ href }) => href !== "/compras" && href !== "/ventas")
          .map(({ href, titulo, descripcion }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${claseTarjeta} hover:border-oro-500 block h-full p-4 transition`}
              >
                <h2 className="font-semibold text-stone-900">{titulo}</h2>
                <p className="mt-1 text-sm text-stone-600">{descripcion}</p>
              </Link>
            </li>
          ))}
      </ul>
    </>
  );
}
