import "server-only";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoTerceros } from "./application/casos-de-uso";
import { crearRepositorioTerceros } from "./infrastructure/repositorio-drizzle";

export const terceros = crearCasosDeUsoTerceros(crearRepositorioTerceros(obtenerDb));

export type { ErrorGuardarTercero } from "./application/casos-de-uso";
export type { CampoTercero, EntradaTercero } from "./application/validacion";
export { ETIQUETA_TIPO_TERCERO, sirvePara, type Tercero, type TipoTercero } from "./domain/tercero";
