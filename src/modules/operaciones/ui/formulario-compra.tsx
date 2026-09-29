"use client";

import { useActionState, useState } from "react";
import type { Tarifa } from "@/modules/materiales/domain/material";
import { formatearCOP, type Pesos } from "@/shared/dominio/dinero";
import { calcularSubtotal, parsearKg } from "@/shared/dominio/peso";
import { Aviso } from "@/shared/ui/aviso";
import { claseBotonPrimario, claseBotonSecundario, claseInput } from "@/shared/ui/estilos";
import type { AccionFormularioOperacion } from "./estado-formulario";
import { useErroresVisibles } from "./errores";
import { useLineas } from "./lineas";

export type MaterialParaCompra = {
  id: string;
  nombre: string;
  precioCompraMinorista: Pesos;
  precioCompraMayorista: Pesos;
};

type FormularioCompraProps = {
  accion: AccionFormularioOperacion;
  materiales: MaterialParaCompra[];
};

const TARIFAS: { valor: Tarifa; etiqueta: string }[] = [
  { valor: "minorista", etiqueta: "Minorista" },
  { valor: "mayorista", etiqueta: "Mayorista" },
];

export function FormularioCompra({ accion, materiales }: FormularioCompraProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const [tarifa, setTarifa] = useState<Tarifa>("minorista");
  const { lineas, agregar, quitar, actualizar } = useLineas();
  const { hayErrores, error, marcarEditado } = useErroresVisibles(estado);

  const precioDe = (materialId: string) => {
    const material = materiales.find((m) => m.id === materialId);
    if (!material) return 0;
    return tarifa === "mayorista" ? material.precioCompraMayorista : material.precioCompraMinorista;
  };
  // Vista previa; el servidor vuelve a calcular con los precios vigentes al guardar.
  const subtotales = lineas.map((l) =>
    calcularSubtotal(parsearKg(l.pesoKg) ?? 0, precioDe(l.materialId)),
  );
  const total = subtotales.reduce((suma, s) => suma + s, 0);

  return (
    <form action={enviar} className="space-y-5" noValidate>
      {estado.mensaje && <Aviso tipo="error">{estado.mensaje}</Aviso>}
      {hayErrores && !estado.mensaje && <Aviso tipo="error">Revisa los campos marcados.</Aviso>}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-stone-700">Tarifa de compra</legend>
        <div className="flex gap-2">
          {TARIFAS.map(({ valor, etiqueta }) => (
            <label
              key={valor}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm has-checked:border-amber-600 has-checked:bg-amber-50"
            >
              <input
                type="radio"
                name="tarifa"
                value={valor}
                checked={tarifa === valor}
                onChange={() => {
                  setTarifa(valor);
                  marcarEditado("tarifa");
                }}
                className="accent-amber-600"
              />
              {etiqueta}
            </label>
          ))}
        </div>
        {error("tarifa") && <p className="mt-1 text-sm text-red-700">{error("tarifa")}</p>}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium text-stone-700">Materiales</legend>
        {lineas.map((linea, indice) => {
          const rutaMaterial = `lineas.${indice}.materialId`;
          const rutaPeso = `lineas.${indice}.pesoKg`;
          const errorMaterial = error(rutaMaterial);
          const errorPeso = error(rutaPeso);
          return (
            <div
              key={linea.clave}
              className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:grid-cols-[1fr_9rem_8rem_auto] sm:items-start"
            >
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor={`material-${linea.clave}`} className="sr-only">
                  Material de la línea {indice + 1}
                </label>
                <select
                  id={`material-${linea.clave}`}
                  name="materialId"
                  value={linea.materialId}
                  onChange={(e) => {
                    actualizar(linea.clave, { materialId: e.target.value });
                    marcarEditado(rutaMaterial);
                  }}
                  aria-invalid={Boolean(errorMaterial)}
                  className={claseInput}
                >
                  <option value="">Elige un material…</option>
                  {materiales.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
                {linea.materialId && (
                  <p className="mt-1 text-xs text-stone-500">
                    {formatearCOP(precioDe(linea.materialId))} por kg
                  </p>
                )}
                {errorMaterial && <p className="mt-1 text-sm text-red-700">{errorMaterial}</p>}
              </div>

              <div>
                <label htmlFor={`peso-${linea.clave}`} className="sr-only">
                  Peso en kg de la línea {indice + 1}
                </label>
                <div className="relative">
                  <input
                    id={`peso-${linea.clave}`}
                    name="pesoKg"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.001}
                    placeholder="0,000"
                    value={linea.pesoKg}
                    onChange={(e) => {
                      actualizar(linea.clave, { pesoKg: e.target.value });
                      marcarEditado(rutaPeso);
                    }}
                    aria-invalid={Boolean(errorPeso)}
                    className={`${claseInput} pr-10`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-stone-500">
                    kg
                  </span>
                </div>
                {errorPeso && <p className="mt-1 text-sm text-red-700">{errorPeso}</p>}
              </div>

              <p className="self-center text-right font-medium tabular-nums sm:py-2">
                {formatearCOP(subtotales[indice])}
              </p>

              <button
                type="button"
                onClick={() => quitar(linea.clave)}
                disabled={lineas.length === 1}
                className="col-span-2 justify-self-end text-sm text-red-700 hover:underline disabled:invisible sm:col-span-1 sm:py-2"
              >
                Quitar<span className="sr-only"> línea {indice + 1}</span>
              </button>
            </div>
          );
        })}
        {error("lineas") && <p className="text-sm text-red-700">{error("lineas")}</p>}
        <button type="button" onClick={agregar} className={claseBotonSecundario}>
          + Agregar material
        </button>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4">
        <p className="text-lg">
          Total: <strong className="tabular-nums">{formatearCOP(total)}</strong>
        </p>
        <button type="submit" disabled={enviando} className={claseBotonPrimario}>
          {enviando ? "Guardando…" : "Registrar compra"}
        </button>
      </div>
    </form>
  );
}
