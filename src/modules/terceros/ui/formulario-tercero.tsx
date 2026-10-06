"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/shared/ui/aviso";
import { Campo } from "@/shared/ui/campo";
import { claseBotonPrimario, claseBotonSecundario, claseInput } from "@/shared/ui/estilos";
import type { CampoTercero, EntradaTercero } from "../application/validacion";
import { ETIQUETA_TIPO_TERCERO } from "../domain/tercero";
import type { EstadoFormularioTercero } from "./estado-formulario";

type FormularioTerceroProps = {
  accion: (estado: EstadoFormularioTercero, formData: FormData) => Promise<EstadoFormularioTercero>;
  valoresIniciales?: EntradaTercero;
};

export function FormularioTercero({ accion, valoresIniciales }: FormularioTerceroProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const valores = estado.valores ?? valoresIniciales;
  const errores = estado.errores ?? {};

  const atributosError = (campo: CampoTercero) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : { "aria-invalid": false };

  return (
    <form action={enviar} key={JSON.stringify(valores)} className="max-w-xl space-y-4" noValidate>
      {estado.mensaje && <Aviso tipo="error">{estado.mensaje}</Aviso>}

      <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
        <input
          id="nombre"
          name="nombre"
          required
          maxLength={80}
          defaultValue={valores?.nombre}
          className={claseInput}
          {...atributosError("nombre")}
        />
      </Campo>

      <Campo id="tipo" etiqueta="Tipo" error={errores.tipo}>
        <select
          id="tipo"
          name="tipo"
          defaultValue={valores?.tipo ?? "proveedor"}
          className={claseInput}
          {...atributosError("tipo")}
        >
          {Object.entries(ETIQUETA_TIPO_TERCERO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="documento" etiqueta="Documento (opcional)" error={errores.documento}>
          <input
            id="documento"
            name="documento"
            maxLength={30}
            inputMode="numeric"
            defaultValue={valores?.documento}
            className={claseInput}
            {...atributosError("documento")}
          />
        </Campo>
        <Campo id="telefono" etiqueta="Teléfono (opcional)" error={errores.telefono}>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            maxLength={30}
            defaultValue={valores?.telefono}
            className={claseInput}
            {...atributosError("telefono")}
          />
        </Campo>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={enviando} className={claseBotonPrimario}>
          {enviando ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/terceros" className={claseBotonSecundario}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
