"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { materiales, type Material } from "@/modules/materiales";
import { ERROR_GENERAL, operaciones } from "@/modules/operaciones";
import type { ResultadoNuevoMaterial } from "@/modules/operaciones/ui/dialogo-nuevo-material";
import type { EstadoFormularioOperacion } from "@/modules/operaciones/ui/estado-formulario";
import { esAdmin, exigirAdmin, exigirSesion } from "@/server/auth/sesion";

export async function registrarCompraAccion(
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
  const resultado = await operaciones.registrarCompra(
    {
      tarifa: String(formData.get("tarifa") ?? ""),
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

type MaterialDeCompra = Extract<ResultadoNuevoMaterial, { material: unknown }>["material"];

const paraCompra = (material: Material): MaterialDeCompra => ({
  id: material.id,
  nombre: material.nombre,
  precioCompraMinorista: material.precioCompraMinorista,
  precioCompraMayorista: material.precioCompraMayorista,
});

/** Crea un material sin salir de la compra; si existe inactivo, ofrece reactivarlo. */
export async function crearMaterialDesdeCompraAccion(
  nombre: string,
  precio: string,
): Promise<ResultadoNuevoMaterial> {
  await exigirSesion();
  const resultado = await materiales.guardarMaterial(null, {
    nombre,
    precioCompraMinorista: precio,
    precioCompraMayorista: precio,
    precioVenta: "",
    activo: true,
  });
  if (resultado.ok) {
    revalidatePath("/", "layout");
    return { material: paraCompra(resultado.valor) };
  }

  switch (resultado.error.tipo) {
    case "validacion": {
      const { nombre: errorNombre, precioCompraMinorista } = resultado.error.errores;
      return { error: errorNombre ?? precioCompraMinorista ?? "Revisa los datos." };
    }
    case "nombre_duplicado": {
      const buscado = nombre.trim().toLowerCase();
      const existente = (await materiales.listarMateriales()).find(
        (m) => m.nombre.toLowerCase() === buscado,
      );
      if (existente && !existente.activo) {
        return { inactivo: { id: existente.id, nombre: existente.nombre } };
      }
      if (existente) return { material: paraCompra(existente) };
      return { error: "Ya existe un material con ese nombre." };
    }
    case "no_encontrado":
      return { error: "No se pudo crear el material." };
  }
}

export async function reactivarMaterialDesdeCompraAccion(
  id: string,
): Promise<ResultadoNuevoMaterial> {
  if (!(await exigirAdmin())) {
    return { error: "Este material está desactivado. Pide al administrador que lo reactive." };
  }
  const resultado = await materiales.cambiarActivo(id, true);
  if (!resultado.ok) return { error: "El material ya no existe." };
  revalidatePath("/", "layout");
  return { material: paraCompra(resultado.valor) };
}
