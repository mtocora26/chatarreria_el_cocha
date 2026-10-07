import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { NavegacionInferior, NavegacionPrincipal } from "@/shared/navegacion/navegacion-principal";
import { cerrarSesionAccion } from "./ingresar/acciones";
import { esAdmin, obtenerSesion } from "@/server/auth/sesion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Chatarrería El Cocha",
    template: "%s · Chatarrería El Cocha",
  },
  description: "Sistema de gestión de compras, ventas e inventario de chatarra.",
  applicationName: "Chatarrería El Cocha",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/apple-touch-icon.png" },
  appleWebApp: {
    capable: true,
    title: "El Cocha",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#24342e",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const sesion = await obtenerSesion();

  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <header className="bg-marca-900 sticky top-0 z-30 text-white shadow-sm print:hidden">
          <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-3 px-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Image
                src="/icon.svg"
                alt=""
                width={32}
                height={32}
                unoptimized
                className="rounded-lg"
              />
              <span className="sm:max-md:sr-only">
                El Cocha
                <span className="text-marca-100 hidden font-normal lg:inline"> · Chatarrería</span>
              </span>
            </Link>
            {sesion ? (
              <div className="flex items-center gap-2">
                <NavegacionPrincipal esAdmin={esAdmin(sesion)} />
                <form action={cerrarSesionAccion}>
                  <button
                    type="submit"
                    className="text-marca-100 hover:bg-marca-800 min-h-10 rounded-lg px-3 text-sm font-medium transition hover:text-white"
                  >
                    Salir
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>
        {/* pb-24 en el teléfono: deja espacio para la barra de navegación inferior. */}
        <main
          className={`mx-auto w-full max-w-5xl flex-1 px-4 pt-6 ${sesion ? "pb-24 sm:pb-10" : "pb-10"}`}
        >
          {children}
        </main>
        {sesion && <NavegacionInferior esAdmin={esAdmin(sesion)} />}
      </body>
    </html>
  );
}
