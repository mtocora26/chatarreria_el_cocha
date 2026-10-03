import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

// cache() la resuelve una sola vez por petición: el layout y la página la
// piden y, sin esto, cada una consultaba la base de datos por separado.
export const obtenerSesion = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

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
