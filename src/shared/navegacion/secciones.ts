export type Seccion = {
  href: "/materiales" | "/compras" | "/ventas" | "/inventario";
  titulo: string;
  descripcion: string;
};

export const SECCIONES: readonly Seccion[] = [
  {
    href: "/materiales",
    titulo: "Materiales",
    descripcion: "Materiales y precios por kilo de compra y venta.",
  },
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
];
