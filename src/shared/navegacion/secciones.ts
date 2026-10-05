export type Seccion = {
  href: "/compras" | "/ventas" | "/inventario" | "/historial" | "/materiales" | "/usuarios";
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
    href: "/usuarios",
    titulo: "Usuarios",
    descripcion: "Crear trabajadores y gestionar su acceso.",
    soloAdmin: true,
  },
];

export function seccionesPara(esAdmin: boolean): readonly Seccion[] {
  return SECCIONES.filter((seccion) => esAdmin || !seccion.soloAdmin);
}
