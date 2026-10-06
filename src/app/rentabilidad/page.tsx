import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { rentabilidad } from "@/modules/rentabilidad";
import { formatearCOP } from "@/shared/dominio/dinero";
import { diaNegocio, sumarDias } from "@/shared/dominio/fecha";
import { formatearKgResumido } from "@/shared/dominio/peso";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { claseBotonPrimario, claseEtiqueta, claseInput, claseTarjeta } from "@/shared/ui/estilos";
import { exigirAdminPagina } from "@/server/auth/sesion";

export const metadata: Metadata = { title: "Rentabilidad" };

const texto = (valor: string | string[] | undefined) =>
  typeof valor === "string" ? valor : undefined;

const porcentaje = (valor: number | null) =>
  valor === null ? "—" : `${(valor * 100).toFixed(1).replace(".", ",")} %`;

const colorUtilidad = (valor: number) => (valor < 0 ? "text-red-700" : "text-stone-900");

export default async function PaginaRentabilidad({ searchParams }: PageProps<"/rentabilidad">) {
  await exigirAdminPagina();
  await connection();
  const parametros = await searchParams;
  const hoy = diaNegocio(new Date());
  const sinFiltro = texto(parametros.desde) === undefined && texto(parametros.hasta) === undefined;
  // Sin filtro se muestra el mes en curso.
  const desdeSolicitado = sinFiltro ? `${hoy.slice(0, 8)}01` : texto(parametros.desde);
  const hastaSolicitado = sinFiltro ? hoy : texto(parametros.hasta);
  const reporte = await rentabilidad.consultarRentabilidad({
    desde: desdeSolicitado,
    hasta: hastaSolicitado,
  });

  const periodos = [
    { etiqueta: "Hoy", desde: hoy, hasta: hoy },
    { etiqueta: "Últimos 7 días", desde: sumarDias(hoy, -6), hasta: hoy },
    { etiqueta: "Este mes", desde: `${hoy.slice(0, 8)}01`, hasta: hoy },
    { etiqueta: "Todo", desde: "", hasta: "" },
  ];
  const sinCosto = reporte.porMaterial.filter((m) => m.sinCosto).map((m) => m.material);
  const { inventario } = reporte;

  const lineas = [
    { etiqueta: "Ingresos por ventas", valor: reporte.ingresos, signo: "" },
    { etiqueta: "Costo del material vendido", valor: reporte.costoVendido, signo: "−" },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Rentabilidad"
        descripcion="Cuánto se gana: ventas menos el costo del material vendido y los gastos."
      />

      <nav aria-label="Períodos" className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {periodos.map(({ etiqueta, desde, hasta }) => {
          const activo = (reporte.desde ?? "") === desde && (reporte.hasta ?? "") === hasta;
          return (
            <Link
              key={etiqueta}
              href={`/rentabilidad?desde=${desde}&hasta=${hasta}`}
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

      <form className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="desde" className={claseEtiqueta}>
            Desde
          </label>
          <input
            id="desde"
            name="desde"
            type="date"
            defaultValue={reporte.desde ?? ""}
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
            defaultValue={reporte.hasta ?? ""}
            className={claseInput}
          />
        </div>
        <button type="submit" className={claseBotonPrimario}>
          Ver
        </button>
      </form>

      {sinCosto.length > 0 && (
        <Aviso tipo="error">
          Se vendió más de lo que las compras registradas respaldan en: {sinCosto.join(", ")}. Ese
          tramo se contó con costo cero, así que la utilidad de esos materiales es mayor a la real.
        </Aviso>
      )}

      <section aria-labelledby="resultado" className="mb-8">
        <h2 id="resultado" className="sr-only">
          Resultado del período
        </h2>
        <div className={`${claseTarjeta} p-5`}>
          <p className="text-sm text-stone-500">Utilidad neta</p>
          <p
            className={`mt-1 text-3xl font-bold tabular-nums ${colorUtilidad(reporte.utilidadNeta)}`}
          >
            {formatearCOP(reporte.utilidadNeta)}
          </p>
          <p className="text-xs text-stone-500">
            Margen bruto sobre ventas: {porcentaje(reporte.margenBruto)}
          </p>
        </div>
        <ul className={`${claseTarjeta} mt-3 divide-y divide-stone-200`}>
          {lineas.map(({ etiqueta, valor, signo }) => (
            <li key={etiqueta} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="text-stone-700">{etiqueta}</span>
              <span className="font-semibold tabular-nums">
                {signo && <span className="mr-1 text-stone-400">{signo}</span>}
                {formatearCOP(valor)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 bg-stone-50 px-4 py-3">
            <span className="font-medium text-stone-900">Utilidad bruta</span>
            <span className={`font-semibold tabular-nums ${colorUtilidad(reporte.utilidadBruta)}`}>
              {formatearCOP(reporte.utilidadBruta)}
            </span>
          </li>
          {reporte.gastos.porCategoria.map((categoria) => (
            <li
              key={categoria.categoriaId}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="text-stone-700">Gasto: {categoria.categoria}</span>
              <span className="font-semibold tabular-nums">
                <span className="mr-1 text-stone-400">−</span>
                {formatearCOP(categoria.total)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 bg-stone-50 px-4 py-3">
            <span className="font-medium text-stone-900">Utilidad neta</span>
            <span className={`font-bold tabular-nums ${colorUtilidad(reporte.utilidadNeta)}`}>
              {formatearCOP(reporte.utilidadNeta)}
            </span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="por-material" className="mb-8">
        <h2 id="por-material" className="mb-3 text-lg font-semibold text-stone-900">
          Utilidad por material
        </h2>
        {reporte.porMaterial.length === 0 ? (
          <p className={`${claseTarjeta} p-6 text-center text-stone-500`}>
            No hubo ventas en este período.
          </p>
        ) : (
          <ul className={`${claseTarjeta} divide-y divide-stone-200`}>
            {reporte.porMaterial.map((material) => (
              <li key={material.materialId} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold text-stone-900">
                    {material.material}
                    {material.sinCosto && (
                      <span className="ml-2 text-xs font-normal text-red-700">
                        sin costo completo
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${colorUtilidad(material.utilidad)}`}
                  >
                    {formatearCOP(material.utilidad)}
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  Vendido {formatearKgResumido(material.gramosVendidos)} por{" "}
                  {formatearCOP(material.ingresos)} · costo {formatearCOP(material.costo)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="inventario-valorado">
        <h2 id="inventario-valorado" className="mb-3 text-lg font-semibold text-stone-900">
          Inventario actual valorado
        </h2>
        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          <div className={`${claseTarjeta} p-4`}>
            <p className="text-sm text-stone-500">Al costo</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {formatearCOP(inventario.valorCosto)}
            </p>
          </div>
          <div className={`${claseTarjeta} p-4`}>
            <p className="text-sm text-stone-500">Al precio de venta mayorista</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {formatearCOP(inventario.valorVenta)}
            </p>
          </div>
          <div className={`${claseTarjeta} p-4`}>
            <p className="text-sm text-stone-500">Utilidad potencial</p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums ${colorUtilidad(inventario.utilidadPotencial)}`}
            >
              {formatearCOP(inventario.utilidadPotencial)}
            </p>
          </div>
        </div>
        {inventario.sinPrecio.length > 0 && (
          <Aviso tipo="error">
            Sin precio de venta configurado: {inventario.sinPrecio.join(", ")}. No se incluyen en el
            valor de venta ni en la utilidad potencial.
          </Aviso>
        )}
        {inventario.items.length > 0 && (
          <ul className={`${claseTarjeta} divide-y divide-stone-200`}>
            {inventario.items.map((item) => (
              <li key={item.materialId} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-semibold text-stone-900">{item.material}</span>
                  <span className="text-sm text-stone-600 tabular-nums">
                    {formatearKgResumido(item.gramos)}
                  </span>
                </div>
                <p className="text-sm text-stone-500">
                  Costo {formatearCOP(item.valorCosto)} ·{" "}
                  {item.valorVenta === null
                    ? "sin precio de venta"
                    : `venta ${formatearCOP(item.valorVenta)}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
