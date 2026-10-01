import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Sistema de Gestión · Chatarrería El Cocha",
    short_name: "El Cocha",
    description: "Compras, ventas e inventario de la chatarrería.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f4ef",
    theme_color: "#24342e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
