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
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y contraseña." };

  try {
    await auth.api.signInEmail({
      body: { email, password, rememberMe: true },
      headers: await headers(),
    });
  } catch {
    return { error: "No fue posible iniciar sesión. Revisa tus datos e intenta de nuevo." };
  }

  redirect(destino.startsWith("/") && !destino.startsWith("//") ? destino : "/");
}

export async function cerrarSesionAccion() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/ingresar");
}
