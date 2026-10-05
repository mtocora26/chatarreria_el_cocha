import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import { DialogoConfirmacion } from "@/shared/ui/dialogo-confirmacion";
import { EncabezadoPagina } from "@/shared/ui/encabezado-pagina";
import {
  claseBotonPeligroSecundario,
  claseBotonSecundario,
  claseInput,
  claseInsignia,
  claseTarjeta,
} from "@/shared/ui/estilos";
import { auth } from "@/server/auth";
import { exigirAdminPagina } from "@/server/auth/sesion";
import { cambiarEstadoUsuarioAccion, restablecerPasswordAccion } from "./acciones";
import { FormularioTrabajador } from "./formulario-trabajador";

export const metadata: Metadata = { title: "Usuarios" };

export default async function PaginaUsuarios() {
  const sesion = await exigirAdminPagina();
  await connection();
  const { users } = await auth.api.listUsers({
    query: { limit: 200, sortBy: "createdAt", sortDirection: "asc" },
    headers: await headers(),
  });

  return (
    <>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Crea trabajadores, desactiva su acceso o restablece su contraseña."
      />

      <section aria-labelledby="nuevo-trabajador" className={`${claseTarjeta} mb-8 p-4 sm:p-5`}>
        <h2 id="nuevo-trabajador" className="mb-4 text-lg font-semibold text-stone-900">
          Nuevo trabajador
        </h2>
        <FormularioTrabajador />
      </section>

      <section aria-labelledby="lista-usuarios">
        <h2 id="lista-usuarios" className="mb-3 text-lg font-semibold text-stone-900">
          Cuentas
        </h2>
        <ul className="grid gap-3">
          {users.map((usuario) => {
            const esAdministrador = usuario.role === "admin";
            const esPropia = usuario.id === sesion.user.id;
            const desactivado = usuario.banned === true;
            const gestionable = !esAdministrador && !esPropia;
            return (
              <li
                key={usuario.id}
                className={`${claseTarjeta} flex flex-wrap items-center justify-between gap-3 p-4`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900">
                    {usuario.name}
                    {esPropia && <span className="font-normal text-stone-500"> (tú)</span>}
                  </p>
                  <p className="truncate text-sm text-stone-500">
                    {(usuario as { username?: string | null }).username ?? usuario.email}
                  </p>
                  <p className="mt-1 flex gap-2">
                    <span
                      className={`${claseInsignia} ${esAdministrador ? "bg-oro-100 text-marca-900" : "bg-stone-100 text-stone-700"}`}
                    >
                      {esAdministrador ? "Administrador" : "Trabajador"}
                    </span>
                    {desactivado && (
                      <span className={`${claseInsignia} bg-red-100 text-red-800`}>
                        Desactivado
                      </span>
                    )}
                  </p>
                </div>
                {gestionable && (
                  <div className="flex flex-wrap gap-2">
                    <DialogoConfirmacion
                      textoBoton="Nueva contraseña"
                      claseBoton={claseBotonSecundario}
                      titulo={`Nueva contraseña de ${usuario.name}`}
                      textoConfirmar="Guardar contraseña"
                      accion={restablecerPasswordAccion.bind(null, usuario.id)}
                    >
                      <p>Se cerrarán sus sesiones abiertas. Entrégale la nueva contraseña.</p>
                      <label className="block">
                        <span className="mb-1 block font-medium">Contraseña</span>
                        <input
                          name="password"
                          type="text"
                          required
                          minLength={8}
                          autoComplete="off"
                          className={claseInput}
                        />
                      </label>
                    </DialogoConfirmacion>
                    <DialogoConfirmacion
                      textoBoton={desactivado ? "Reactivar" : "Desactivar"}
                      claseBoton={desactivado ? claseBotonSecundario : claseBotonPeligroSecundario}
                      titulo={`${desactivado ? "Reactivar" : "Desactivar"} a ${usuario.name}`}
                      textoConfirmar={desactivado ? "Reactivar" : "Desactivar"}
                      peligro={!desactivado}
                      accion={cambiarEstadoUsuarioAccion.bind(null, usuario.id, !desactivado)}
                    >
                      <p>
                        {desactivado
                          ? "Podrá volver a iniciar sesión."
                          : "No podrá iniciar sesión y se cerrarán sus sesiones abiertas."}
                      </p>
                    </DialogoConfirmacion>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
