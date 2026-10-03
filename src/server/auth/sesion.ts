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

/** Administrador: único que anula, corrige, ve inventario e historial y edita materiales. */
export function esAdmin(sesion: Sesion): boolean {
  return sesion.user.role === "admin";
}

/** Para páginas exclusivas del administrador: al trabajador lo devuelve al inicio. */
export async function exigirAdminPagina() {
  const sesion = await exigirSesion();
  if (!esAdmin(sesion)) redirect("/");
  return sesion;
}

/** Para server actions: devuelve la sesión solo si es de un administrador. */
export async function exigirAdmin(): Promise<Sesion | null> {
  const sesion = await exigirSesion();
  return esAdmin(sesion) ? sesion : null;
}
