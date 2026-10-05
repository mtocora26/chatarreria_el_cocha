import "server-only";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoCapital } from "./application/casos-de-uso";
import { crearRepositorioCapital } from "./infrastructure/repositorio-drizzle";

export const capital = crearCasosDeUsoCapital(crearRepositorioCapital(obtenerDb));

export type { ErroresMovimiento, Evolucion, MovimientoCapital } from "./application/casos-de-uso";
export type { CampoMovimiento, EntradaMovimiento } from "./application/validacion";
export type { Saldo } from "./domain/saldo";
