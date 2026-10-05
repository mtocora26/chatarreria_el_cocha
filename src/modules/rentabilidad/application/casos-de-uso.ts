import type { Material } from "@/modules/materiales/domain/material";
import type { FiltroGastos, ResumenGastos } from "@/modules/gastos/domain/gasto";
import type { Pesos } from "@/shared/dominio/dinero";
import { esDiaValido, inicioDiaNegocio, sumarDias } from "@/shared/dominio/fecha";
import type { Gramos } from "@/shared/dominio/peso";
import { calcularCostos, type EventoMaterial, type RentabilidadMaterial } from "../domain/costos";

export interface RepositorioRentabilidad {
  /** Líneas de compras y ventas activas, de la más antigua a la más reciente. */
  listarEventos(): Promise<EventoMaterial[]>;
}

export interface CatalogoPrecios {
  listarMateriales(): Promise<Pick<Material, "id" | "precioVenta">[]>;
}

export interface ResumidorGastos {
  resumirGastos(filtro: FiltroGastos): Promise<ResumenGastos>;
}

export type ExistenciaConValor = {
  materialId: string;
  material: string;
  gramos: Gramos;
  valorCosto: Pesos;
  /** Precio de venta (mayorista) configurado; null si el material no tiene. */
  precioVenta: Pesos | null;
  valorVenta: Pesos | null;
};

export type ReporteRentabilidad = {
  desde: string | null;
  hasta: string | null;
  ingresos: Pesos;
  costoVendido: Pesos;
  utilidadBruta: Pesos;
  /** Utilidad bruta sobre ingresos; null si no hubo ventas. */
  margenBruto: number | null;
  gastos: ResumenGastos;
  utilidadNeta: Pesos;
  porMaterial: RentabilidadMaterial[];
  inventario: {
    items: ExistenciaConValor[];
    valorCosto: Pesos;
    /** Solo de los materiales que tienen precio de venta. */
    valorVenta: Pesos;
    utilidadPotencial: Pesos;
    sinPrecio: string[];
  };
};

export function crearCasosDeUsoRentabilidad(
  repositorio: RepositorioRentabilidad,
  catalogo: CatalogoPrecios,
  gastos: ResumidorGastos,
) {
  return {
    /** Fechas inválidas se ignoran en lugar de fallar: vienen de la URL. */
    async consultarRentabilidad(entrada: {
      desde?: string;
      hasta?: string;
    }): Promise<ReporteRentabilidad> {
      const desde = entrada.desde && esDiaValido(entrada.desde) ? entrada.desde : undefined;
      const hasta = entrada.hasta && esDiaValido(entrada.hasta) ? entrada.hasta : undefined;
      const periodo = {
        desde: desde ? inicioDiaNegocio(desde) : undefined,
        hasta: hasta ? inicioDiaNegocio(sumarDias(hasta, 1)) : undefined,
      };

      const [eventos, materiales, resumenGastos] = await Promise.all([
        repositorio.listarEventos(),
        catalogo.listarMateriales(),
        gastos.resumirGastos(periodo),
      ]);
      const costos = calcularCostos(eventos, periodo);
      const precios = new Map(materiales.map((m) => [m.id, m.precioVenta]));

      const items = costos.inventario.map((existencia) => {
        const precioVenta = precios.get(existencia.materialId) ?? null;
        return {
          ...existencia,
          precioVenta,
          valorVenta:
            precioVenta === null ? null : Math.round((existencia.gramos / 1000) * precioVenta),
        };
      });
      const conPrecio = items.filter((i) => i.valorVenta !== null);
      const valorVenta = conPrecio.reduce((suma, i) => suma + (i.valorVenta ?? 0), 0);
      const costoConPrecio = conPrecio.reduce((suma, i) => suma + i.valorCosto, 0);
      const utilidadBruta = costos.ingresos - costos.costoVendido;

      return {
        desde: desde ?? null,
        hasta: hasta ?? null,
        ingresos: costos.ingresos,
        costoVendido: costos.costoVendido,
        utilidadBruta,
        margenBruto: costos.ingresos > 0 ? utilidadBruta / costos.ingresos : null,
        gastos: resumenGastos,
        utilidadNeta: utilidadBruta - resumenGastos.total,
        porMaterial: costos.porMaterial,
        inventario: {
          items,
          valorCosto: items.reduce((suma, i) => suma + i.valorCosto, 0),
          valorVenta,
          utilidadPotencial: valorVenta - costoConPrecio,
          sinPrecio: items.filter((i) => i.valorVenta === null).map((i) => i.material),
        },
      };
    },
  };
}
