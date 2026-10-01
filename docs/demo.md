# Demostración del prototipo (M0)

Guion para presentar el prototipo al cliente el 30 de septiembre de 2026. Duración estimada: 10–15 minutos.

> **Datos ficticios.** Todos los materiales, precios y operaciones de la demo son inventados. No se usa información real del cliente.
>
> **Solo local.** El prototipo no tiene inicio de sesión todavía (llega en M1). No se publica en internet.

## 1. Preparación (una sola vez, ~5 minutos)

Requisitos: Node.js 22 o superior.

```bash
npm install
cp .env.example .env.local
```

En `.env.local` deja la conexión local:

```
DATABASE_URL=postgresql://postgres:local@127.0.0.1:5433/postgres
```

En una terminal aparte, inicia PostgreSQL local y déjala abierta:

```bash
npm run db:local
```

En otra terminal, crea las tablas y carga los datos de demostración:

```bash
npm run db:migrate
npm run db:demo
```

`db:demo` solo funciona sobre una base sin materiales. Para empezar de cero: detén `db:local` (Ctrl+C), borra la carpeta `.postgres-local/` y repite los pasos.

> El mismo esquema y las mismas migraciones se usarán con Neon en M1: la base local no es una versión desechable.

## 2. Arrancar

```bash
npm run build
npm run start
```

Abre <http://localhost:3000>. (`npm run dev` también sirve, pero la primera carga de cada página es más lenta.)

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
8. **Celular.** Repetir una compra corta desde el teléfono (ver sección 4) o con el modo dispositivo del navegador (F12 → icono de celular).
9. **Cierre.** Explicar qué llega después: inicio de sesión, despliegue, historial, anulaciones, Excel, tirilla térmica y báscula. La facturación electrónica DIAN está fuera de este alcance.

## 4. Mostrar en el celular (opcional)

Con el computador y el celular en la **misma red Wi‑Fi de confianza**:

```bash
npm run start -- -H 0.0.0.0
```

En el celular abre `http://IP-DEL-COMPUTADOR:3000`. En Linux, la IP se ve con `hostname -I`.

> Mientras esté así, cualquiera en esa red puede usar el prototipo, porque todavía no hay inicio de sesión. Hazlo solo en una red privada y con datos ficticios, y detén el servidor al terminar.

## 5. Verificación previa

Antes de la reunión, recorre el guion completo una vez:

- [ ] `npm run check` y `npm run build` sin errores.
- [ ] Guion completo en escritorio.
- [ ] Guion completo en celular o en el modo dispositivo del navegador.
- [ ] Vista previa de impresión del recibo.

## 6. Comentarios del cliente

Anotar durante la demo. Lo que cambie el alcance se convierte en un issue nuevo, con su estimación, antes de comprometerlo.

| #   | Comentario | ¿Cambia el alcance? | Issue |
| --- | ---------- | ------------------- | ----- |
| 1   |            |                     |       |
| 2   |            |                     |       |
| 3   |            |                     |       |
