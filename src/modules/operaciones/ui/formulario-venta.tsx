"use client";

import { useActionState } from "react";
import { formatearCOP, parsearPesos, type Pesos } from "@/shared/dominio/dinero";
import {
  calcularSubtotal,
  convertirAPesoGramos,
  formatearKg,
  type Gramos,
} from "@/shared/dominio/peso";
import { Aviso } from "@/shared/ui/aviso";
import { claseBotonPrimario, claseBotonSecundario, claseInput } from "@/shared/ui/estilos";
import { useErroresVisibles } from "./errores";
import type { AccionFormularioOperacion } from "./estado-formulario";
import { useLineas } from "./lineas";

export type MaterialParaVenta = {
  id: string;
  nombre: string;
  precioVenta: Pesos | null;
  stock: Gramos;
};

type FormularioVentaProps = {
  accion: AccionFormularioOperacion;
  materiales: MaterialParaVenta[];
};

export function FormularioVenta({ accion, materiales }: FormularioVentaProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const { lineas, agregar, quitar, actualizar } = useLineas();
  const { hayErrores, error, marcarEditado } = useErroresVisibles(estado);

  const materialDe = (id: string) => materiales.find((m) => m.id === id);
  // Vista previa; el servidor recalcula y vuelve a validar el stock al guardar.
  const subtotales = lineas.map((l) =>
    calcularSubtotal(
      convertirAPesoGramos(l.pesoKg, l.unidadPeso, l.equivalenciaKg) ?? 0,
      parsearPesos(l.precioPorKg) ?? 0,
    ),
  );
  const total = subtotales.reduce((suma, s) => suma + s, 0);

  return (
    <form action={enviar} className="space-y-5" noValidate>
      {estado.mensaje && <Aviso tipo="error">{estado.mensaje}</Aviso>}
      {hayErrores && !estado.mensaje && <Aviso tipo="error">Revisa los campos marcados.</Aviso>}

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium text-stone-700">Materiales</legend>
        {lineas.map((linea, indice) => {
          const rutaMaterial = `lineas.${indice}.materialId`;
          const rutaPeso = `lineas.${indice}.pesoKg`;
          const rutaPrecio = `lineas.${indice}.precioPorKg`;
          const material = materialDe(linea.materialId);
          const gramos = convertirAPesoGramos(linea.pesoKg, linea.unidadPeso, linea.equivalenciaKg);
          const superaStock = material !== undefined && gramos !== null && gramos > material.stock;
          const errorPeso =
            error(rutaPeso) ??
            (superaStock ? `Supera el stock: hay ${formatearKg(material.stock)}.` : undefined);

          return (
            <div
              key={linea.clave}
              className="grid grid-cols-2 gap-3 rounded-lg border border-stone-200 bg-white p-3 sm:grid-cols-[1fr_9rem_9rem_7rem_auto] sm:items-start"
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
                    const elegido = materialDe(e.target.value);
                    actualizar(linea.clave, {
                      materialId: e.target.value,
                      precioPorKg:
                        elegido?.precioVenta === null || !elegido
                          ? ""
                          : String(elegido.precioVenta),
                    });
                    marcarEditado(rutaMaterial);
                  }}
                  aria-invalid={Boolean(error(rutaMaterial))}
                  className={claseInput}
                >
                  <option value="">Elige un material…</option>
                  {materiales.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.stock <= 0}>
                      {m.nombre} ({formatearKg(m.stock)})
                    </option>
                  ))}
                </select>
                {material && (
                  <p className="mt-1 text-xs text-stone-500">
                    Disponible: {formatearKg(material.stock)}
                  </p>
                )}
                {error(rutaMaterial) && (
                  <p className="mt-1 text-sm text-red-700">{error(rutaMaterial)}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`peso-${linea.clave}`}
                  className="mb-1 block text-xs text-stone-600"
                >
                  Cantidad
                </label>
                <input
                  id={`peso-${linea.clave}`}
                  name="pesoKg"
                  // Texto y no number: permite la coma decimal en cualquier idioma del navegador.
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0,000"
                  value={linea.pesoKg}
                  onChange={(e) => {
                    actualizar(linea.clave, { pesoKg: e.target.value });
                    marcarEditado(rutaPeso);
                  }}
                  aria-invalid={Boolean(errorPeso)}
                  className={claseInput}
                />
                <select
                  name="unidadPeso"
                  value={linea.unidadPeso}
                  onChange={(e) =>
                    actualizar(linea.clave, { unidadPeso: e.target.value as "kg" | "lb" | "otra" })
                  }
                  className={`${claseInput} mt-1`}
                  aria-label={`Unidad de peso de la línea ${indice + 1}`}
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                  <option value="otra">Otra medida</option>
                </select>
                {linea.unidadPeso === "otra" && (
                  <input
                    name="equivalenciaKg"
                    type="text"
                    inputMode="decimal"
                    placeholder="kg por unidad"
                    value={linea.equivalenciaKg}
                    onChange={(e) => actualizar(linea.clave, { equivalenciaKg: e.target.value })}
                    className={`${claseInput} mt-1`}
                    aria-label={`Equivalencia en kg de la línea ${indice + 1}`}
                  />
                )}
                {errorPeso && <p className="mt-1 text-sm text-red-700">{errorPeso}</p>}
              </div>

              <div>
                <label
                  htmlFor={`precio-${linea.clave}`}
                  className="mb-1 block text-xs text-stone-600"
                >
                  Precio (COP/kg)
                </label>
                <input
                  id={`precio-${linea.clave}`}
                  name="precioPorKg"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  placeholder="Definir"
                  value={linea.precioPorKg}
                  onChange={(e) => {
                    actualizar(linea.clave, { precioPorKg: e.target.value });
                    marcarEditado(rutaPrecio);
                  }}
                  aria-invalid={Boolean(error(rutaPrecio))}
                  className={claseInput}
                />
                {error(rutaPrecio) && (
                  <p className="mt-1 text-sm text-red-700">{error(rutaPrecio)}</p>
                )}
              </div>

              <p className="self-center font-medium tabular-nums sm:pt-5 sm:text-right">
                {formatearCOP(subtotales[indice])}
              </p>

              <button
                type="button"
                onClick={() => quitar(linea.clave)}
                disabled={lineas.length === 1}
                className="justify-self-end text-sm text-red-700 hover:underline disabled:invisible sm:pt-7"
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
          {enviando ? "Guardando…" : "Registrar venta"}
        </button>
      </div>
    </form>
  );
}
