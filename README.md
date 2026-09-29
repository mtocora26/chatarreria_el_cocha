# Sistema de Gestión — Chatarrería El Cocha

Aplicación web para registrar compras y ventas de chatarra, controlar el inventario por material e imprimir recibos internos.

- Propuesta: [Propuesta_Sistema_Chatarreria.md](Propuesta_Sistema_Chatarreria.md)
- Arquitectura y convenciones: [Arquitectura_Sistema_Chatarreria.md](Arquitectura_Sistema_Chatarreria.md)
- Plan de trabajo: [Issues_GitHub_Sistema_Chatarreria.md](Issues_GitHub_Sistema_Chatarreria.md)
- Guion de la demo del prototipo: [docs/demo.md](docs/demo.md)

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · PostgreSQL (Neon) · Drizzle ORM · Zod · Vitest · ESLint · Prettier

## Requisitos

- Node.js 22 o superior
- npm

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar DATABASE_URL
npm run db:local             # opcional, en otra terminal: PostgreSQL local sin Docker
npm run db:migrate           # crea las tablas en la base configurada
npm run db:verificar         # comprueba escritura y lectura (no deja datos)
npm run dev
```

La aplicación queda disponible en <http://localhost:3000>.

## Comandos

| Comando                | Qué hace                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con recarga en caliente                          |
| `npm run build`        | Compilación de producción                                               |
| `npm run start`        | Sirve la compilación de producción                                      |
| `npm run lint`         | ESLint                                                                  |
| `npm run typecheck`    | Genera los tipos de rutas de Next.js y ejecuta `tsc`                    |
| `npm run format`       | Formatea el código con Prettier                                         |
| `npm run format:check` | Verifica el formato sin modificar archivos                              |
| `npm run check`        | Lint + tipos + formato (lo que debe pasar antes de un PR)               |
| `npm run db:generate`  | Genera una migración SQL a partir de cambios en el esquema              |
| `npm run db:migrate`   | Aplica las migraciones pendientes                                       |
| `npm run db:verificar` | Prueba escribir y leer en la base (transacción revertida)               |
| `npm run db:local`     | Inicia PostgreSQL local en el puerto 5433 (datos en `.postgres-local/`) |
| `npm run db:demo`      | Carga datos ficticios de demostración en una base vacía                 |
| `npm run db:studio`    | Explorador visual de la base (Drizzle Studio)                           |

## Estructura

```
drizzle/        # migraciones SQL generadas (versionadas, no editar a mano)
src/
├── app/        # rutas y páginas (solo presentación)
├── modules/    # módulos del negocio (ver src/modules/README.md)
├── server/db/  # esquema Drizzle y conexión (solo servidor)
└── shared/     # componentes y utilidades compartidas
```

## Base de datos

- PostgreSQL en Neon. Para desarrollo usa la rama `dev` de Neon, nunca la de producción, o `npm run db:local` (PostgreSQL real con binarios oficiales, sin Docker ni instalación).
- El esquema está en [src/server/db/schema.ts](src/server/db/schema.ts). Tras modificarlo: `npm run db:generate`, revisar el SQL generado en `drizzle/` y `npm run db:migrate`.
- Dinero en `numeric(14,2)` y peso en `numeric(10,3)`; Drizzle los devuelve como texto para no perder precisión.
- Las transacciones no se borran: se anulan (I13). Los materiales con movimientos no se pueden eliminar, solo desactivar.

## Variables de entorno

Las credenciales van en `.env.local`, que no se versiona. [.env.example](.env.example) lista las variables necesarias, sin valores.

| Variable       | Uso                              |
| -------------- | -------------------------------- |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
