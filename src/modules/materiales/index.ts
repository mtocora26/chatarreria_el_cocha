import "server-only";
import { obtenerDb } from "@/server/db";
import { crearCasosDeUsoMateriales } from "./application/casos-de-uso";
import { crearRepositorioMateriales } from "./infrastructure/repositorio-drizzle";

export const materiales = crearCasosDeUsoMateriales(crearRepositorioMateriales(obtenerDb));

export type { ErrorGuardarMaterial } from "./application/casos-de-uso";
export type { CampoMaterial, EntradaMaterial } from "./application/validacion";
export { precioDeCompra, type Material, type Tarifa } from "./domain/material";
