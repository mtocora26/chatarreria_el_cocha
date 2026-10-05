import "server-only";
import { gastos } from "@/modules/gastos";
import { materiales } from "@/modules/materiales";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoRentabilidad } from "./application/casos-de-uso";
import { crearRepositorioRentabilidad } from "./infrastructure/repositorio-drizzle";

export const rentabilidad = crearCasosDeUsoRentabilidad(
  crearRepositorioRentabilidad(obtenerDb),
  materiales,
  gastos,
);

export type { ReporteRentabilidad } from "./application/casos-de-uso";
