"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ERROR_GENERAL, operaciones } from "@/modules/operaciones";
import type { EstadoFormularioOperacion } from "@/modules/operaciones/ui/estado-formulario";
import { esAdmin, exigirSesion } from "@/server/auth/sesion";

export async function registrarVentaAccion(
  _estado: EstadoFormularioOperacion,
  formData: FormData,
): Promise<EstadoFormularioOperacion> {
  const sesion = await exigirSesion();
  // Una corrección anula la operación original: solo la puede hacer un administrador.
  const corrigeA = String(formData.get("corrigeA") ?? "");
  if (corrigeA && !esAdmin(sesion)) {
    return { mensaje: "Solo un administrador puede corregir operaciones." };
  }
  const pesos = formData.getAll("pesoKg").map(String);
  const unidades = formData.getAll("unidadPeso").map(String);
  const equivalencias = formData.getAll("equivalenciaKg").map(String);
  const precios = formData.getAll("precioPorKg").map(String);
  const resultado = await operaciones.registrarVenta(
    {
      lineas: formData.getAll("materialId").map((materialId, indice) => ({
        materialId: String(materialId),
        pesoKg: pesos[indice] ?? "",
        unidadPeso: unidades[indice] ?? "kg",
        equivalenciaKg: equivalencias[indice] ?? "1",
        precioPorKg: precios[indice] ?? "",
      })),
    },
    corrigeA
      ? {
          operacionId: corrigeA,
          usuarioId: sesion.user.id,
          motivo: String(formData.get("motivo") ?? ""),
        }
      : undefined,
  );
  if (!resultado.ok) {
    const { [ERROR_GENERAL]: mensaje, ...errores } = resultado.error;
    return { mensaje, errores };
  }

  revalidatePath("/", "layout");
  redirect(`/recibos/${resultado.valor.id}?nuevo=1`);
}
