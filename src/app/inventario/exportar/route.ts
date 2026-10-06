import { operaciones } from "@/modules/operaciones";
import { csvInventario } from "@/modules/operaciones/application/exportacion";
import { respuestaCsv } from "@/shared/dominio/csv";
import { diaNegocio } from "@/shared/dominio/fecha";
import { exigirAdmin } from "@/server/auth/sesion";

export async function GET() {
  if (!(await exigirAdmin())) return new Response("No autorizado", { status: 403 });

  const existencias = await operaciones.consultarInventario();
  return respuestaCsv(`inventario-${diaNegocio(new Date())}.csv`, csvInventario(existencias));
}
