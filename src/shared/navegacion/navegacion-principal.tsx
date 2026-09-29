"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECCIONES } from "./secciones";

export function NavegacionPrincipal() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones principales">
      <ul className="grid grid-cols-4 gap-1 sm:flex sm:gap-2">
        {SECCIONES.map(({ href, titulo }) => {
          const estaActiva = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={estaActiva ? "page" : undefined}
                className={`block rounded-md px-2 py-2 text-center text-sm font-medium transition-colors sm:px-3 ${
                  estaActiva
                    ? "bg-amber-700 text-white"
                    : "text-stone-700 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                {titulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
