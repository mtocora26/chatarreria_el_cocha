"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { gastos, type EntradaGasto } from "@/modules/gastos";
import type { EstadoFormularioGasto } from "@/modules/gastos/ui/estado-formulario";
import type { EstadoAccionConfirmada } from "@/shared/ui/dialogo-confirmacion";
import { exigirAdmin } from "@/server/auth/sesion";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "");
const SOLO_ADMIN = "Solo un administrador puede gestionar gastos.";

export async function registrarGastoAccion(
  _estado: EstadoFormularioGasto,
  formData: FormData,
): Promise<EstadoFormularioGasto> {
  const sesion = await exigirAdmin();
  if (!sesion) return { mensaje: SOLO_ADMIN };
  const entrada: EntradaGasto = {
    fecha: texto(formData, "fecha"),
    categoriaId: texto(formData, "categoriaId"),
    monto: texto(formData, "monto"),
    descripcion: texto(formData, "descripcion"),
    pagadoA: texto(formData, "pagadoA"),
    medioPago: texto(formData, "medioPago"),
  };

  const resultado = await gastos.registrarGasto(entrada, sesion.user.id);
  if (!resultado.ok) {
    return { mensaje: "Revisa los campos marcados.", errores: resultado.error, valores: entrada };
  }

  revalidatePath("/gastos");
  redirect("/gastos?guardado=creado");
}

export async function anularGastoAccion(
  id: string,
  _estado: EstadoAccionConfirmada,
  formData: FormData,
): Promise<EstadoAccionConfirmada> {
  const sesion = await exigirAdmin();
  if (!sesion) return { error: SOLO_ADMIN };

  const resultado = await gastos.anularGasto(id, {
    usuarioId: sesion.user.id,
    motivo: texto(formData, "motivo"),
  });
  if (!resultado.ok) return { error: resultado.error.general };

  revalidatePath("/gastos");
  return { hecho: true };
}

export async function crearCategoriaAccion(
  _estado: EstadoAccionConfirmada,
  formData: FormData,
): Promise<EstadoAccionConfirmada> {
  if (!(await exigirAdmin())) return { error: SOLO_ADMIN };
  const resultado = await gastos.crearCategoria(texto(formData, "nombre"));
  if (!resultado.ok) return { error: resultado.error };

  revalidatePath("/gastos", "layout");
  return { hecho: true };
}

export async function cambiarActivoCategoriaAccion(
  id: string,
  activo: boolean,
): Promise<EstadoAccionConfirmada> {
  if (!(await exigirAdmin())) return { error: SOLO_ADMIN };
  if (!(await gastos.cambiarActivoCategoria(id, activo))) {
    return { error: "La categoría ya no existe." };
  }

  revalidatePath("/gastos", "layout");
  return { hecho: true };
}
