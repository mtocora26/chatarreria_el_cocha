"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { seccionesPara, type Seccion } from "./secciones";

// Trazos simples de 24×24; se dibujan con el color del texto.
const ICONOS: Record<Seccion["href"], React.ReactNode> = {
  "/compras": <path d="M12 5v14M5 12h14" />,
  "/ventas": <path d="M5 12h14M13 6l6 6-6 6" />,
  "/inventario": (
    <>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </>
  ),
  "/historial": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  "/materiales": (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  "/terceros": (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3.5-5.5 7-5.5s7 2 7 5.5" />
      <path d="M17 5a3.5 3.5 0 0 1 0 7M19 20c0-2.5-1.5-4-3-4.8" />
    </>
  ),
  "/gastos": (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9v.01M18 15v.01" />
    </>
  ),
  "/capital": (
    <>
      <path d="M3 18l6-6 4 4 8-8" />
      <path d="M15 8h6v6" />
    </>
  ),
  "/rentabilidad": (
    <>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </>
  ),
  "/usuarios": (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
};

function Icono({ href }: { href: Seccion["href"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-5"
    >
      {ICONOS[href]}
    </svg>
  );
}

function useActiva() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Navegación dentro del encabezado, para pantallas anchas. */
export function NavegacionPrincipal({ esAdmin }: { esAdmin: boolean }) {
  const estaActiva = useActiva();

  return (
    <nav aria-label="Secciones principales" className="hidden sm:block">
      <ul className="flex gap-1">
        {seccionesPara(esAdmin).map(({ href, titulo }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={estaActiva(href) ? "page" : undefined}
              className={`flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                estaActiva(href)
                  ? "bg-oro-500 text-marca-950"
                  : "text-marca-100 hover:bg-marca-800 hover:text-white"
              }`}
            >
              {titulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Barra fija inferior en el teléfono: las secciones quedan al alcance del pulgar. */
export function NavegacionInferior({ esAdmin }: { esAdmin: boolean }) {
  const estaActiva = useActiva();
  const secciones = seccionesPara(esAdmin);

  return (
    <nav
      aria-label="Secciones principales"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden print:hidden"
    >
      <ul
        className="grid h-16"
        style={{ gridTemplateColumns: `repeat(${secciones.length}, minmax(0, 1fr))` }}
      >
        {secciones.map(({ href, titulo }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={estaActiva(href) ? "page" : undefined}
              className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                estaActiva(href) ? "text-marca-900" : "text-stone-500"
              }`}
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full ${
                  estaActiva(href) ? "bg-oro-100 text-marca-900" : ""
                }`}
              >
                <Icono href={href} />
              </span>
              {titulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
