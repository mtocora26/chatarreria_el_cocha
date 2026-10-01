import type { Pesos } from "@/shared/dominio/dinero";

export type Tarifa = "minorista" | "mayorista";

export type DatosMaterial = {
  nombre: string;
  precioCompraMinorista: Pesos | null;
  precioCompraMayorista: Pesos | null;
  precioVenta: Pesos | null;
  activo: boolean;
};

export type Material = DatosMaterial & { id: string };

export function precioDeCompra(material: Material, tarifa: Tarifa): Pesos | null {
  return tarifa === "mayorista" ? material.precioCompraMayorista : material.precioCompraMinorista;
}
