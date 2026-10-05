"use server";

import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  correoDeCuenta,
  esquemaNuevaPassword,
  esquemaNuevoTrabajador,
  type CampoNuevoTrabajador,
  type EntradaNuevoTrabajador,
} from "@/modules/usuarios/application/validacion";
import type { EstadoAccionConfirmada } from "@/shared/ui/dialogo-confirmacion";
import { auth } from "@/server/auth";
import { exigirAdmin } from "@/server/auth/sesion";

export type EstadoNuevoTrabajador = {
  mensaje?: string;
  creado?: string;
  errores?: Partial<Record<CampoNuevoTrabajador, string>>;
  valores?: Omit<EntradaNuevoTrabajador, "password">;
};

const SOLO_ADMIN = "Solo un administrador puede gestionar usuarios.";
const texto = (formData: FormData, campo: string) => String(formData.get(campo) ?? "");

export async function crearTrabajadorAccion(
  _estado: EstadoNuevoTrabajador,
  formData: FormData,
): Promise<EstadoNuevoTrabajador> {
  if (!(await exigirAdmin())) return { mensaje: SOLO_ADMIN };

  const entrada: EntradaNuevoTrabajador = {
    nombre: texto(formData, "nombre"),
    usuario: texto(formData, "usuario"),
    correo: texto(formData, "correo"),
    password: texto(formData, "password"),
  };
  const valores = { nombre: entrada.nombre, usuario: entrada.usuario, correo: entrada.correo };
  const analisis = esquemaNuevoTrabajador.safeParse(entrada);
  if (!analisis.success) {
    const errores: EstadoNuevoTrabajador["errores"] = {};
    for (const incidencia of analisis.error.issues) {
      const campo = incidencia.path[0] as CampoNuevoTrabajador;
      errores[campo] ??= incidencia.message;
    }
    return { mensaje: "Revisa los campos marcados.", errores, valores };
  }

  const datos = analisis.data;
  try {
    await auth.api.createUser({
      body: {
        name: datos.nombre,
        email: correoDeCuenta(datos.usuario, datos.correo),
        password: datos.password,
        role: "user",
        data: { username: datos.usuario },
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      // Usuario o correo repetidos: la base los exige únicos.
      return { errores: { usuario: "Ya existe una cuenta con ese usuario o correo." }, valores };
    }
    throw error;
  }

  revalidatePath("/usuarios");
  return { creado: datos.nombre };
}

/** Un trabajador es cualquier cuenta que no sea administrador; al administrador no se le aplican estas acciones. */
async function validarObjetivo(idObjetivo: string) {
  const sesion = await exigirAdmin();
  if (!sesion) return { error: SOLO_ADMIN } as const;
  if (sesion.user.id === idObjetivo) {
    return { error: "No puedes modificar tu propia cuenta desde aquí." } as const;
  }
  const { users } = await auth.api.listUsers({
    query: { filterField: "id", filterValue: idObjetivo, limit: 1 },
    headers: await headers(),
  });
  const objetivo = users[0];
  if (!objetivo) return { error: "El usuario ya no existe." } as const;
  if (objetivo.role === "admin") {
    return { error: "Las cuentas de administrador no se gestionan desde aquí." } as const;
  }
  return { objetivo } as const;
}

export async function cambiarEstadoUsuarioAccion(
  idUsuario: string,
  desactivar: boolean,
): Promise<EstadoAccionConfirmada> {
  const validacion = await validarObjetivo(idUsuario);
  if ("error" in validacion) return { error: validacion.error };

  const encabezados = await headers();
  if (desactivar) {
    // banUser también revoca las sesiones abiertas de la cuenta.
    await auth.api.banUser({
      body: { userId: idUsuario, banReason: "Desactivado por el administrador" },
      headers: encabezados,
    });
    await auth.api.revokeUserSessions({ body: { userId: idUsuario }, headers: encabezados });
  } else {
    await auth.api.unbanUser({ body: { userId: idUsuario }, headers: encabezados });
  }
  revalidatePath("/usuarios");
  return { hecho: true };
}

export async function restablecerPasswordAccion(
  idUsuario: string,
  _estado: EstadoAccionConfirmada,
  formData: FormData,
): Promise<EstadoAccionConfirmada> {
  const validacion = await validarObjetivo(idUsuario);
  if ("error" in validacion) return { error: validacion.error };

  const password = esquemaNuevaPassword.safeParse(texto(formData, "password"));
  if (!password.success) return { error: password.error.issues[0].message };

  const encabezados = await headers();
  await auth.api.setUserPassword({
    body: { userId: idUsuario, newPassword: password.data },
    headers: encabezados,
  });
  // La contraseña anterior deja de servir: se cierran las sesiones abiertas.
  await auth.api.revokeUserSessions({ body: { userId: idUsuario }, headers: encabezados });
  revalidatePath("/usuarios");
  return { hecho: true };
}
