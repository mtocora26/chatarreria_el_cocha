# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Administradores** (el propietario, Jesús Alberto Pacheco, y un encargado de confianza; 1–2 personas): trabajan en computador conectado a la báscula digital (Chrome/Edge). Registran compras y ventas, fijan precios, revisan inventario, historial, gastos, capital y rentabilidad, y exportan datos.
- **Trabajadores** (cuentas creadas por el administrador): acceso limitado, a menudo desde celular o mostrador. Registran operaciones y consultan; no ven Inventario, Historial ni Usuarios.
- Usuarios poco técnicos que hoy llevan todo en cuadernos y cálculos a mano.

## Product Purpose

Reemplazar el control manual de una chatarrería (Chatarrería El Cocha) por una herramienta simple para registrar compras (entrada) y ventas (salida) de chatarra, controlar el inventario por material en kilos, imprimir recibos internos y saber cuánto se ganó. Éxito: el negocio registra rápido, no pierde datos y confía en sus números.

## Positioning

Hecha a la medida de un solo negocio de chatarra: tarifas minorista/mayorista por kilo, lectura de peso desde la báscula, recibo interno tipo POS, y capital/rentabilidad con costo promedio, sin la complejidad de un ERP.

## Operating Context

- Patio/mostrador de chatarrería: pesaje con báscula digital (serial/USB), pago en el momento, recibo impreso en hoja normal o tirilla térmica.
- Acceso por usuario y contraseña; sin registro público.
- PWA instalable; consultar y guardar requiere conexión (sin modo offline).
- Despliegue de piloto en Netlify con PostgreSQL (Neon); respaldos diarios.

## Capabilities and Constraints

- Módulos: materiales y tarifas, terceros (clientes/proveedores), compras, ventas, inventario, historial y resumen diario, recibos, gastos con categorías, capital, rentabilidad, usuarios, exportación CSV para Excel.
- Stack existente: Next.js (App Router), TypeScript, Tailwind CSS, Drizzle, Zod, Better Auth.
- El recibo es comprobante interno: no es factura electrónica ni documento POS validado por la DIAN.
- Fuera de alcance de esta versión: app en tiendas (Capacitor), sincronización/registro sin conexión.
- Interfaz en español colombiano, vocabulario de chatarrería (kilos, tarifa, compra/venta).

## Brand Commitments

- Nombre: Chatarrería El Cocha. No hay identidad visual formal confirmada más allá de lo ya implementado (ícono en `src/app/icon.svg`).

## Evidence on Hand

- Documentos: `Propuesta_Sistema_Chatarreria.md`, `Arquitectura_Sistema_Chatarreria.md`, `Issues_GitHub_Sistema_Chatarreria.md`, `docs/aceptacion-piloto.md`, `docs/demo.md`.
- No hay testimonios, clientes de referencia ni métricas; no inventarlos.

## Product Principles

1. Rapidez de registro: pocos pasos por compra o venta, con cálculo automático.
2. Los números deben ser confiables y explicables (inventario, saldo, rentabilidad).
3. Lenguaje simple y directo; cero jerga técnica.
4. Funciona igual de bien en celular y en computador con báscula.
5. Seguridad por defecto: acceso controlado, roles claros, sin datos ficticios en producción.

## Accessibility & Inclusion

Sin requisitos especiales confirmados; usuarios poco técnicos, por lo que claridad y legibilidad son la base.
