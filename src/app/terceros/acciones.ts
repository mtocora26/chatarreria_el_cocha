"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { terceros, type EntradaTercero, type ErrorGuardarTercero } from "@/modules/terceros";
import type { EstadoFormularioTercero } from "@/modules/terceros/ui/estado-formulario";
import { exigirAdmin, exigirSesion } from "@/server/auth/sesion";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "");

function mensajeDeError(error: ErrorGuardarTercero): EstadoFormularioTercero {
  return error.tipo === "validacion"
    ? { mensaje: "Revisa los campos marcados.", errores: error.errores }
    : { mensaje: "El tercero ya no existe." };
}

export async function guardarTerceroAccion(
  id: string | null,
  _estado: EstadoFormularioTercero,
  formData: FormData,
): Promise<EstadoFormularioTercero> {
  // Crear está abierto al trabajador; modificar uno existente es del administrador.
  const sesion = id === null ? await exigirSesion() : await exigirAdmin();
  if (!sesion) return { mensaje: "Solo un administrador puede modificar terceros." };
  const entrada: EntradaTercero = {
    nombre: texto(formData, "nombre"),
    tipo: texto(formData, "tipo"),
    documento: texto(formData, "documento"),
    telefono: texto(formData, "telefono"),
  };

  const resultado = await terceros.guardarTercero(id, entrada);
  if (!resultado.ok) return { ...mensajeDeError(resultado.error), valores: entrada };

  revalidatePath("/", "layout");
  redirect(`/terceros?guardado=${id === null ? "creado" : "actualizado"}`);
}
