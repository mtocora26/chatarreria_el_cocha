const VIOLACION_UNICA = "23505";
// 23503 con NO ACTION; 23001 con ON DELETE RESTRICT, que es lo que usa el esquema.
const VIOLACIONES_LLAVE_FORANEA = new Set(["23503", "23001"]);

/** Drizzle envuelve el error de pg en `cause`; se revisan ambos niveles. */
export function esViolacionUnica(error: unknown): boolean {
  return codigoPostgres(error) === VIOLACION_UNICA;
}

/** Se intentó borrar una fila que otra tabla todavía referencia. */
export function esViolacionLlaveForanea(error: unknown): boolean {
  return VIOLACIONES_LLAVE_FORANEA.has(codigoPostgres(error) ?? "");
}

function codigoPostgres(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  return "cause" in error ? codigoPostgres(error.cause) : undefined;
}
