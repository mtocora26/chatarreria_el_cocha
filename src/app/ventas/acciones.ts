"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { operaciones } from "@/modules/operaciones";
import type { EstadoFormularioOperacion } from "@/modules/operaciones/ui/estado-formulario";

export async function registrarVentaAccion(
  _estado: EstadoFormularioOperacion,
  formData: FormData,
): Promise<EstadoFormularioOperacion> {
  const pesos = formData.getAll("pesoKg").map(String);
  const precios = formData.getAll("precioPorKg").map(String);
  const resultado = await operaciones.registrarVenta({
    lineas: formData.getAll("materialId").map((materialId, indice) => ({
      materialId: String(materialId),
      pesoKg: pesos[indice] ?? "",
      precioPorKg: precios[indice] ?? "",
    })),
  });
  if (!resultado.ok) return { errores: resultado.error };

  revalidatePath("/", "layout");
  redirect(`/recibos/${resultado.valor.id}?nuevo=1`);
}
