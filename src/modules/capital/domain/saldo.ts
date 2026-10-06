import type { Pesos } from "@/shared/dominio/dinero";

/** Conceptos que mueven el dinero del negocio. Las operaciones anuladas no se incluyen. */
export type Concepto = "aporte" | "retiro" | "venta" | "compra" | "gasto";

export type Flujos = Record<Concepto, Pesos>;

export const SIN_FLUJOS: Flujos = { aporte: 0, retiro: 0, venta: 0, compra: 0, gasto: 0 };

export type Saldo = Flujos & { saldo: Pesos };

/** Entra dinero con aportes y ventas; sale con retiros, compras y gastos. */
export function calcularSaldo(flujos: Flujos): Saldo {
  const entradas = flujos.aporte + flujos.venta;
  const salidas = flujos.retiro + flujos.compra + flujos.gasto;
  return { ...flujos, saldo: entradas - salidas };
}

export type FlujoDia = { dia: string; flujos: Flujos };

export type DiaDeSaldo = {
  dia: string;
  entradas: Pesos;
  salidas: Pesos;
  /** Saldo al cierre del día. */
  saldo: Pesos;
};

/** Saldo al cierre de cada día con movimientos, partiendo del saldo anterior al período. */
export function evolucionDiaria(saldoInicial: Pesos, dias: FlujoDia[]): DiaDeSaldo[] {
  let saldo = saldoInicial;
  return [...dias]
    .sort((a, b) => a.dia.localeCompare(b.dia))
    .map(({ dia, flujos }) => {
      const entradas = flujos.aporte + flujos.venta;
      const salidas = flujos.retiro + flujos.compra + flujos.gasto;
      saldo += entradas - salidas;
      return { dia, entradas, salidas, saldo };
    });
}
