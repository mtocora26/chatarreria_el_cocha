import "server-only";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoGastos } from "./application/casos-de-uso";
import { crearRepositorioGastos } from "./infrastructure/repositorio-drizzle";

export const gastos = crearCasosDeUsoGastos(crearRepositorioGastos(obtenerDb));

export type { ErroresGasto } from "./application/casos-de-uso";
export type { CampoGasto, EntradaGasto } from "./application/validacion";
export type { CategoriaGasto, Gasto, ResumenGastos } from "./domain/gasto";
