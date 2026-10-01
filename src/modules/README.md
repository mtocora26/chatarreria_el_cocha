# Módulos del negocio

Cada módulo agrupa un dominio del negocio (monolito modular). Se crea cuando un issue lo necesita; no se dejan carpetas vacías.

```
src/modules/<modulo>/
├── domain/          # reglas puras: sin Next.js, React ni Drizzle
├── application/     # casos de uso (registrarCompra, ...)
├── infrastructure/  # acceso a base de datos y dispositivos
├── ui/              # componentes y formularios del módulo
└── index.ts         # fachada: lo único que importa el resto de la app
```

Módulos actuales:

- `materiales` — materiales y precios por kilo.
- `operaciones` — compras y ventas. Se agrupan en un módulo porque comparten tablas, cálculo de líneas y totales, y guardado atómico; separarlas duplicaría esa lógica.

Previstos: `terceros`, `inventario`, `recibos`, `reportes`, `bascula`.

Un módulo usa a otro solo a través de su fachada (`index.ts`) o de tipos de su `domain/`.

Otras carpetas de `src/`:

- `app/` — rutas y páginas de Next.js (App Router). Solo presentación.
- `shared/` — componentes de UI y utilidades usadas por varios módulos.
- `server/` — conexión a base de datos (`server/db`) y, desde I10, autenticación.

Ver `Arquitectura_Sistema_Chatarreria.md`, sección 6 y 9.
