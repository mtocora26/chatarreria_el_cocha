"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ERROR_GENERAL, operaciones } from "@/modules/operaciones";
import type { EstadoAccionConfirmada } from "@/shared/ui/dialogo-confirmacion";
import { exigirAdmin } from "@/server/auth/sesion";

export async function anularOperacionAccion(
  id: string,
  _estado: EstadoAccionConfirmada,
  formData: FormData,
): Promise<EstadoAccionConfirmada> {
  const sesion = await exigirAdmin();
  if (!sesion) return { error: "Solo un administrador puede anular operaciones." };

  const resultado = await operaciones.anular(id, {
    usuarioId: sesion.user.id,
    motivo: String(formData.get("motivo") ?? ""),
  });
  if (!resultado.ok) {
    return { error: resultado.error[ERROR_GENERAL] ?? resultado.error.motivo };
  }

  revalidatePath("/", "layout");
  redirect(`/recibos/${id}?anulada=1`);
}
