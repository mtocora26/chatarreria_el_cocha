import type { Metadata } from "next";
import { connection } from "next/server";
import { gastos } from "@/modules/gastos";
import { FormularioGasto } from "@/modules/gastos/ui/formulario-gasto";
import { diaNegocio } from "@/shared/dominio/fecha";
import { Aviso } from "@/shared/ui/aviso";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { registrarGastoAccion } from "../acciones";

export const metadata: Metadata = { title: "Nuevo gasto" };

export default async function PaginaNuevoGasto() {
  await exigirAdminPagina();
  await connection();
  const categorias = await gastos.listarCategoriasActivas();

  return (
    <>
      <EncabezadoPagina
        titulo="Nuevo gasto"
        descripcion="Dinero que sale del negocio y no es una compra de material."
      />
      {categorias.length === 0 ? (
        <Aviso tipo="error">No hay categorías activas. Crea una en Categorías de gasto.</Aviso>
      ) : (
        <FormularioGasto
          accion={registrarGastoAccion}
          categorias={categorias}
          hoy={diaNegocio(new Date())}
        />
      )}
    </>
  );
}
