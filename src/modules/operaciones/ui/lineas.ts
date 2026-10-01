import { useState } from "react";

export type LineaFormulario = {
  clave: number;
  materialId: string;
  pesoKg: string;
  unidadPeso: "kg" | "lb" | "otra";
  equivalenciaKg: string;
  precioPorKg: string;
};

export type DatosLinea = Omit<LineaFormulario, "clave">;

const lineaVacia = (clave: number): LineaFormulario => ({
  clave,
  materialId: "",
  pesoKg: "",
  unidadPeso: "kg",
  equivalenciaKg: "1",
  precioPorKg: "",
});

/** Estado de las filas del formulario; `clave` identifica cada fila para React. */
export function useLineas(iniciales: DatosLinea[] = []) {
  const [lineas, setLineas] = useState<LineaFormulario[]>(() =>
    iniciales.length > 0 ? iniciales.map((linea, clave) => ({ ...linea, clave })) : [lineaVacia(0)],
  );

  return {
    lineas,
    agregar: () =>
      setLineas((actuales) => [
        ...actuales,
        lineaVacia(Math.max(...actuales.map((l) => l.clave)) + 1),
      ]),
    quitar: (clave: number) => setLineas((actuales) => actuales.filter((l) => l.clave !== clave)),
    actualizar: (clave: number, cambios: Partial<DatosLinea>) =>
      setLineas((actuales) => actuales.map((l) => (l.clave === clave ? { ...l, ...cambios } : l))),
  };
}
