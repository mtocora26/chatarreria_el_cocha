# Prueba local del prototipo (previa al Entregable 1)

Esta guía solo sirve para comprobar el prototipo en desarrollo. No es la entrega al cliente ni autoriza registrar datos reales. El Entregable 1 es un piloto publicado por HTTPS, con inicio de sesión, base persistente y recuperación probada; sus criterios están en [Issues_GitHub_Sistema_Chatarreria.md](../Issues_GitHub_Sistema_Chatarreria.md).

> **Datos ficticios.** Todos los materiales, precios y operaciones de la demo son inventados. No se usa información real del cliente.
>
> **Solo local.** Se usa una cuenta administrativa local de prueba. No se publica en internet ni se usa con información real.

## 1. Preparación (una sola vez, ~5 minutos)

Requisitos: Node.js 22 o superior.

```bash
npm install
cp .env.example .env.local
```

En `.env.local` configura conexión, URL local y un secreto de desarrollo generado con `openssl rand -base64 32`:

```
DATABASE_URL=postgresql://postgres:local@127.0.0.1:5433/postgres
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<secreto-local-generado>
```

En una terminal aparte, inicia PostgreSQL local y déjala abierta:

```bash
npm run db:local
```

En otra terminal, crea las tablas y carga los datos de demostración:

```bash
npm run db:migrate
npm run db:demo
npm run auth:crear-admin -- --email demo@chatarreria.local --name "Administrador de prueba"
```

El comando pide la contraseña en la terminal. No reutilices esa cuenta o contraseña en un entorno publicado.

`db:demo` solo funciona sobre una base sin materiales. Para empezar de cero: detén `db:local` (Ctrl+C), borra la carpeta `.postgres-local/` y repite los pasos.

> El mismo esquema y las mismas migraciones se usarán en el entorno del piloto. La base local es solo para desarrollo y no contiene datos del cliente.

## 2. Arrancar

```bash
npm run build
npm run start
```

Abre <http://localhost:3000>, inicia sesión con la cuenta local creada y recorre la demo. (`npm run dev` también sirve, pero la primera carga de cada página es más lenta.)

### Estado inicial esperado (datos de demo)

| Material         | Stock      |
| ---------------- | ---------- |
| Aluminio         | 2,500 kg   |
| Baterías         | 35,000 kg  |
| Bronce           | 6,800 kg   |
| Chatarra ferrosa | 180,000 kg |
| Cobre            | 3,250 kg   |

## 3. Guion

1. **Inicio.** Mostrar las cuatro secciones y la navegación.
2. **Materiales.**
   - Mostrar la tabla de precios en COP (compra minorista, compra mayorista, venta).
   - Crear **Plomo**: minorista 3000, mayorista 3200, venta 3800.
   - Intentar crear "plomo" otra vez: aparece _"Ya existe un material con ese nombre."_
   - Editar un precio y mostrar la confirmación.
3. **Compra.**
   - Tarifa minorista.
   - Líneas: Plomo 20 kg y Cobre 1,5 kg. Mostrar el total en vivo ($ 105.000).
   - Cambiar a mayorista: el total se recalcula con los precios mayoristas.
   - **Registrar compra**: se abre el recibo.
4. **Recibo.** Mostrar número interno, fecha, líneas, total y la aclaración DIAN. Pulsar **Imprimir** y enseñar la vista previa: sin menú ni botones.
5. **Inventario.** Plomo aparece con 20,000 kg y Cobre con 4,750 kg.
6. **Venta.**
   - Plomo 25 kg: aparece _"Supera el stock"_ y el servidor la rechaza.
   - Cambiar a 15 kg, ajustar el precio a 3900 y registrar. Se abre el recibo de venta.
7. **Inventario.** Plomo queda en 5,000 kg.
8. **Celular.** Revisar el diseño con el modo dispositivo del navegador (F12 → icono de celular); no exponer el servidor local a redes públicas.
9. **Cierre.** Esta prueba sigue siendo local y no equivale al piloto desplegado. Excel, terceros, tirilla térmica y báscula pueden llegar después. La facturación electrónica DIAN está fuera de este alcance.

## 4. Verificación previa

Antes de la reunión, recorre el guion completo una vez:

- [ ] `npm run check` y `npm run build` sin errores.
- [ ] Guion completo en escritorio.
- [ ] Guion completo en celular o en el modo dispositivo del navegador.
- [ ] Vista previa de impresión del recibo.

## 5. Comentarios del cliente

Anotar durante la demo. Lo que cambie el alcance se convierte en un issue nuevo, con su estimación, antes de comprometerlo.

| #   | Comentario | ¿Cambia el alcance? | Issue |
| --- | ---------- | ------------------- | ----- |
| 1   |            |                     |       |
| 2   |            |                     |       |
| 3   |            |                     |       |
