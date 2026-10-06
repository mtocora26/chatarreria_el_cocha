import type { Metadata } from "next";
import { connection } from "next/server";
import { operaciones } from "@/modules/operaciones";
import { TablaInventario } from "@/modules/operaciones/ui/tabla-inventario";
import { claseBotonSecundario } from "@/shared/ui/estilos";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { medirTiempo } from "@/server/medir-tiempo";

export const metadata: Metadata = { title: "Inventario" };

export default async function PaginaInventario() {
  await medirTiempo("inventario", "sesion", exigirAdminPagina);
  await connection();
  const existencias = await medirTiempo("inventario", "datos_total", () =>
    operaciones.consultarInventario(),
  );

  return (
    <>
      <EncabezadoPagina
        titulo="Inventario"
        descripcion="Kilos disponibles de cada material: compras menos ventas registradas."
      />
      <p className="mb-3 flex justify-end">
        <a href="/inventario/exportar" download className={claseBotonSecundario}>
          Descargar para Excel
        </a>
      </p>
      <TablaInventario existencias={existencias} />
    </>
  );
}
