// Resultado de un caso de uso: los errores esperados no se lanzan como excepciones.
export type Resultado<T, E = string> = { ok: true; valor: T } | { ok: false; error: E };

export const exito = <T>(valor: T): Resultado<T, never> => ({ ok: true, valor });
export const fallo = <E>(error: E): Resultado<never, E> => ({ ok: false, error });
