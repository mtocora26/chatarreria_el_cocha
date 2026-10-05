import { z } from "zod";
import type { Pesos } from "@/shared/dominio/dinero";
import { esDiaValido, inicioDiaNegocio, sumarDias } from "@/shared/dominio/fecha";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";
import {
  calcularSaldo,
  evolucionDiaria,
  type DiaDeSaldo,
  type Flujos,
  type FlujoDia,
} from "../domain/saldo";
import {
  esquemaMotivo,
  esquemaMovimiento,
  type CampoMovimiento,
  type EntradaMovimiento,
} from "./validacion";

export type MovimientoCapital = {
  id: string;
  fecha: Date;
  tipo: "aporte" | "retiro";
  monto: Pesos;
  nota: string | null;
  estado: "activa" | "anulada";
  anulacion: { fecha: Date; usuario: string; motivo: string } | null;
};

export type DatosMovimiento = Pick<MovimientoCapital, "fecha" | "tipo" | "monto" | "nota">;

export interface RepositorioCapital {
  /** Suma de operaciones activas anteriores a `hasta`; sin límite, todas. */
  sumarFlujos(hasta?: Date): Promise<Flujos>;
  /** Operaciones activas en [desde, hasta) agrupadas por día del negocio. */
  flujosPorDia(desde: Date, hasta: Date): Promise<FlujoDia[]>;
  listarMovimientos(limite: number): Promise<MovimientoCapital[]>;
  crearMovimiento(datos: DatosMovimiento, usuarioId: string): Promise<{ id: string }>;
  anularMovimiento(
    id: string,
    datos: { usuarioId: string; motivo: string },
  ): Promise<"anulado" | "ya_anulado" | "no_existe">;
}

export type ErroresMovimiento = Partial<Record<CampoMovimiento | "general", string>>;

export type Evolucion = {
  desde: string;
  hasta: string;
  saldoInicial: Pesos;
  dias: DiaDeSaldo[];
  saldoFinal: Pesos;
};

const LIMITE_MOVIMIENTOS = 100;
const DIAS_POR_DEFECTO = 30;
const esId = (id: string) => z.uuid().safeParse(id).success;

export function crearCasosDeUsoCapital(repositorio: RepositorioCapital) {
  return {
    /** Saldo actual con su desglose. */
    async consultarSaldo() {
      return calcularSaldo(await repositorio.sumarFlujos());
    },

    listarMovimientos: () => repositorio.listarMovimientos(LIMITE_MOVIMIENTOS),

    /** Saldo al cierre de cada día con movimientos; fechas inválidas se ignoran (vienen de la URL). */
    async consultarEvolucion(
      entrada: { desde?: string; hasta?: string },
      hoy: string,
    ): Promise<Evolucion> {
      const hasta = entrada.hasta && esDiaValido(entrada.hasta) ? entrada.hasta : hoy;
      const desde =
        entrada.desde && esDiaValido(entrada.desde) && entrada.desde <= hasta
          ? entrada.desde
          : sumarDias(hasta, -(DIAS_POR_DEFECTO - 1));
      const inicio = inicioDiaNegocio(desde);
      const fin = inicioDiaNegocio(sumarDias(hasta, 1));

      const [antes, porDia] = await Promise.all([
        repositorio.sumarFlujos(inicio),
        repositorio.flujosPorDia(inicio, fin),
      ]);
      const saldoInicial = calcularSaldo(antes).saldo;
      const dias = evolucionDiaria(saldoInicial, porDia);
      return { desde, hasta, saldoInicial, dias, saldoFinal: dias.at(-1)?.saldo ?? saldoInicial };
    },

    async registrarMovimiento(
      entrada: EntradaMovimiento,
      usuarioId: string,
    ): Promise<Resultado<{ id: string }, ErroresMovimiento>> {
      const validacion = esquemaMovimiento.safeParse(entrada);
      if (!validacion.success) {
        const errores = z.flattenError(validacion.error).fieldErrors;
        return fallo(
          Object.fromEntries(Object.entries(errores).map(([campo, m]) => [campo, m?.[0]])),
        );
      }
      const { fecha, ...resto } = validacion.data;
      // Mediodía: queda en el día elegido sin importar la zona horaria del servidor.
      const instante = new Date(inicioDiaNegocio(fecha).getTime() + 12 * 3_600_000);
      return exito(await repositorio.crearMovimiento({ ...resto, fecha: instante }, usuarioId));
    },

    async anularMovimiento(
      id: string,
      datos: { usuarioId: string; motivo: string },
    ): Promise<Resultado<void, string>> {
      if (!esId(id)) return fallo("El movimiento no existe.");
      const motivo = esquemaMotivo.safeParse(datos.motivo);
      if (!motivo.success) return fallo(motivo.error.issues[0].message);

      const resultado = await repositorio.anularMovimiento(id, { ...datos, motivo: motivo.data });
      if (resultado === "anulado") return exito(undefined);
      return fallo(
        resultado === "ya_anulado"
          ? "El movimiento ya estaba anulado."
          : "El movimiento no existe.",
      );
    },
  };
}
