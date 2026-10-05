"use client";

import { useActionState } from "react";
import { Aviso } from "@/shared/ui/aviso";
import { Campo } from "@/shared/ui/campo";
import { claseBotonPrimario, claseInput } from "@/shared/ui/estilos";
import { crearTrabajadorAccion, type EstadoNuevoTrabajador } from "./acciones";

export function FormularioTrabajador() {
  const [estado, enviar, enviando] = useActionState<EstadoNuevoTrabajador, FormData>(
    crearTrabajadorAccion,
    {},
  );
  const { errores = {}, valores } = estado;

  return (
    // key: tras crear un trabajador el formulario se vacía; con errores conserva lo escrito.
    <form key={estado.creado ?? "nuevo"} action={enviar} className="grid gap-4 sm:grid-cols-2">
      {estado.creado && (
        <div className="sm:col-span-2">
          <Aviso tipo="exito">
            Trabajador «{estado.creado}» creado. Entrégale su usuario y contraseña inicial.
          </Aviso>
        </div>
      )}
      {estado.mensaje && (
        <div className="sm:col-span-2">
          <Aviso tipo="error">{estado.mensaje}</Aviso>
        </div>
      )}
      <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
        <input
          id="nombre"
          name="nombre"
          required
          defaultValue={valores?.nombre}
          aria-invalid={!!errores.nombre}
          className={claseInput}
        />
      </Campo>
      <Campo
        id="usuario"
        etiqueta="Usuario"
        error={errores.usuario}
        ayuda="Con él entra a la app. No distingue mayúsculas."
      >
        <input
          id="usuario"
          name="usuario"
          required
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={valores?.usuario}
          aria-invalid={!!errores.usuario}
          className={claseInput}
        />
      </Campo>
      <Campo
        id="correo"
        etiqueta="Correo (opcional)"
        error={errores.correo}
        ayuda="Si se deja vacío se usa un correo interno."
      >
        <input
          id="correo"
          name="correo"
          type="email"
          defaultValue={valores?.correo}
          aria-invalid={!!errores.correo}
          className={claseInput}
        />
      </Campo>
      <Campo id="password" etiqueta="Contraseña inicial" error={errores.password}>
        <input
          id="password"
          name="password"
          type="text"
          required
          autoComplete="off"
          aria-invalid={!!errores.password}
          className={claseInput}
        />
      </Campo>
      <div className="sm:col-span-2">
        <button type="submit" disabled={enviando} className={claseBotonPrimario}>
          {enviando ? "Creando…" : "Crear trabajador"}
        </button>
      </div>
    </form>
  );
}
