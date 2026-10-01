"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/shared/ui/aviso";
import { Campo } from "@/shared/ui/campo";
import { claseBotonPrimario, claseBotonSecundario, claseInput } from "@/shared/ui/estilos";
import type { CampoMaterial, EntradaMaterial } from "../application/validacion";
import type { EstadoFormularioMaterial } from "./estado-formulario";

type FormularioMaterialProps = {
  accion: (
    estado: EstadoFormularioMaterial,
    formData: FormData,
  ) => Promise<EstadoFormularioMaterial>;
  valoresIniciales?: EntradaMaterial;
};

const CAMPOS_PRECIO: { campo: Exclude<CampoMaterial, "nombre" | "activo">; etiqueta: string }[] = [
  { campo: "precioCompraMinorista", etiqueta: "Compra minorista (COP/kg)" },
  { campo: "precioCompraMayorista", etiqueta: "Compra mayorista (COP/kg)" },
  { campo: "precioVenta", etiqueta: "Venta (COP/kg)" },
];

export function FormularioMaterial({ accion, valoresIniciales }: FormularioMaterialProps) {
  const [estado, enviar, enviando] = useActionState(accion, {});
  const valores = estado.valores ?? valoresIniciales;
  const errores = estado.errores ?? {};

  const atributosError = (campo: CampoMaterial) =>
    errores[campo]
      ? { "aria-invalid": true, "aria-describedby": `${campo}-error` }
      : { "aria-invalid": false };

  return (
    // key: al recibir valores nuevos del servidor, React vuelve a montar los campos no controlados.
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

      <div className="grid gap-4 sm:grid-cols-3">
        {CAMPOS_PRECIO.map(({ campo, etiqueta }) => (
          <Campo key={campo} id={campo} etiqueta={etiqueta} error={errores[campo]}>
            <input
              id={campo}
              name={campo}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="Opcional"
              defaultValue={valores?.[campo] ?? ""}
              className={claseInput}
              {...atributosError(campo)}
            />
          </Campo>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={valores?.activo ?? true}
          className="size-4 accent-amber-600"
        />
        Activo (se ofrece en nuevas compras y ventas)
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={enviando} className={claseBotonPrimario}>
          {enviando ? "Guardando…" : "Guardar"}
        </button>
        <Link href="/materiales" className={claseBotonSecundario}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}
