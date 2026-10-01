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
