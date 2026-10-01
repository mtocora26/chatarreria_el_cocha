import type { Metadata } from "next";
import { FormularioIngreso } from "./formulario-ingreso";

export const metadata: Metadata = { title: "Ingresar" };

export default async function PaginaIngreso({ searchParams }: PageProps<"/ingresar">) {
  const { continuar } = await searchParams;
  const destino = typeof continuar === "string" ? continuar : "/";

  return (
    <section className="mx-auto grid min-h-[70svh] w-full max-w-md content-center gap-8 py-10">
      <header className="grid gap-2">
        <p className="text-sm font-semibold text-amber-800 uppercase">El Cocha</p>
        <h1 className="text-3xl font-bold text-stone-950">Ingresar al sistema</h1>
        <p className="text-stone-600">
          Accede para registrar y consultar la operación del negocio.
        </p>
      </header>
      <FormularioIngreso destino={destino} />
    </section>
  );
}
