import type { Material, Tarifa } from "@/modules/materiales/domain/material";
import { precioDeCompra } from "@/modules/materiales/domain/material";
import type { Pesos } from "@/shared/dominio/dinero";
import { calcularSubtotal, type Gramos } from "@/shared/dominio/peso";
import { exito, fallo, type Resultado } from "@/shared/dominio/resultado";

export type TipoOperacion = "compra" | "venta";

export type LineaOperacion = {
  materialId: string;
  gramos: Gramos;
  // Copia del precio vigente: los recibos no cambian si luego se edita el material.
  precioPorKg: Pesos;
  tarifa: Tarifa | null;
  subtotal: Pesos;
};

export type NuevaOperacion = {
  tipo: TipoOperacion;
  lineas: LineaOperacion[];
  total: Pesos;
};

export type ErrorOperacion =
  | { tipo: "sin_lineas" }
  | { tipo: "peso_invalido"; indice: number }
  | { tipo: "material_no_disponible"; indice: number };

export type LineaSolicitada = { material: Material | undefined; gramos: Gramos };

function validarLineas(lineas: LineaSolicitada[]): Resultado<Material[], ErrorOperacion> {
  if (lineas.length === 0) return fallo({ tipo: "sin_lineas" });

  const materiales: Material[] = [];
  for (const [indice, { material, gramos }] of lineas.entries()) {
    if (!material?.activo) return fallo({ tipo: "material_no_disponible", indice });
    if (!Number.isInteger(gramos) || gramos <= 0) return fallo({ tipo: "peso_invalido", indice });
    materiales.push(material);
  }
  return exito(materiales);
}

function armarOperacion(tipo: TipoOperacion, lineas: LineaOperacion[]): NuevaOperacion {
  return { tipo, lineas, total: lineas.reduce((suma, linea) => suma + linea.subtotal, 0) };
}

export function crearCompra(
  solicitadas: LineaSolicitada[],
  tarifa: Tarifa,
): Resultado<NuevaOperacion, ErrorOperacion> {
  const validacion = validarLineas(solicitadas);
  if (!validacion.ok) return validacion;

  const lineas = validacion.valor.map((material, indice) => {
    const { gramos } = solicitadas[indice];
    const precioPorKg = precioDeCompra(material, tarifa);
    return {
      materialId: material.id,
      gramos,
      precioPorKg,
      tarifa,
      subtotal: calcularSubtotal(gramos, precioPorKg),
    };
  });
  return exito(armarOperacion("compra", lineas));
}
