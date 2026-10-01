"use client";

import { useActionState } from "react";
import { ingresarAccion, type EstadoIngreso } from "./acciones";

export function FormularioIngreso({ destino }: { destino: string }) {
  const accion = ingresarAccion.bind(null, destino);
  const [estado, enviar, pendiente] = useActionState<EstadoIngreso, FormData>(accion, {});

  return (
    <form action={enviar} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-stone-800">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="focus:border-marca-600 focus:ring-oro-500/40 min-h-12 rounded-lg border border-stone-300 bg-white px-3 text-base outline-none focus:ring-2"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-stone-800">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="focus:border-marca-600 focus:ring-oro-500/40 min-h-12 rounded-lg border border-stone-300 bg-white px-3 text-base outline-none focus:ring-2"
        />
      </div>
      {estado.error && (
        <p role="alert" className="text-sm font-medium text-red-800">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="bg-marca-900 hover:bg-marca-800 min-h-12 rounded-lg px-4 font-semibold text-white transition disabled:cursor-wait disabled:opacity-60"
      >
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
