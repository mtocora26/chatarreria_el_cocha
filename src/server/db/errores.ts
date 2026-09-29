const VIOLACION_UNICA = "23505";

/** Drizzle envuelve el error de pg en `cause`; se revisan ambos niveles. */
export function esViolacionUnica(error: unknown): boolean {
  return codigoPostgres(error) === VIOLACION_UNICA;
}

function codigoPostgres(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  return "cause" in error ? codigoPostgres(error.cause) : undefined;
}
