import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { operaciones } from "@/modules/operaciones";
import { BotonImprimir } from "@/modules/operaciones/ui/boton-imprimir";
import { numeroRecibo, Recibo } from "@/modules/operaciones/ui/recibo";
import { Aviso } from "@/shared/ui/aviso";
import { DialogoConfirmacion } from "@/shared/ui/dialogo-confirmacion";
import {
  claseBotonPeligroSecundario,
  claseBotonSecundario,
  claseEtiqueta,
  claseInput,
} from "@/shared/ui/estilos";
import { anularOperacionAccion } from "../acciones";
import { esAdmin, exigirSesion } from "@/server/auth/sesion";

const RUTA_LISTADO = { compra: "/compras", venta: "/ventas" } as const;
const NOMBRE = { compra: "Compra", venta: "Venta" } as const;

async function cargar(id: string) {
  const sesion = await exigirSesion();
  const operacion = await operaciones.obtenerDetalle(id);
  if (!operacion) notFound();
  return { operacion, sesion };
}

export async function generateMetadata({ params }: PageProps<"/recibos/[id]">): Promise<Metadata> {
  const { operacion } = await cargar((await params).id);
  return { title: `Recibo ${numeroRecibo(operacion.consecutivo)}` };
}

export default async function PaginaRecibo({ params, searchParams }: PageProps<"/recibos/[id]">) {
  const [{ id }, { nuevo, anulada }] = await Promise.all([params, searchParams]);
  const { operacion, sesion } = await cargar(id);
  const listado = RUTA_LISTADO[operacion.tipo];
  const tipo = operacion.tipo === "compra" ? "compra" : "venta";
  const administrador = esAdmin(sesion);
  const puedeCorregir = administrador && operacion.estado === "activa";
  const volver =
    nuevo === "1"
      ? { href: listado, texto: `Registrar otra ${tipo}` }
      : administrador
        ? { href: "/historial", texto: "Ver historial" }
        : { href: listado, texto: `Volver a ${tipo === "compra" ? "compras" : "ventas"}` };

  return (
    <>
      <div className="mx-auto max-w-2xl print:hidden">
        {nuevo === "1" && (
          <Aviso tipo="exito">
            {NOMBRE[operacion.tipo]} N.º {operacion.consecutivo} registrada.
            {operacion.corrigeA && ` La N.º ${operacion.corrigeA.consecutivo} quedó anulada.`}
          </Aviso>
        )}
        {anulada === "1" && (
          <Aviso tipo="exito">
            {NOMBRE[operacion.tipo]} N.º {operacion.consecutivo} anulada. El inventario ya se
            ajustó.
          </Aviso>
        )}
        <div className="mb-4 flex flex-wrap gap-2">
          <BotonImprimir />
          <Link href={volver.href} className={claseBotonSecundario}>
            {volver.texto}
          </Link>
          {puedeCorregir && (
            <>
              <Link href={`${listado}?corregir=${operacion.id}`} className={claseBotonSecundario}>
                Corregir
              </Link>
              <DialogoConfirmacion
                textoBoton="Anular"
                claseBoton={claseBotonPeligroSecundario}
                titulo={`¿Anular la ${tipo} N.º ${operacion.consecutivo}?`}
                textoConfirmar="Anular"
                peligro
                accion={anularOperacionAccion.bind(null, operacion.id)}
              >
                <p>
                  La operación no se borra: queda marcada como anulada en el historial y deja de
                  contar en el inventario y en los totales.
                </p>
                <div>
                  <label htmlFor="motivo-anulacion" className={claseEtiqueta}>
                    Motivo
                  </label>
                  <input
                    id="motivo-anulacion"
                    name="motivo"
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="Ej.: se registró dos veces"
                    className={claseInput}
                  />
                </div>
              </DialogoConfirmacion>
            </>
          )}
        </div>
        {!administrador && operacion.estado === "activa" && (
          <p className="mb-4 text-sm text-stone-600">
            ¿Hay un error en esta {tipo}? Avisa al administrador con el N.º {operacion.consecutivo}:
            solo él puede corregirla o anularla.
          </p>
        )}
        {operacion.estado === "anulada" && operacion.corregidaPor && (
          <p className="mb-4 text-sm">
            <Link href={`/recibos/${operacion.corregidaPor.id}`} className="font-medium underline">
              Ver la operación que la reemplaza (N.º {operacion.corregidaPor.consecutivo})
            </Link>
          </p>
        )}
      </div>
      <Recibo operacion={operacion} />
    </>
  );
}
