# Sistema de Gestión — Chatarrería El Cocha

Aplicación web para registrar compras y ventas de chatarra, controlar el inventario por material e imprimir recibos internos.

- Propuesta: [Propuesta_Sistema_Chatarreria.md](Propuesta_Sistema_Chatarreria.md)
- Arquitectura y convenciones: [Arquitectura_Sistema_Chatarreria.md](Arquitectura_Sistema_Chatarreria.md)
- Plan de trabajo: [Issues_GitHub_Sistema_Chatarreria.md](Issues_GitHub_Sistema_Chatarreria.md)

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · ESLint · Prettier

## Requisitos

- Node.js 20.9 o superior (probado con Node 22)
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación queda disponible en <http://localhost:3000>.

## Comandos

| Comando                | Qué hace                                                  |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con recarga en caliente            |
| `npm run build`        | Compilación de producción                                 |
| `npm run start`        | Sirve la compilación de producción                        |
| `npm run lint`         | ESLint                                                    |
| `npm run typecheck`    | Genera los tipos de rutas de Next.js y ejecuta `tsc`      |
| `npm run format`       | Formatea el código con Prettier                           |
| `npm run format:check` | Verifica el formato sin modificar archivos                |
| `npm run check`        | Lint + tipos + formato (lo que debe pasar antes de un PR) |

## Estructura

```
src/
├── app/        # rutas y páginas (solo presentación)
├── modules/    # módulos del negocio (ver src/modules/README.md)
└── shared/     # componentes y utilidades compartidas
```

## Variables de entorno

Las credenciales van en `.env.local`, que no se versiona. A partir de I02 se incluirá un `.env.example` con los nombres de las variables sin valores.
