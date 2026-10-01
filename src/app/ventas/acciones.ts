"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { operaciones } from "@/modules/operaciones";
import type { EstadoFormularioOperacion } from "@/modules/operaciones/ui/estado-formulario";
import { exigirSesion } from "@/server/auth/sesion";

export async function registrarVentaAccion(
  _estado: EstadoFormularioOperacion,
  formData: FormData,
): Promise<EstadoFormularioOperacion> {
  await exigirSesion();
  const pesos = formData.getAll("pesoKg").map(String);
  const unidades = formData.getAll("unidadPeso").map(String);
  const equivalencias = formData.getAll("equivalenciaKg").map(String);
  const precios = formData.getAll("precioPorKg").map(String);
  const resultado = await operaciones.registrarVenta({
    lineas: formData.getAll("materialId").map((materialId, indice) => ({
      materialId: String(materialId),
      pesoKg: pesos[indice] ?? "",
      unidadPeso: unidades[indice] ?? "kg",
      equivalenciaKg: equivalencias[indice] ?? "1",
      precioPorKg: precios[indice] ?? "",
    })),
  });
  if (!resultado.ok) return { errores: resultado.error };

  revalidatePath("/", "layout");
  redirect(`/recibos/${resultado.valor.id}?nuevo=1`);
}
