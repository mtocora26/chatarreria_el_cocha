import "server-only";

export async function medirTiempo<T>(
  ruta: string,
  etapa: string,
  operacion: () => Promise<T>,
): Promise<T> {
  const inicio = performance.now();
  try {
    return await operacion();
  } finally {
    console.info(
      JSON.stringify({
        evento: "tiempo_servidor",
        ruta,
        etapa,
        milisegundos: Math.round(performance.now() - inicio),
      }),
    );
  }
}
