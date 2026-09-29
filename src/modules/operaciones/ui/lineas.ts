import { useState } from "react";

export type LineaFormulario = { clave: number; materialId: string; pesoKg: string };

/** Estado de las filas del formulario; `clave` identifica cada fila para React. */
export function useLineas() {
  const [lineas, setLineas] = useState<LineaFormulario[]>([
    { clave: 0, materialId: "", pesoKg: "" },
  ]);

  return {
    lineas,
    agregar: () =>
      setLineas((actuales) => [
        ...actuales,
        { clave: Math.max(...actuales.map((l) => l.clave)) + 1, materialId: "", pesoKg: "" },
      ]),
    quitar: (clave: number) => setLineas((actuales) => actuales.filter((l) => l.clave !== clave)),
    actualizar: (clave: number, cambios: Partial<Omit<LineaFormulario, "clave">>) =>
      setLineas((actuales) => actuales.map((l) => (l.clave === clave ? { ...l, ...cambios } : l))),
  };
}
