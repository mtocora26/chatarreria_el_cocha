import "server-only";
import { materiales } from "@/modules/materiales";
import { terceros } from "@/modules/terceros";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoOperaciones } from "./application/casos-de-uso";
import { crearRepositorioOperaciones } from "./infrastructure/repositorio-drizzle";

export const operaciones = crearCasosDeUsoOperaciones(
  crearRepositorioOperaciones(obtenerDb),
  materiales,
  terceros,
);

export type {
  DetalleOperacion,
  EntradaHistorial,
  ExistenciaMaterial,
  Historial,
  LineaExportable,
  ResumenOperacion,
  ResumenPeriodo,
} from "./application/casos-de-uso";
export { ERROR_GENERAL } from "./application/casos-de-uso";
export type { EntradaCompra, EntradaVenta, ErroresOperacion } from "./application/validacion";
export type { TipoOperacion } from "./domain/operacion";
