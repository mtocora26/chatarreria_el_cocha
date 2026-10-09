// CSV pensado para Excel en español: separador ";" y BOM UTF-8 para que abra bien las tildes.
const SEPARADOR = ";";
const FIN_DE_LINEA = "\r\n";
const BOM = "﻿";

export type CeldaCsv = string | number | null;

// Excel ejecuta como fórmula lo que empieza con estos caracteres; el apóstrofo lo evita.
const INICIO_DE_FORMULA = /^[=+\-@\t\r]/;

function escaparTexto(texto: string): string {
  const seguro = INICIO_DE_FORMULA.test(texto) ? `'${texto}` : texto;
  return /[";\r\n]/.test(seguro) ? `"${seguro.replaceAll('"', '""')}"` : seguro;
}

function celda(valor: CeldaCsv): string {
  if (valor === null) return "";
  // Los números se escriben con coma decimal, como los interpreta Excel en español.
  if (typeof valor === "number") return String(valor).replace(".", ",");
  return escaparTexto(valor);
}

export function generarCsv(encabezados: string[], filas: CeldaCsv[][]): string {
  const lineas = [encabezados, ...filas].map((fila) => fila.map(celda).join(SEPARADOR));
  return BOM + lineas.join(FIN_DE_LINEA) + FIN_DE_LINEA;
}

export function respuestaCsv(nombreArchivo: string, contenido: string): Response {
  return new Response(contenido, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
