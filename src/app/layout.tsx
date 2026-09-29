import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { NavegacionPrincipal } from "@/shared/navegacion/navegacion-principal";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="border-b border-stone-200 bg-white print:hidden">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-lg font-bold text-stone-900">
              Chatarrería El Cocha
            </Link>
            <NavegacionPrincipal />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
