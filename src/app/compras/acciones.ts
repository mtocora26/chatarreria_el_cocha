"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { operaciones } from "@/modules/operaciones";
import type { EstadoFormularioOperacion } from "@/modules/operaciones/ui/estado-formulario";
import { exigirSesion } from "@/server/auth/sesion";

export async function registrarCompraAccion(
  _estado: EstadoFormularioOperacion,
  formData: FormData,
): Promise<EstadoFormularioOperacion> {
  await exigirSesion();
  const pesos = formData.getAll("pesoKg").map(String);
  const resultado = await operaciones.registrarCompra({
    tarifa: String(formData.get("tarifa") ?? ""),
    lineas: formData.getAll("materialId").map((materialId, indice) => ({
      materialId: String(materialId),
      pesoKg: pesos[indice] ?? "",
    })),
  });
  if (!resultado.ok) return { errores: resultado.error };

  revalidatePath("/", "layout");
  redirect(`/recibos/${resultado.valor.id}?nuevo=1`);
}
