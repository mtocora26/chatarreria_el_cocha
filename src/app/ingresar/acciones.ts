"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export type EstadoIngreso = { error?: string };

export async function ingresarAccion(
  destino: string,
  _estado: EstadoIngreso,
  formData: FormData,
): Promise<EstadoIngreso> {
  const usuario = String(formData.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!usuario || !password) return { error: "Escribe tu usuario y contraseña." };

  try {
    // Se acepta el correo además del usuario: el administrador inicial puede seguir
    // entrando con él mientras no tenga un usuario asignado.
    if (usuario.includes("@")) {
      await auth.api.signInEmail({
        body: { email: usuario, password, rememberMe: true },
        headers: await headers(),
      });
    } else {
      await auth.api.signInUsername({
        body: { username: usuario, password, rememberMe: true },
        headers: await headers(),
      });
    }
  } catch {
    return { error: "No fue posible iniciar sesión. Revisa tus datos e intenta de nuevo." };
  }

  redirect(destino.startsWith("/") && !destino.startsWith("//") ? destino : "/");
}

export async function cerrarSesionAccion() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/ingresar");
}
