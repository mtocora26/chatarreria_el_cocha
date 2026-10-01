export type Seccion = {
  href: "/compras" | "/ventas" | "/inventario" | "/historial" | "/materiales";
  titulo: string;
  descripcion: string;
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
  },
  {
    href: "/historial",
    titulo: "Historial",
    descripcion: "Consultar, anular o corregir compras y ventas.",
  },
  {
    href: "/materiales",
    titulo: "Materiales",
    descripcion: "Materiales y precios por kilo de compra y venta.",
  },
];
