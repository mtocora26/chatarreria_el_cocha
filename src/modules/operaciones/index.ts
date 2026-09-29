import "server-only";
import { materiales } from "@/modules/materiales";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoOperaciones } from "./application/casos-de-uso";
import { crearRepositorioOperaciones } from "./infrastructure/repositorio-drizzle";

export const operaciones = crearCasosDeUsoOperaciones(
  crearRepositorioOperaciones(obtenerDb),
  materiales,
);

export type {
  DetalleOperacion,
  ExistenciaMaterial,
  ResumenOperacion,
} from "./application/casos-de-uso";
export type { EntradaCompra, EntradaVenta, ErroresOperacion } from "./application/validacion";
export type { TipoOperacion } from "./domain/operacion";
