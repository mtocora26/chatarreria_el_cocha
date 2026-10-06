"use server";

import { revalidatePath } from "next/cache";
import { capital, type EntradaMovimiento, type ErroresMovimiento } from "@/modules/capital";
import type { EstadoAccionConfirmada } from "@/shared/ui/dialogo-confirmacion";
import { exigirAdmin } from "@/server/auth/sesion";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "");
const SOLO_ADMIN = "Solo un administrador puede gestionar el capital.";

export type EstadoMovimiento = {
  mensaje?: string;
  registrado?: boolean;
  errores?: ErroresMovimiento;
  valores?: EntradaMovimiento;
};

export async function registrarMovimientoAccion(
  _estado: EstadoMovimiento,
  formData: FormData,
): Promise<EstadoMovimiento> {
  const sesion = await exigirAdmin();
  if (!sesion) return { mensaje: SOLO_ADMIN };
  const entrada: EntradaMovimiento = {
    fecha: texto(formData, "fecha"),
    tipo: texto(formData, "tipo"),
    monto: texto(formData, "monto"),
    nota: texto(formData, "nota"),
  };

  const resultado = await capital.registrarMovimiento(entrada, sesion.user.id);
  if (!resultado.ok) {
    return { mensaje: "Revisa los campos marcados.", errores: resultado.error, valores: entrada };
  }

  revalidatePath("/", "layout");
  return { registrado: true };
}

export async function anularMovimientoAccion(
  id: string,
  _estado: EstadoAccionConfirmada,
  formData: FormData,
): Promise<EstadoAccionConfirmada> {
  const sesion = await exigirAdmin();
  if (!sesion) return { error: SOLO_ADMIN };

  const resultado = await capital.anularMovimiento(id, {
    usuarioId: sesion.user.id,
    motivo: texto(formData, "motivo"),
  });
  if (!resultado.ok) return { error: resultado.error };

  revalidatePath("/", "layout");
  return { hecho: true };
}
