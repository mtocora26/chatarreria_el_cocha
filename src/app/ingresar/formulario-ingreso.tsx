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
          className="min-h-12 rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
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
          className="min-h-12 rounded-md border border-stone-300 bg-white px-3 text-base outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20"
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
        className="min-h-12 rounded-md bg-emerald-900 px-4 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
      >
        {pendiente ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
