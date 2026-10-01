import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export async function obtenerSesion() {
  return auth.api.getSession({ headers: await headers() });
}

export async function exigirSesion() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/ingresar");
  return sesion;
}

type Sesion = NonNullable<Awaited<ReturnType<typeof obtenerSesion>>>;

/** Anular y corregir operaciones es exclusivo del administrador. */
export function esAdmin(sesion: Sesion): boolean {
  return sesion.user.role === "admin";
}

/** Para server actions: devuelve la sesión solo si es de un administrador. */
export async function exigirAdmin(): Promise<Sesion | null> {
  const sesion = await exigirSesion();
  return esAdmin(sesion) ? sesion : null;
}
