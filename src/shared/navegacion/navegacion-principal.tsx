"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dividirSecciones, type Seccion } from "./secciones";

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

const ICONO_MAS = (
  <>
    <circle cx="5" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="19" cy="12" r="1.2" />
  </>
);

function Icono({ href }: { href: Seccion["href"] | "mas" }) {
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
      {href === "mas" ? ICONO_MAS : ICONOS[href]}
    </svg>
  );
}

function useActiva() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Menú "Más": se cierra al navegar (queda abierto solo en la ruta donde se abrió),
 * con Escape y al tocar fuera.
 */
function useMenu() {
  const pathname = usePathname();
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === pathname;

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbiertoEn(null);
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [abierto]);

  return {
    abierto,
    alternar: () => setAbiertoEn(abierto ? null : pathname),
    cerrar: () => setAbiertoEn(null),
  };
}

const IDENTIFICADOR_MENU = "menu-mas";

/** Navegación dentro del encabezado, para pantallas anchas. */
export function NavegacionPrincipal({ esAdmin }: { esAdmin: boolean }) {
  const estaActiva = useActiva();
  const { abierto, alternar, cerrar } = useMenu();
  const { visibles, resto } = dividirSecciones(esAdmin);
  const restoActivo = resto.some(({ href }) => estaActiva(href));

  const claseEnlace = (activa: boolean) =>
    `relative flex min-h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:transition-opacity ${
      activa
        ? "bg-marca-800 text-white after:bg-oro-500 after:opacity-100"
        : "text-marca-100 hover:bg-marca-800 hover:text-white after:opacity-0"
    }`;

  return (
    <nav aria-label="Secciones principales" className="hidden sm:block">
      <ul className="flex gap-1">
        {visibles.map(({ href, titulo }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={estaActiva(href) ? "page" : undefined}
              className={claseEnlace(estaActiva(href))}
            >
              {titulo}
            </Link>
          </li>
        ))}
        {resto.length > 0 && (
          <li className="relative">
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls={IDENTIFICADOR_MENU}
              onClick={alternar}
              className={`${claseEnlace(restoActivo)} gap-1`}
            >
              Más
              <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className={`size-3 transition-transform duration-150 ${abierto ? "rotate-180" : ""}`}
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" />
              </svg>
            </button>
            {abierto && (
              <>
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  tabIndex={-1}
                  onClick={cerrar}
                  className="fixed inset-0 cursor-default"
                />
                <ul
                  id={IDENTIFICADOR_MENU}
                  className="menu-entrada absolute top-full right-0 mt-2 w-72 rounded-xl border border-stone-200 bg-white p-1.5 text-stone-900 shadow-lg"
                >
                  {resto.map(({ href, titulo, descripcion }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={estaActiva(href) ? "page" : undefined}
                        className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-stone-100 ${
                          estaActiva(href) ? "bg-oro-100" : ""
                        }`}
                      >
                        <span className="bg-marca-50 text-marca-900 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                          <Icono href={href} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{titulo}</span>
                          <span className="block text-xs text-stone-600">{descripcion}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}

/** Barra fija inferior en el teléfono: lo de uso diario al alcance del pulgar y el resto en "Más". */
export function NavegacionInferior({ esAdmin }: { esAdmin: boolean }) {
  const estaActiva = useActiva();
  const { abierto, alternar, cerrar } = useMenu();
  const { visibles, resto } = dividirSecciones(esAdmin);
  const restoActivo = resto.some(({ href }) => estaActiva(href));
  const columnas = visibles.length + (resto.length > 0 ? 1 : 0);

  const claseItem = (activa: boolean) =>
    `flex h-full w-full flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors active:scale-95 ${
      activa ? "text-marca-900" : "text-stone-600"
    }`;
  const claseBurbuja = (activa: boolean) =>
    `flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
      activa ? "bg-oro-100 text-marca-900" : ""
    }`;

  return (
    <nav
      aria-label="Secciones principales"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden print:hidden"
    >
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          tabIndex={-1}
          onClick={cerrar}
          className="fixed inset-0 cursor-default bg-stone-900/30"
        />
      )}
      <ul
        className="relative grid h-16 bg-white"
        style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}
      >
        {visibles.map(({ href, titulo }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={estaActiva(href) ? "page" : undefined}
              className={claseItem(estaActiva(href))}
            >
              <span className={claseBurbuja(estaActiva(href))}>
                <Icono href={href} />
              </span>
              {titulo}
            </Link>
          </li>
        ))}
        {resto.length > 0 && (
          <li>
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls={IDENTIFICADOR_MENU}
              onClick={alternar}
              className={claseItem(restoActivo || abierto)}
            >
              <span className={claseBurbuja(restoActivo || abierto)}>
                <Icono href="mas" />
              </span>
              Más
            </button>
          </li>
        )}
      </ul>
      {abierto && (
        <ul
          id={IDENTIFICADOR_MENU}
          style={{ "--origen-menu": "bottom right" } as React.CSSProperties}
          className="menu-entrada absolute right-3 bottom-full left-3 mb-2 grid grid-cols-2 gap-1 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg"
        >
          {resto.map(({ href, titulo }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={estaActiva(href) ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors active:bg-stone-100 ${
                  estaActiva(href) ? "bg-oro-100 text-marca-900" : "text-stone-800"
                }`}
              >
                <span className="text-marca-700">
                  <Icono href={href} />
                </span>
                {titulo}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
