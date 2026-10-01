"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { materiales, type EntradaMaterial, type ErrorGuardarMaterial } from "@/modules/materiales";
import type { EstadoFormularioMaterial } from "@/modules/materiales/ui/estado-formulario";
import type { EstadoAccionConfirmada } from "@/shared/ui/dialogo-confirmacion";
import { exigirSesion } from "@/server/auth/sesion";

const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "");

function mensajeDeError(error: ErrorGuardarMaterial): EstadoFormularioMaterial {
  switch (error.tipo) {
    case "validacion":
      return { mensaje: "Revisa los campos marcados.", errores: error.errores };
    case "nombre_duplicado":
      return { errores: { nombre: "Ya existe un material con ese nombre." } };
    case "no_encontrado":
      return { mensaje: "El material ya no existe." };
  }
}

export async function guardarMaterialAccion(
  id: string | null,
  _estado: EstadoFormularioMaterial,
  formData: FormData,
): Promise<EstadoFormularioMaterial> {
  await exigirSesion();
  const entrada: EntradaMaterial = {
    nombre: texto(formData, "nombre"),
    precioCompraMinorista: texto(formData, "precioCompraMinorista"),
    precioCompraMayorista: texto(formData, "precioCompraMayorista"),
    precioVenta: texto(formData, "precioVenta"),
    activo: formData.get("activo") === "on",
  };

  const resultado = await materiales.guardarMaterial(id, entrada);
  if (!resultado.ok) return { ...mensajeDeError(resultado.error), valores: entrada };

  revalidatePath("/", "layout");
  redirect(`/materiales?guardado=${id === null ? "creado" : "actualizado"}`);
}

export async function eliminarMaterialAccion(id: string): Promise<EstadoAccionConfirmada> {
  await exigirSesion();
  const resultado = await materiales.eliminarMaterial(id);
  if (!resultado.ok) {
    return {
      error:
        resultado.error === "tiene_movimientos"
          ? "Este material ya tiene compras o ventas; desactívalo en lugar de eliminarlo."
          : "El material ya no existe.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/materiales?guardado=eliminado");
}

export async function cambiarActivoMaterialAccion(
  id: string,
  activo: boolean,
): Promise<EstadoAccionConfirmada> {
  await exigirSesion();
  const resultado = await materiales.cambiarActivo(id, activo);
  if (!resultado.ok) return { error: "El material ya no existe." };

  revalidatePath("/", "layout");
  redirect(`/materiales?guardado=${activo ? "reactivado" : "desactivado"}`);
}
