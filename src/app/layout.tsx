import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { NavegacionPrincipal } from "@/shared/navegacion/navegacion-principal";
import { cerrarSesionAccion } from "./ingresar/acciones";
import { obtenerSesion } from "@/server/auth/sesion";
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
    <html
      lang="es"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <header className="border-b border-stone-200 bg-white print:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-lg font-bold text-stone-900">
              Chatarrería El Cocha
            </Link>
            {sesion ? (
              <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                <NavegacionPrincipal />
                <form action={cerrarSesionAccion}>
                  <button
                    type="submit"
                    className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    Salir
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
