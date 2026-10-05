import Link from "next/link";
import { claseInsignia, claseTarjeta } from "@/shared/ui/estilos";
import { ETIQUETA_TIPO_TERCERO, type Tercero } from "../domain/tercero";

function Fila({ href, children }: { href: string | null; children: React.ReactNode }) {
  const clase = "flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3";
  if (href === null) return <div className={clase}>{children}</div>;
  return (
    <Link href={href} className={`hover:bg-marca-50 transition-colors ${clase}`}>
      {children}
    </Link>
  );
}

/** La fila abre la edición solo para quien puede editar. */
export function ListaTerceros({
  terceros,
  puedeEditar,
  vacio,
}: {
  terceros: Tercero[];
  puedeEditar: boolean;
  vacio: string;
}) {
  if (terceros.length === 0) {
    return <p className={`${claseTarjeta} p-6 text-center text-stone-600`}>{vacio}</p>;
  }

  return (
    <ul className={`${claseTarjeta} divide-y divide-stone-200 overflow-hidden`}>
      {terceros.map((tercero) => (
        <li key={tercero.id}>
          <Fila href={puedeEditar ? `/terceros/${tercero.id}` : null}>
            <span className="min-w-0">
              <span className="block font-semibold text-stone-900">{tercero.nombre}</span>
              <span className="block text-sm text-stone-500">
                {[tercero.documento, tercero.telefono].filter(Boolean).join(" · ") ||
                  "Sin documento ni teléfono"}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <span className={`${claseInsignia} bg-stone-100 text-stone-700`}>
                {ETIQUETA_TIPO_TERCERO[tercero.tipo]}
              </span>
              {puedeEditar && <span className="text-marca-700 text-sm font-medium">Editar</span>}
            </span>
          </Fila>
        </li>
      ))}
    </ul>
  );
}
