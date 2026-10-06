import type { Pesos } from "@/shared/dominio/dinero";

export type CategoriaGasto = { id: string; nombre: string; activo: boolean };

export type Gasto = {
  id: string;
  fecha: Date;
  categoriaId: string;
  categoria: string;
  monto: Pesos;
  descripcion: string | null;
  pagadoA: string | null;
  medioPago: string | null;
  estado: "activa" | "anulada";
  anulacion: { fecha: Date; usuario: string; motivo: string } | null;
};

export type DatosGasto = {
  fecha: Date;
  categoriaId: string;
  monto: Pesos;
  descripcion: string | null;
  pagadoA: string | null;
  medioPago: string | null;
};

export type FiltroGastos = {
  /** Desde este instante, incluido. */
  desde?: Date;
  /** Hasta este instante, excluido. */
  hasta?: Date;
  categoriaId?: string;
};

/** Gastos activos del período; las anulaciones no suman. */
export type ResumenGastos = {
  total: Pesos;
  cantidad: number;
  anulados: number;
  porCategoria: { categoriaId: string; categoria: string; total: Pesos; cantidad: number }[];
};
