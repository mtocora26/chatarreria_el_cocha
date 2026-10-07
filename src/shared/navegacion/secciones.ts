export type Seccion = {
  href:
    | "/compras"
    | "/ventas"
    | "/inventario"
    | "/historial"
    | "/materiales"
    | "/terceros"
    | "/gastos"
    | "/capital"
    | "/rentabilidad"
    | "/usuarios";
  titulo: string;
  descripcion: string;
  /** El trabajador no la ve ni puede abrirla. */
  soloAdmin?: boolean;
};

export const SECCIONES: readonly Seccion[] = [
  {
    href: "/compras",
    titulo: "Compras",
    descripcion: "Registrar material comprado con su peso y precio.",
  },
  {
    href: "/ventas",
    titulo: "Ventas",
    descripcion: "Registrar material vendido sin dejar stock negativo.",
  },
  {
    href: "/inventario",
    titulo: "Inventario",
    descripcion: "Kilos disponibles de cada material.",
    soloAdmin: true,
  },
  {
    href: "/historial",
    titulo: "Historial",
    descripcion: "Consultar, anular o corregir compras y ventas.",
    soloAdmin: true,
  },
  {
    href: "/materiales",
    titulo: "Materiales",
    descripcion: "Materiales y precios por kilo de compra y venta.",
  },
  {
    href: "/terceros",
    titulo: "Terceros",
    descripcion: "Clientes y proveedores asociados a compras y ventas.",
  },
  {
    href: "/gastos",
    titulo: "Gastos",
    descripcion: "Dinero que sale del negocio, por categoría.",
    soloAdmin: true,
  },
  {
    href: "/capital",
    titulo: "Capital",
    descripcion: "Dinero disponible del negocio y su evolución.",
    soloAdmin: true,
  },
  {
    href: "/rentabilidad",
    titulo: "Rentabilidad",
    descripcion: "Utilidad del período y valor del inventario.",
    soloAdmin: true,
  },
  {
    href: "/usuarios",
    titulo: "Usuarios",
    descripcion: "Crear trabajadores y gestionar su acceso.",
    soloAdmin: true,
  },
];

export function seccionesPara(esAdmin: boolean): readonly Seccion[] {
  return SECCIONES.filter((seccion) => esAdmin || !seccion.soloAdmin);
}

/** Cuántas secciones caben en la barra sin menú "Más" (el pulgar y el ancho del encabezado alcanzan para 5). */
const MAXIMO_SIN_MENU = 5;
const VISIBLES_CON_MENU = MAXIMO_SIN_MENU - 1;

/** Separa las secciones de uso diario de las demás, que van en el menú "Más". */
export function dividirSecciones(esAdmin: boolean): {
  visibles: readonly Seccion[];
  resto: readonly Seccion[];
} {
  const secciones = seccionesPara(esAdmin);
  if (secciones.length <= MAXIMO_SIN_MENU) return { visibles: secciones, resto: [] };
  return {
    visibles: secciones.slice(0, VISIBLES_CON_MENU),
    resto: secciones.slice(VISIBLES_CON_MENU),
  };
}
