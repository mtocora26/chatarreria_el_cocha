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
cp .env.example .env.local   # completar DATABASE_URL y BETTER_AUTH_SECRET
npm run db:local             # opcional, en otra terminal: PostgreSQL local sin Docker
npm run db:migrate           # crea las tablas en la base configurada
npm run db:verificar         # comprueba escritura y lectura (no deja datos)
npm run auth:crear-admin -- --email correo-del-administrador --name "Nombre del administrador"
npm run dev
```

La aplicación queda disponible en <http://localhost:3000>.

Genera un secreto diferente para cada entorno con `openssl rand -base64 32` y guárdalo en `BETTER_AUTH_SECRET` dentro de `.env.local` o en las variables protegidas del hosting. No lo compartas ni lo subas a Git. `BETTER_AUTH_URL` debe coincidir exactamente con la URL del entorno.

El acceso se realiza con **usuario** y contraseña (también se acepta el correo); el registro público está deshabilitado. Después de aplicar las migraciones, crea el primer administrador desde la terminal:

```bash
npm run auth:crear-admin -- --email correo-del-administrador --name "Nombre del administrador"
```

El CLI pedirá la contraseña de forma interactiva. Para agregar un segundo administrador se repite el mismo comando con el correo autorizado. No uses contraseñas reales en argumentos, documentos o Git.

El usuario con el que se inicia sesión es un nombre de 3 a 30 caracteres (letras, números, punto o guion bajo; no distingue mayúsculas). Se define al crear la cuenta con `--data` y el correo queda como dato interno, que puede ser ficticio para un trabajador:

```bash
npm run auth:crear-trabajador -- --email juan@elcocha.local --name "Juan Pérez" --data '{"username":"juan"}'
```

A una cuenta que ya existe se le asigna con `npm run auth:asignar-usuario -- --email correo --usuario nombre`.

La aplicación incluye una PWA instalable desde navegadores compatibles. Consultar y guardar operaciones requiere conexión a internet; no se habilita registro ni sincronización sin conexión. La app Capacitor y su publicación en tiendas no forman parte de esta versión.

## Comandos

| Comando                         | Qué hace                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`                   | Servidor de desarrollo con recarga en caliente                                        |
| `npm run build`                 | Compilación de producción                                                             |
| `npm run start`                 | Sirve la compilación de producción                                                    |
| `npm run lint`                  | ESLint                                                                                |
| `npm run typecheck`             | Genera los tipos de rutas de Next.js y ejecuta `tsc`                                  |
| `npm run format`                | Formatea el código con Prettier                                                       |
| `npm run format:check`          | Verifica el formato sin modificar archivos                                            |
| `npm run check`                 | Lint + tipos + formato (lo que debe pasar antes de un PR)                             |
| `npm run db:generate`           | Genera una migración SQL a partir de cambios en el esquema                            |
| `npm run db:migrate`            | Aplica las migraciones pendientes                                                     |
| `npm run db:verificar`          | Prueba escribir y leer en la base (transacción revertida)                             |
| `npm run db:local`              | Inicia PostgreSQL local en el puerto 5433 (datos en `.postgres-local/`)               |
| `npm run db:demo`               | Carga datos ficticios de demostración en una base vacía                               |
| `npm run db:studio`             | Explorador visual de la base (Drizzle Studio)                                         |
| `npm run auth:crear-admin`      | Crea un administrador inicial por CLI; no habilita registro público                   |
| `npm run auth:asignar-usuario`  | Asigna el usuario de inicio de sesión a una cuenta existente (`--email`, `--usuario`) |
| `npm run auth:crear-trabajador` | Crea un trabajador (solo compras, ventas y crear materiales) por CLI                  |

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

| Variable             | Uso                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Cadena de conexión de PostgreSQL                                                    |
| `BETTER_AUTH_URL`    | URL exacta del entorno (`http://localhost:3000` en local; HTTPS en hosting)         |
| `BETTER_AUTH_SECRET` | Secreto aleatorio generado con `openssl rand -base64 32`; no compartir ni versionar |
