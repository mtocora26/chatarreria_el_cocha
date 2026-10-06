import type { Pesos } from "@/shared/dominio/dinero";
import type { Gramos } from "@/shared/dominio/peso";

/** Línea de una compra o venta activa; llegan en orden cronológico. */
export type EventoMaterial = {
  materialId: string;
  material: string;
  tipo: "compra" | "venta";
  fecha: Date;
  gramos: Gramos;
  /** Total de la línea en pesos. */
  subtotal: Pesos;
};

export type Periodo = {
  /** Desde este instante, incluido. */
  desde?: Date;
  /** Hasta este instante, excluido. */
  hasta?: Date;
};

export type RentabilidadMaterial = {
  materialId: string;
  material: string;
  gramosVendidos: Gramos;
  ingresos: Pesos;
  costo: Pesos;
  utilidad: Pesos;
  /** Se vendió más de lo que las compras registradas cubren: el costo de ese tramo es cero. */
  sinCosto: boolean;
};

export type ExistenciaValorada = {
  materialId: string;
  material: string;
  gramos: Gramos;
  /** Lo que costó lo que queda, a costo promedio. */
  valorCosto: Pesos;
};

export type ResultadoCostos = {
  ingresos: Pesos;
  costoVendido: Pesos;
  porMaterial: RentabilidadMaterial[];
  /** Inventario al final del historial completo. */
  inventario: ExistenciaValorada[];
};

type Acumulado = { gramos: Gramos; valor: number };

/**
 * Costo promedio ponderado móvil por material: cada compra suma kilos y valor; cada venta
 * descuenta kilos al costo promedio vigente en ese momento. Se recorre todo el historial
 * (el costo de una venta depende de las compras anteriores), pero solo se contabilizan las
 * ventas que caen dentro del período.
 */
export function calcularCostos(eventos: EventoMaterial[], periodo: Periodo = {}): ResultadoCostos {
  const existencias = new Map<string, Acumulado>();
  const resumen = new Map<string, RentabilidadMaterial>();
  const nombres = new Map<string, string>();

  for (const evento of eventos) {
    nombres.set(evento.materialId, evento.material);
    const actual = existencias.get(evento.materialId) ?? { gramos: 0, valor: 0 };

    if (evento.tipo === "compra") {
      existencias.set(evento.materialId, {
        gramos: actual.gramos + evento.gramos,
        valor: actual.valor + evento.subtotal,
      });
      continue;
    }

    // Venta: lo que sale se valora al promedio; lo que no tiene compra detrás cuesta cero.
    const cubiertos = Math.min(evento.gramos, Math.max(actual.gramos, 0));
    const costo = actual.gramos > 0 ? actual.valor * (cubiertos / actual.gramos) : 0;
    existencias.set(evento.materialId, {
      gramos: actual.gramos - cubiertos,
      valor: actual.valor - costo,
    });

    const dentro =
      (!periodo.desde || evento.fecha >= periodo.desde) &&
      (!periodo.hasta || evento.fecha < periodo.hasta);
    if (!dentro) continue;

    const fila = resumen.get(evento.materialId) ?? {
      materialId: evento.materialId,
      material: evento.material,
      gramosVendidos: 0,
      ingresos: 0,
      costo: 0,
      utilidad: 0,
      sinCosto: false,
    };
    fila.gramosVendidos += evento.gramos;
    fila.ingresos += evento.subtotal;
    fila.costo += costo;
    fila.sinCosto ||= cubiertos < evento.gramos;
    resumen.set(evento.materialId, fila);
  }

  const porMaterial = [...resumen.values()]
    .map((fila) => {
      const costo = Math.round(fila.costo);
      return { ...fila, costo, utilidad: fila.ingresos - costo };
    })
    .sort((a, b) => b.utilidad - a.utilidad);

  return {
    ingresos: porMaterial.reduce((suma, f) => suma + f.ingresos, 0),
    costoVendido: porMaterial.reduce((suma, f) => suma + f.costo, 0),
    porMaterial,
    inventario: [...existencias]
      .filter(([, e]) => e.gramos > 0)
      .map(([materialId, e]) => ({
        materialId,
        material: nombres.get(materialId) ?? "",
        gramos: e.gramos,
        valorCosto: Math.round(e.valor),
      }))
      .sort((a, b) => a.material.localeCompare(b.material, "es")),
  };
}
