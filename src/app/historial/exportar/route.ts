import type { NextRequest } from "next/server";
import { operaciones } from "@/modules/operaciones";
import { csvOperaciones } from "@/modules/operaciones/application/exportacion";
import { respuestaCsv } from "@/shared/dominio/csv";
import { diaNegocio } from "@/shared/dominio/fecha";
import { exigirAdmin } from "@/server/auth/sesion";

const texto = (valor: string | null) => valor ?? undefined;

// Mismos filtros que la pantalla del historial, sin paginar.
export async function GET(request: NextRequest) {
  if (!(await exigirAdmin())) return new Response("No autorizado", { status: 403 });

  const parametros = request.nextUrl.searchParams;
  const lineas = await operaciones.exportarOperaciones({
    desde: texto(parametros.get("desde")),
    hasta: texto(parametros.get("hasta")),
    tipo: texto(parametros.get("tipo")),
    materialId: texto(parametros.get("materialId")),
  });
  return respuestaCsv(`historial-${diaNegocio(new Date())}.csv`, csvOperaciones(lineas));
}
