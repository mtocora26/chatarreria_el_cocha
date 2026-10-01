import Link from "next/link";
import { SECCIONES } from "@/shared/navegacion/secciones";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { exigirSesion } from "@/server/auth/sesion";

export default async function Inicio() {
  await exigirSesion();
  return (
    <>
      <EncabezadoPagina titulo="Inicio" descripcion="¿Qué quieres hacer hoy?" />
      <ul className="grid gap-4 sm:grid-cols-2">
        {SECCIONES.map(({ href, titulo, descripcion }) => (
          <li key={href}>
            <Link
              href={href}
              className="block h-full rounded-lg border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-500 hover:shadow"
            >
              <h2 className="text-lg font-semibold text-stone-900">{titulo}</h2>
              <p className="mt-1 text-sm text-stone-600">{descripcion}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
