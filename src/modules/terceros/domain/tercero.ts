export type TipoTercero = "cliente" | "proveedor" | "ambos";

export type DatosTercero = {
  nombre: string;
  documento: string | null;
  telefono: string | null;
  tipo: TipoTercero;
};

export type Tercero = DatosTercero & { id: string };

export const ETIQUETA_TIPO_TERCERO: Record<TipoTercero, string> = {
  cliente: "Cliente",
  proveedor: "Proveedor",
  ambos: "Cliente y proveedor",
};

/** Una compra es con un proveedor y una venta con un cliente; "ambos" sirve para las dos. */
export function sirvePara(tercero: Pick<Tercero, "tipo">, operacion: "compra" | "venta"): boolean {
  return (
    tercero.tipo === "ambos" || tercero.tipo === (operacion === "compra" ? "proveedor" : "cliente")
  );
}
