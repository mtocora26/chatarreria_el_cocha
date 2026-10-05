"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/shared/ui/aviso";
import { Campo } from "@/shared/ui/campo";
import { claseBotonPrimario, claseBotonSecundario, claseInput } from "@/shared/ui/estilos";
import type { CampoGasto } from "../application/validacion";
import type { CategoriaGasto } from "../domain/gasto";
import type { EstadoFormularioGasto } from "./estado-formulario";

type FormularioGastoProps = {
  accion: (estado: EstadoFormularioGasto, formData: FormData) => Promise<EstadoFormularioGasto>;
  categorias: CategoriaGasto[];
  hoy: string;
};

const MEDIOS_DE_PAGO = ["Efectivo", "Transferencia", "Otro"];

export function FormularioGasto({ accion, categorias, hoy }: FormularioGastoProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const valores = estado.valores;
  const errores = estado.errores ?? {};

  const atributosError = (campo: CampoGasto) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : { "aria-invalid": false };

  return (
    <form action={enviar} key={JSON.stringify(valores)} className="max-w-xl space-y-4" noValidate>
      {estado.mensaje && <Aviso tipo="error">{estado.mensaje}</Aviso>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
          <input
            id="fecha"
            name="fecha"
            type="date"
            required
            defaultValue={valores?.fecha ?? hoy}
            className={claseInput}
            {...atributosError("fecha")}
          />
        </Campo>
        <Campo id="monto" etiqueta="Monto (COP)" error={errores.monto}>
          <input
            id="monto"
            name="monto"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            defaultValue={valores?.monto}
            className={claseInput}
            {...atributosError("monto")}
          />
        </Campo>
      </div>

      <Campo id="categoriaId" etiqueta="Categoría" error={errores.categoriaId}>
        <select
          id="categoriaId"
          name="categoriaId"
          required
          defaultValue={valores?.categoriaId ?? ""}
          className={claseInput}
          {...atributosError("categoriaId")}
        >
          <option value="" disabled>
            Elige una categoría
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo
        id="pagadoA"
        etiqueta="Pagado a (opcional)"
        error={errores.pagadoA}
        ayuda="Persona o negocio que recibió el dinero."
      >
        <input
          id="pagadoA"
          name="pagadoA"
          maxLength={80}
          defaultValue={valores?.pagadoA}
          className={claseInput}
          {...atributosError("pagadoA")}
        />
      </Campo>

      <Campo id="descripcion" etiqueta="Descripción (opcional)" error={errores.descripcion}>
        <input
          id="descripcion"
          name="descripcion"
          maxLength={200}
          placeholder="Ej.: pago de la semana, flete de Bogotá…"
          defaultValue={valores?.descripcion}
          className={claseInput}
          {...atributosError("descripcion")}
        />
      </Campo>

      <Campo id="medioPago" etiqueta="Medio de pago (opcional)" error={errores.medioPago}>
        <select
          id="medioPago"
          name="medioPago"
          defaultValue={valores?.medioPago ?? ""}
          className={claseInput}
          {...atributosError("medioPago")}
        >
          <option value="">Sin indicar</option>
          {MEDIOS_DE_PAGO.map((medio) => (
            <option key={medio} value={medio}>
              {medio}
            </option>
          ))}
        </select>
      </Campo>

      <div className="flex gap-3">
        <button type="submit" disabled={enviando} className={claseBotonPrimario}>
          {enviando ? "Guardando…" : "Guardar gasto"}
        </button>
        <Link href="/gastos" className={claseBotonSecundario}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
