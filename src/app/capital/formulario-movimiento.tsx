"use client";

import { useActionState } from "react";
import { Aviso } from "@/shared/ui/aviso";
import { Campo } from "@/shared/ui/campo";
import { claseBotonPrimario, claseInput } from "@/shared/ui/estilos";
import { registrarMovimientoAccion, type EstadoMovimiento } from "./acciones";

export function FormularioMovimiento({ hoy }: { hoy: string }) {
  const [estado, enviar, enviando] = useActionState<EstadoMovimiento, FormData>(
    registrarMovimientoAccion,
    {},
  );
  const errores = estado.errores ?? {};
  const valores = estado.valores;

  return (
    // key: tras registrar se vacía; con errores conserva lo escrito.
    <form
      key={estado.registrado ? "listo" : JSON.stringify(valores)}
      action={enviar}
      className="grid gap-4 sm:grid-cols-2"
      noValidate
    >
      {estado.registrado && (
        <div className="sm:col-span-2">
          <Aviso tipo="exito">Movimiento registrado.</Aviso>
        </div>
      )}
      {estado.mensaje && (
        <div className="sm:col-span-2">
          <Aviso tipo="error">{estado.mensaje}</Aviso>
        </div>
      )}
      <Campo id="tipo" etiqueta="Tipo" error={errores.tipo}>
        <select
          id="tipo"
          name="tipo"
          defaultValue={valores?.tipo ?? "aporte"}
          className={claseInput}
        >
          <option value="aporte">Aporte (capital inicial o dinero que se pone)</option>
          <option value="retiro">Retiro (dinero que saca el dueño)</option>
        </select>
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
        />
      </Campo>
      <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
        <input
          id="fecha"
          name="fecha"
          type="date"
          required
          defaultValue={valores?.fecha ?? hoy}
          className={claseInput}
        />
      </Campo>
      <Campo id="nota" etiqueta="Nota (opcional)" error={errores.nota}>
        <input
          id="nota"
          name="nota"
          maxLength={200}
          placeholder="Ej.: capital inicial"
          defaultValue={valores?.nota}
          className={claseInput}
        />
      </Campo>
      <div className="sm:col-span-2">
        <button type="submit" disabled={enviando} className={claseBotonPrimario}>
          {enviando ? "Guardando…" : "Registrar movimiento"}
        </button>
      </div>
    </form>
  );
}
