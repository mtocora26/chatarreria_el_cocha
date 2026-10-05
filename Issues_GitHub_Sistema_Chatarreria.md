# Issues para GitHub Projects — Sistema de Gestión para Chatarrería

**Fecha de planeación:** 28 de septiembre de 2026  
**Inicio asumido:** 28 de septiembre de 2026  
**Entregable 1 — piloto operativo:** objetivo 30 de septiembre de 2026  
**Entrega completa objetivo:** 19 de octubre de 2026  
**Responsable sugerido:** Manuel David Castro

El objetivo de M0 cambia: no se considera entregado por funcionar solo en el computador del desarrollador. M0 debe quedar publicado con acceso privado para que una chatarrería pueda empezar a registrar operaciones desde computador y teléfono, usando el navegador y sin instalar una aplicación móvil. El piloto atiende únicamente a esta chatarrería en una instancia independiente; no es un servicio multiempresa. La fecha es un objetivo sujeto a cumplir todos los criterios de seguridad, persistencia y recuperación; si no se cumplen, se presenta una demo local con datos ficticios y no se cargan datos reales.

Este documento contiene los issues para crear manualmente desde GitHub Issues en VS Code. Para cada issue, copia el título, configura labels y milestone, pega el cuerpo y luego agrégalo al proyecto. Los códigos `I01`, `I02`, etc. solo sirven para referenciar dependencias en este documento; reemplázalos por los números reales de GitHub al crear los issues.

## Cómo cargarlo en GitHub

1. Crea un GitHub Project llamado **Sistema de Gestión para Chatarrería**.
2. Configura los campos del proyecto según esta tabla:

| Campo     | Tipo      | Opciones                                                       |
| --------- | --------- | -------------------------------------------------------------- |
| Status    | Estado    | Backlog, Por hacer, En progreso, En revisión, Hecho            |
| Prioridad | Selección | Alta, Media, Baja                                              |
| Tamaño    | Selección | S, M, L                                                        |
| Etapa     | Selección | M0 Entregable 1, M1 Mejoras operativas, M2 Báscula, M3 Entrega |

3. Crea los milestones indicados más abajo y asigna sus fechas límite.
4. Crea los labels de la lista siguiente. GitHub ya ofrece `bug` por defecto en muchos repositorios; verifica si existe antes de duplicarlo.
5. Crea cada issue y agrégalo al Project. Configura los campos **Status**, **Prioridad**, **Tamaño** y **Etapa** usando los valores indicados en cada issue.
6. Al tener los números reales, vincula las dependencias con las opciones de GitHub **Development / linked issues** o agregando `Blocked by #N` al cuerpo.

### Labels

Usar estos nombres exactos para que sean consistentes con la arquitectura:

`feat` · `bug` · `docs` · `infra` · `ui` · `test` · `seguridad` · `bascula` · `recibo` · `inventario` · `decision` · `bloqueado`

Un issue puede tener más de un label. Los milestones y las opciones del Project son elementos separados: no se crean como labels.

## Milestones

| Milestone                               | Fecha límite | Resultado esperado                                                                                                                                                                 |
| --------------------------------------- | -----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0 — Entregable 1: piloto operativo** |  30 sep 2026 | Aplicación publicada por HTTPS y privada para un negocio; materiales, compras, ventas, inventario, historial, anulación, recibo, base persistente y respaldo restaurado en prueba. |
| **M1 — Mejoras operativas**             |   9 oct 2026 | Terceros, exportación, recibo térmico y mejoras de reportes/uso, priorizadas con el cliente.                                                                                       |
| **M2 — Integración de báscula**         |  16 oct 2026 | Compatibilidad comprobada con el equipo real o decisión documentada de mantener el ingreso manual / usar un agente local.                                                          |
| **M3 — Entrega y capacitación**         |  19 oct 2026 | Pruebas finales, revisión de seguridad, manual, capacitación y aceptación del cliente.                                                                                             |

> La fecha de M0 es una meta, no una autorización para publicar sin completar los criterios de salida. No se cargan registros reales hasta verificar acceso privado, base de producción y restauración del respaldo.

## Issues M0 — Entregable 1: piloto operativo

### I01 — Inicializar aplicación y flujo de calidad

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `infra`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** Ninguno

**Cuerpo del issue:**

```markdown
## Objetivo

Crear la base ejecutable del sistema con Next.js App Router y TypeScript, manteniendo la estructura simple y preparada para las funciones del prototipo.

## Alcance

- Inicializar el proyecto y configurar ESLint y Prettier.
- Definir una estructura inicial para rutas, componentes compartidos y módulos del negocio.
- Agregar comandos documentados para desarrollo, lint y verificación de tipos.
- Crear una pantalla inicial responsive con navegación a Materiales, Compras, Ventas e Inventario.
- Preparar la base PWA: metadatos de instalación, nombre e iconos, y comportamiento de apertura adecuado en móvil; no habilitar almacenamiento/sincronización offline de operaciones.

## Criterios de aceptación

- [ ] La aplicación inicia localmente con el comando documentado.
- [ ] ESLint y la verificación de TypeScript terminan sin errores.
- [ ] Las cuatro secciones principales son accesibles desde la navegación.
- [ ] La navegación funciona en un viewport de celular y en escritorio.
- [ ] La configuración PWA se sirve correctamente desde el despliegue HTTPS y permite instalación en al menos un navegador móvil compatible.
- [ ] Los formularios y navegación pueden operarse con controles táctiles en una pantalla de teléfono.
- [ ] No se incluyen secretos ni credenciales en el repositorio.

## Notas técnicas

Seguir el stack propuesto en `Arquitectura_Sistema_Chatarreria.md`. Evitar crear capas o abstracciones que no se usen en el prototipo.
```

### I02 — Crear esquema PostgreSQL y persistencia inicial

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `infra`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I01

**Cuerpo del issue:**

```markdown
## Objetivo

Persistir los datos del prototipo en PostgreSQL con migraciones versionadas, evitando construir una demostración desechable cuyos datos luego haya que migrar.

## Alcance

- Configurar Drizzle ORM y Drizzle Kit.
- Crear las tablas iniciales de materiales, terceros, transacciones y líneas de transacción.
- Guardar en cada línea el precio usado en el momento de registrar la operación.
- Configurar la conexión mediante variables de entorno y un `.env.example` sin secretos.
- Crear y ejecutar la primera migración.

## Criterios de aceptación

- [ ] El esquema representa compras y ventas con una o más líneas por transacción.
- [ ] Las cantidades y valores monetarios usan tipos numéricos apropiados, no `float` para dinero.
- [ ] La migración se aplica desde una base de datos vacía.
- [ ] La aplicación puede leer y escribir un registro de prueba en PostgreSQL.
- [ ] Las credenciales no están versionadas.

## Notas técnicas

La base local es solo para desarrollo. La base productiva será PostgreSQL administrado, inicialmente Neon si se confirman proveedor, límites y condiciones vigentes. No cargar datos reales antes de verificar autenticación y restauración del respaldo.
```

### I03 — Gestionar materiales y tarifas

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I02

**Cuerpo del issue:**

```markdown
## Objetivo

Permitir consultar, crear y editar los materiales y los precios usados al comprar y vender chatarra.

## Alcance

- Registrar nombre, estado activo y precios por kilo para compra minorista, compra mayorista y venta.
- Mostrar una tabla legible de materiales y precios.
- Validar nombre y precios antes de guardar.
- Evitar eliminar físicamente materiales que ya estén ligados a transacciones; permitir desactivarlos.

## Criterios de aceptación

- [ ] El usuario puede crear y editar un material.
- [ ] Los precios no aceptan valores negativos y se muestran en COP.
- [ ] Los materiales inactivos no se ofrecen en nuevas operaciones.
- [ ] Los cambios persisten al recargar la aplicación.
- [ ] Se muestra confirmación o error comprensible después de guardar.

## Notas técnicas

La interfaz debe ser operable desde celular y computador. No incluir carga masiva en esta versión.
```

### I04 — Registrar compras con peso manual

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M0 Entregable 1`  
**Depende de:** I02, I03

**Cuerpo del issue:**

```markdown
## Objetivo

Registrar una compra de material con peso digitado, tarifa, precio aplicado y total calculado.

## Alcance

- Seleccionar uno o más materiales y la tarifa de compra aplicable.
- Ingresar peso en kilogramos y calcular subtotal y total.
- Guardar la operación y sus líneas en una transacción de base de datos.
- Copiar el precio unitario usado para preservar el valor histórico.
- Permitir registrar la compra sin tercero en el Entregable 1; asociar proveedor queda para M1.

## Criterios de aceptación

- [ ] El peso debe ser mayor que cero.
- [ ] El total se calcula a partir de peso y precio; no se confía en un total enviado por el navegador.
- [ ] Al guardar, la operación queda persistida y aparece como compra.
- [ ] Si ocurre un error al guardar, no queda una transacción parcial.
- [ ] El precio histórico no cambia si luego se edita el precio del material.

## Notas técnicas

Validar datos también en servidor. Usar una transacción PostgreSQL para el encabezado y las líneas.
```

### I05 — Registrar ventas y evitar stock negativo

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M0 Entregable 1`  
**Depende de:** I04

**Cuerpo del issue:**

```markdown
## Objetivo

Registrar la salida de material vendido y prevenir que una venta deje inventario negativo.

## Alcance

- Seleccionar material, peso vendido y precio de venta por kilo.
- Calcular subtotales y total en servidor.
- Guardar la venta y sus líneas de forma atómica.
- Consultar el stock disponible antes de confirmar.

## Criterios de aceptación

- [ ] No se puede vender un peso mayor al stock disponible.
- [ ] El sistema vuelve a validar el stock al guardar, no solo al cargar el formulario.
- [ ] Una venta confirmada descuenta el stock calculado.
- [ ] Si dos operaciones concurrentes pudieran exceder el stock, la persistencia aplica una estrategia transaccional para evitarlo.
- [ ] La venta queda guardada con el precio aplicado y el total calculado.

## Notas técnicas

El inventario se obtiene de compras menos ventas activas; no mantener una cifra duplicada que pueda descuadrarse.
```

### I06 — Consultar inventario actual por material

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `inventario`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I04, I05, I10

**Cuerpo del issue:**

```markdown
## Objetivo

Mostrar el stock disponible de cada material en kilogramos a partir de las operaciones registradas.

## Criterios de aceptación

- [ ] Las compras activas suman stock y las ventas activas lo restan.
- [ ] Se muestran materiales sin movimiento con stock cero.
- [ ] El resultado se actualiza después de registrar una compra o venta.
- [ ] La cantidad se muestra con precisión consistente y unidad kg.
- [ ] La consulta excluye transacciones anuladas cuando estas existan en M1.

## Notas técnicas

No crear una tabla de inventario duplicada para el prototipo sin una necesidad de rendimiento medida.
```

### I07 — Generar e imprimir recibo interno

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `recibo`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I04, I05

**Cuerpo del issue:**

```markdown
## Objetivo

Mostrar un recibo interno de compra o venta y permitir imprimirlo desde el navegador.

## Alcance

- Incluir fecha, número interno provisional, tipo de operación, materiales, kilos, precio y total.
- Crear estilos de impresión que oculten navegación y controles de pantalla.
- Identificar claramente el documento como recibo interno no válido como factura electrónica ni documento POS DIAN.

## Criterios de aceptación

- [ ] Desde una operación guardada se puede abrir su recibo.
- [ ] Los datos impresos corresponden a los valores históricos de la operación.
- [ ] La impresión en hoja normal es legible y no incluye controles de la aplicación.
- [ ] Se muestra la aclaración de que no es documento electrónico validado por la DIAN.

## Notas técnicas

Usar HTML, CSS de impresión y `window.print()`. El formato térmico 58/80 mm queda para M1.
```

### I08 — Aceptar el piloto operativo con el cliente

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `test`, `docs`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I03, I04, I05, I06, I07, I10, I11, I12, I13, I16

**Cuerpo del issue:**

```markdown
## Objetivo

Verificar que el negocio puede iniciar trabajo con una versión publicada, privada y respaldada.

## Criterios de aceptación

- [ ] El cliente inicia sesión desde su dispositivo y el segundo usuario autorizado puede acceder si se habilitó.
- [ ] Un visitante sin sesión no puede leer ni modificar datos; no hay registro público.
- [ ] Se crea un material, se registra una compra, se consulta inventario, se registra una venta válida y se imprime su recibo.
- [ ] Se rechaza una venta superior al stock y se anula una operación de prueba, comprobando que el inventario se recalcula.
- [ ] Los registros siguen disponibles después de cerrar sesión y volver a entrar desde otro dispositivo.
- [ ] La base de producción y el respaldo/restauración de prueba se verifican antes de ingresar información real.
- [ ] El cliente recibe URL, acceso inicial por canal seguro y una guía breve de operación y soporte.
- [ ] Desde un teléfono real, con navegador móvil, el usuario inicia sesión, registra una compra o venta, consulta inventario y vuelve a ver el registro guardado.
- [ ] La PWA se puede instalar desde el navegador compatible, muestra nombre e icono del negocio y abre en una presentación móvil cuidada.
- [ ] La interfaz indica que se requiere conexión para consultar/guardar; no aparenta aceptar operaciones offline ni perder silenciosamente un registro.
- [ ] Se verifica también en escritorio. Producción no contiene registros ficticios de demo.

## Notas técnicas

No marcar M0 como entregado solo por una demo local o un build exitoso. El cliente empieza a usarlo únicamente después de aprobar estos criterios.
```

## Issues M1 — Mejoras operativas

### I09 — Gestionar clientes y proveedores

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `ui`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I02, I04

**Cuerpo del issue:**

```markdown
## Objetivo

Guardar terceros y asociarlos a compras y ventas.

## Alcance

- Registrar nombre, documento opcional, teléfono opcional y tipo: cliente, proveedor o ambos.
- Buscar y seleccionar un tercero en el formulario de operación.
- Permitir actualizar datos sin alterar transacciones previas.

## Criterios de aceptación

- [ ] Se puede crear, buscar y editar un tercero.
- [ ] Se puede asociar el tercero a una compra o venta.
- [ ] El tercero asociado aparece en el historial y recibo.
- [ ] Los campos opcionales pueden quedar vacíos sin bloquear el registro.
```

### I10 — Implementar autenticación y proteger la aplicación

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `seguridad`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M0 Entregable 1`  
**Depende de:** I02

**Cuerpo del issue:**

```markdown
## Objetivo

Restringir el acceso al sistema del negocio al propietario y, si se requiere, a un segundo administrador autorizado antes de habilitar el acceso al cliente.

## Alcance

- Confirmar integración de Better Auth con las versiones reales del proyecto; configurar sesiones seguras y persistencia en PostgreSQL.
- Proteger todas las rutas y acciones que leen o modifican datos del negocio.
- Definir un procedimiento controlado para crear o invitar los 1–2 usuarios iniciales; no habilitar registro público ni autoinscripción.
- Documentar inicio/cierre de sesión y recuperación de acceso.

## Criterios de aceptación

- [ ] Un visitante no autenticado no puede consultar materiales, operaciones ni inventario.
- [ ] Las acciones de servidor comprueban sesión antes de acceder o modificar datos.
- [ ] El sistema no ofrece registro abierto al público.
- [ ] La sesión se invalida al cerrar sesión.
- [ ] Las cookies de sesión usan opciones seguras en producción y la protección se prueba en rutas y acciones de servidor.
- [ ] Las claves y secretos se guardan en variables de entorno y no en Git.

## Notas técnicas

No desplegar ni cargar datos reales hasta completar todas las verificaciones de este issue.
```

### I11 — Desplegar la aplicación privada

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `infra`, `seguridad`  
**Project:** Status `Hecho` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I02, I03, I04, I05, I06, I07, I10, I12, I13

**Cuerpo del issue:**

```markdown
## Objetivo

Publicar una instancia del prototipo para un negocio, accesible desde sus dispositivos, protegida con autenticación y conectada a una base persistente.

## Alcance

El prototipo se publica en Netlify con base en Neon: https://chatarreria-el-cocha.netlify.app/. Las variables de entorno están fuera del repositorio y el despliegue es automático desde `main`. El respaldo y la restauración se tratan en I16; la guía de rollback queda como mejora.

## Criterios de aceptación

- [x] La aplicación está disponible mediante HTTPS.
- [x] Las operaciones de escritura apuntan a la base de producción.
- [x] Una sesión cerrada no puede consultar ni modificar datos.
- [x] Las credenciales de producción no aparecen en el bundle del navegador ni en Git.
- [x] La instancia y la base son de un solo negocio; no se mezclan datos de clientes.

## Notas técnicas

Verificado el 4 de octubre de 2026: HTTP redirige a HTTPS con HSTS, las rutas privadas redirigen a `/ingresar` sin sesión y los archivos JS del navegador no contienen secretos. Queda fuera de este issue: respaldo verificado y restauración (I16) y documentar cómo volver a una versión anterior (se puede restaurar un despliegue anterior desde Netlify).
```

### I12 — Consultar historial y resumen diario

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I04, I05

**Cuerpo del issue:**

```markdown
## Objetivo

Consultar operaciones guardadas para que el negocio pueda revisar sus registros diarios.

## Alcance

- Mostrar fecha, consecutivo, tipo, materiales/líneas, peso, total y estado.
- Filtrar por fecha o rango de fechas y por tipo de operación.
- Mostrar total comprado, total vendido y cantidad de operaciones para el período.

## Criterios de aceptación

- [ ] Los filtros se aplican en servidor y muestran un estado vacío cuando no hay resultados.
- [ ] Los totales excluyen operaciones anuladas.
- [ ] Los importes se presentan en COP y las fechas usan la zona horaria definida para el negocio.
- [ ] Al abrir una operación se pueden consultar sus líneas y recibo.
- [ ] Solo usuarios autenticados del negocio pueden consultar el historial.
```

### I13 — Anular operaciones con trazabilidad

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I04, I05, I06, I10, I12

**Cuerpo del issue:**

```markdown
## Objetivo

Corregir operaciones por medio de anulación, conservando su registro y ajustando los resultados derivados.

## Criterios de aceptación

- [ ] Una operación no se elimina físicamente.
- [ ] Antes de anular se solicita confirmación.
- [ ] Una compra anulada deja de sumar al inventario y una venta anulada deja de restar.
- [ ] Historial y resumen identifican la operación como anulada y no la suman en totales activos.
- [ ] No se puede anular dos veces de forma que se aplique dos veces el ajuste.
- [ ] La operación sigue disponible para auditoría con fecha y estado.
- [ ] Solo un usuario con rol `admin` puede anular; se conservan fecha, usuario y motivo (obligatorio).
- [ ] Anular una compra se rechaza si deja stock negativo (el material ya se vendió), también con usuarios concurrentes.
- [ ] La acción **Corregir** anula la operación y abre el formulario de compra o venta prellenado con sus líneas.

## Notas técnicas

- Migración: `anuladaEn`, `anuladaPor` (referencia a `user`) y `motivoAnulacion` en `transacciones`.
- Anulación idempotente: `UPDATE … WHERE id = $1 AND estado = 'activa' RETURNING`; cero filas = ya anulada.
- Anular una compra reduce stock: tomar el mismo bloqueo `FOR UPDATE` sobre materiales que `guardarVenta` y verificar stock antes de confirmar.
- La autorización por rol se valida en el servidor (server action), no solo ocultando el botón.
```

### I14 — Exportar datos a Excel

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I06, I12

**Cuerpo del issue:**

```markdown
## Objetivo

Permitir descargar una copia de las operaciones e inventario en un formato que pueda abrirse en Excel.

## Alcance

- Exportar compras y ventas con fechas, tercero, material, peso, precio y total.
- Exportar inventario actual por material.
- Aplicar los filtros de fecha seleccionados cuando se exporta el historial.

## Criterios de aceptación

- [ ] Los archivos abren correctamente en Excel o una hoja de cálculo compatible.
- [ ] Los encabezados son comprensibles y las cifras no se exportan como texto malformado.
- [ ] El nombre del archivo incluye tipo de reporte y fecha de generación.
- [ ] La exportación requiere sesión autenticada.

## Notas técnicas

Usar CSV si `.xlsx` añade complejidad innecesaria; cumplir el requisito funcional de exportación a hoja de cálculo.
```

### I15 — Preparar recibo para impresora térmica

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `recibo`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I07

**Cuerpo del issue:**

```markdown
## Objetivo

Adaptar el recibo interno para impresión en tirilla de 58 mm y 80 mm además de hoja normal.

## Criterios de aceptación

- [ ] Los dos anchos se pueden seleccionar o configurar con claridad.
- [ ] En pruebas de impresión los datos no se cortan horizontalmente.
- [ ] Se conserva el formato de hoja normal.
- [ ] El total, kilos, precios y aclaración DIAN se leen correctamente en la tirilla.

## Notas técnicas

Usar CSS de impresión y probar con el modelo disponible. La impresión directa ESC/POS no está incluida.
```

### I16 — Automatizar respaldo y probar restauración

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `infra`, `seguridad`, `test`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I02, I11

**Cuerpo del issue:**

```markdown
## Objetivo

Proteger los registros reales del piloto con copias de seguridad y comprobar la recuperación antes de habilitar el servicio.

## Alcance

- Configurar `pg_dump` diario o un mecanismo administrado equivalente, compatible con el proveedor y con retención acordada.
- Guardar la copia cifrada o en un destino con acceso restringido y retención definida.
- Evitar imprimir secretos en logs de GitHub Actions.
- Probar generación y restauración con datos ficticios en una base no productiva antes de abrir el piloto.
- Dejar programado el respaldo de producción antes de que el cliente empiece a registrar operaciones reales; verificar la primera copia y repetir una restauración periódicamente en una base no productiva.

## Criterios de aceptación

- [ ] Una copia de prueba se genera y restaura correctamente en un entorno no productivo.
- [ ] El respaldo de producción queda programado y su primera ejecución exitosa se comprueba antes de habilitar registros reales.
- [ ] La restauración se prueba en una base separada; nunca se ensaya sobrescribiendo producción.
- [ ] Los secretos están en GitHub Secrets y no en el workflow.
- [ ] Se documentan retención, ubicación, responsable y pasos de restauración.
- [ ] Se define cómo alertar si el respaldo falla.

## Notas técnicas

El historial del proveedor por sí solo no cuenta como respaldo verificado. Confirmar cuotas, costo, retención y responsable antes de habilitar el piloto.
```

## Issues M2 — Integración de báscula

### I17 — Identificar báscula, salida y protocolo

**Milestone:** M2 — Integración de báscula  
**Labels:** `decision`, `bascula`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `S` · Etapa `M2 Báscula`  
**Depende de:** Ninguno

**Cuerpo del issue:**

```markdown
## Objetivo

Determinar si la báscula del negocio puede entregar su lectura al computador y bajo qué protocolo.

## Criterios de aceptación

- [ ] Se registra marca, modelo y manual disponible.
- [ ] Se identifica si la conexión es USB, RS-232 u otra.
- [ ] Se obtiene una lectura real o evidencia técnica suficiente para decidir el siguiente paso.
- [ ] Se registra la decisión: Web Serial, agente local o ingreso manual.
- [ ] Si requiere adaptador, controlador o costo, queda documentado antes de implementar.

## Notas técnicas

No prometer compatibilidad hasta probar el equipo real. La Web Serial API requiere navegador compatible y contexto seguro.
```

### I18 — Construir prueba de concepto de lectura de peso

**Milestone:** M2 — Integración de báscula  
**Labels:** `bascula`, `test`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `M` · Etapa `M2 Báscula`  
**Depende de:** I17

**Cuerpo del issue:**

```markdown
## Objetivo

Probar la lectura desde el navegador en un computador usando la báscula real, antes de conectarla al flujo de negocio.

## Criterios de aceptación

- [ ] El navegador solicita permiso explícito para seleccionar el puerto.
- [ ] La lectura se interpreta correctamente en kg para el protocolo identificado.
- [ ] La interfaz muestra desconexión, lectura inválida y permisos denegados sin bloquear la aplicación.
- [ ] Se documentan navegador, sistema operativo, adaptador y configuración de puerto probados.
- [ ] Si Web Serial no funciona con el equipo, se detiene esta vía y se estima la alternativa antes de ampliar alcance.

## Notas técnicas

No conectar esta prueba directamente a una transacción productiva hasta completar I19.
```

### I19 — Integrar botón de lectura con ingreso manual de respaldo

**Milestone:** M2 — Integración de báscula  
**Labels:** `feat`, `bascula`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M2 Báscula`  
**Depende de:** I04, I05, I18

**Cuerpo del issue:**

```markdown
## Objetivo

Permitir tomar el peso de la báscula en compras y ventas sin quitar la opción de digitarlo manualmente.

## Criterios de aceptación

- [ ] El botón de lectura funciona en el computador y navegador probados en I18.
- [ ] El peso leído se presenta antes de guardar y puede ser confirmado por el usuario.
- [ ] Se puede escribir el peso manualmente si no hay báscula, conexión o permiso.
- [ ] La operación guarda si el peso fue manual o leído desde báscula.
- [ ] Un valor inválido no se acepta ni produce una transacción.

## Notas técnicas

Si se requiere agente local, dividirlo en otro issue con estimación y aprobación del cliente antes de desarrollarlo.
```

## Issues M3 — Entrega y capacitación

### I20 — Completar pruebas de flujos y revisión de seguridad

**Milestone:** M3 — Entrega y capacitación  
**Labels:** `test`, `seguridad`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `L` · Etapa `M3 Entrega`  
**Depende de:** I10, I11, I12, I13, I14, I16, I17. I18 e I19 solo bloquean la entrega si I17 confirma compatibilidad y se aprueba implementar la lectura.

**Cuerpo del issue:**

```markdown
## Objetivo

Verificar los flujos principales antes de entregar el sistema y cerrar los riesgos de seguridad funcionales.

## Pruebas mínimas

- Inicio/cierre de sesión y rutas protegidas.
- Crear material, registrar compra, revisar stock, registrar venta e imprimir recibo.
- Rechazar una venta superior al stock disponible.
- Anular una operación y comprobar inventario e informes.
- Exportar historial y restaurar una copia en un entorno no productivo.
- Usar la aplicación en móvil y escritorio.

## Criterios de aceptación

- [ ] Las pruebas unitarias de cálculos y validaciones pasan.
- [ ] Las pruebas end-to-end cubren los flujos principales acordados.
- [ ] La báscula se prueba si fue declarada compatible y aprobada; si no, se confirma con el cliente el ingreso manual como solución de entrega.
- [ ] No hay errores bloqueantes conocidos en lint, tipos ni pruebas.
- [ ] Se revisan autorización del servidor, validación de entradas, secretos y acceso a datos.
- [ ] Se registran defectos pendientes con prioridad y decisión de resolución antes de entrega.
```

### I21 — Preparar manual, capacitación y aceptación

**Milestone:** M3 — Entrega y capacitación  
**Labels:** `docs`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `M` · Etapa `M3 Entrega`  
**Depende de:** I20

**Cuerpo del issue:**

```markdown
## Objetivo

Entregar al cliente instrucciones operativas y realizar una capacitación breve sobre el sistema desplegado.

## Alcance

- Documentar acceso, materiales/precios, compras, ventas, inventario, recibos, historial, exportación y respaldo.
- Aclarar cómo actuar si falla internet o la báscula.
- Reiterar que el recibo es interno y no sustituye facturación electrónica ni documento POS DIAN.
- Registrar observaciones y aceptación de entrega.

## Criterios de aceptación

- [ ] El manual corresponde a la versión desplegada y usa capturas actuales si son necesarias.
- [ ] El cliente puede completar sin ayuda una compra, una venta y consultar inventario.
- [ ] Se explica cómo imprimir y exportar información.
- [ ] Se revisa con el cliente el acceso y el procedimiento para reportar un problema.
- [ ] Quedan registrados los pendientes fuera del alcance, incluido DIAN, y cualquier aceptación acordada.
```

## Issues M1 — Ajustes solicitados en el piloto (30 sep 2026)

### I22 — Mostrar el inventario con un decimal

**Milestone:** M1 — Mejoras operativas  
**Labels:** `ui`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `S` · Etapa `M1 Mejoras operativas`  
**Depende de:** I06

**Cuerpo del issue:**

```markdown
## Objetivo

Leer el inventario sin ruido: mostrar los kilos con un solo decimal en lugar de tres.

## Criterios de aceptación

- [ ] El inventario muestra a lo sumo un decimal y sin ceros sobrantes (`12 kg`, `12,5 kg`).
- [ ] Un stock entre 1 g y 49 g se muestra como `< 0,1 kg`, nunca como `0 kg`.
- [ ] Recibos y mensajes de stock insuficiente conservan el peso exacto.
- [ ] Pruebas para 0 g, 40 g, 50 g, 1.000 g y 12.549 g.

## Notas técnicas

Solo cambia la presentación: la base sigue guardando gramos exactos. Crear un formateador nuevo en lugar de modificar `formatearKg`, que usan recibos y errores.
```

### I23 — Eliminar o desactivar un material

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Media` · Tamaño `S` · Etapa `M1 Mejoras operativas`  
**Depende de:** I03

**Cuerpo del issue:**

```markdown
## Objetivo

Quitar del catálogo materiales creados por error sin romper recibos anteriores.

## Criterios de aceptación

- [ ] Un material sin movimientos se elimina tras confirmación.
- [ ] Un material con movimientos no se elimina; se ofrece desactivarlo.
- [ ] Si un material con stock mayor que cero se va a desactivar, se advierte antes.
- [ ] Los recibos existentes siguen mostrando el nombre del material.

## Notas técnicas

`lineas_transaccion.materialId` usa `onDelete: restrict`. Verificar movimientos dentro de una transacción y además traducir el error `23503` por si una compra concurrente usa el material.
```

### I24 — Buscar materiales y crearlos desde la compra

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I03, I04, I05

**Cuerpo del issue:**

```markdown
## Objetivo

Elegir el material escribiendo su nombre y, en compras, crearlo en el momento si no existe.

## Criterios de aceptación

- [ ] La búsqueda ignora mayúsculas y tildes.
- [ ] En compras, si no hay coincidencias se ofrece «Crear "texto"» con nombre y precio de compra; queda seleccionado en la línea.
- [ ] En ventas solo se busca; no se crean materiales (no tendrían stock).
- [ ] Si el nombre coincide con un material inactivo, se ofrece reactivarlo en lugar de mostrar un error de duplicado.
- [ ] Crear un material no borra las demás líneas del formulario.
- [ ] Se puede operar solo con teclado y funciona con el teclado táctil del teléfono.

## Notas técnicas

Combobox accesible (patrón ARIA). La creación reutiliza `materiales.guardarMaterial` para conservar la misma validación.
```

### I25 — Adaptar la interfaz a teléfono

**Milestone:** M1 — Mejoras operativas  
**Labels:** `ui`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I12, I13, I24

**Cuerpo del issue:**

```markdown
## Objetivo

Usar la aplicación cómodamente en el teléfono del negocio.

## Criterios de aceptación

- [ ] Sin desplazamiento horizontal de la página en 360, 390, 768 y 1280 px.
- [ ] Las tablas (recientes, materiales, historial) se muestran como tarjetas en pantallas pequeñas.
- [ ] Las líneas de compra/venta se apilan en teléfono; total y botón de registrar quedan visibles abajo.
- [ ] Botones y áreas táctiles de al menos 44 px.
```

### I26 — Mejorar el diseño visual

**Milestone:** M1 — Mejoras operativas  
**Labels:** `ui`  
**Project:** Status `Backlog` · Prioridad `Baja` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I25

**Cuerpo del issue:**

```markdown
## Objetivo

Hacer la aplicación más clara y agradable sin cambiar los flujos.

## Alcance

- Inicio con resumen del día (comprado, vendido, materiales con poco stock).
- Confirmación visible al guardar.
- Jerarquía visual y colores definidos en un solo lugar.

## Criterios de aceptación

- [ ] El cliente aprueba la propuesta con referencias o capturas antes de implementarla.
- [ ] Contraste de texto según WCAG AA.
```

### I27 — Rol de trabajador con permisos limitados

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `seguridad`  
**Project:** Status `En progreso` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Entregable 1`  
**Depende de:** I10, I13

**Cuerpo del issue:**

```markdown
## Objetivo

Que el negocio pueda dar acceso a trabajadores que registren compras y ventas sin ver el inventario ni poder modificar o borrar información. Los errores los corrige el administrador.

## Alcance

- Un trabajador es un usuario con rol `user`; el administrador conserva el rol `admin`.
- El trabajador puede: iniciar sesión, registrar compras y ventas, ver el recibo de lo registrado, ver la lista de materiales y crear materiales nuevos (también desde la compra).
- El trabajador no puede: ver el inventario ni el historial, editar, desactivar, reactivar o eliminar materiales, ni anular o corregir operaciones.
- Los permisos se comprueban en el servidor (páginas y acciones); ocultar enlaces es solo una ayuda visual.
- Crear un trabajador con un comando documentado (`npm run auth:crear-trabajador`).

## Criterios de aceptación

- [ ] Un trabajador no ve Inventario ni Historial en la navegación y, al abrir esas rutas, vuelve al inicio.
- [ ] Un trabajador no puede editar, desactivar ni eliminar un material, ni por la interfaz ni invocando la acción.
- [ ] Un trabajador no puede anular ni corregir una operación, ni por la interfaz ni invocando la acción.
- [ ] Un trabajador registra una compra y una venta y ve su recibo, sin botones de corrección o anulación.
- [ ] El inicio del trabajador no muestra totales ni movimientos del día.
- [ ] El administrador conserva todo lo que ya podía hacer.

## Notas técnicas

La pantalla de venta muestra el stock disponible de cada material para evitar vender de más; se mantiene porque el servidor ya impide el stock negativo, y se informa al cliente.
```

### I28 — Gestionar usuarios desde la aplicación

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `seguridad`, `ui`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I27

**Cuerpo del issue:**

```markdown
## Objetivo

Que el administrador cree, desactive y restablezca la contraseña de trabajadores desde la aplicación, sin usar la terminal.

## Criterios de aceptación

- [ ] Una pantalla exclusiva del administrador lista los usuarios y su rol.
- [ ] El administrador crea un trabajador con nombre, correo y contraseña inicial.
- [ ] El administrador puede desactivar a un trabajador y revocar sus sesiones.
- [ ] El administrador no puede quitarse su propio rol ni desactivarse.
- [ ] No existe registro público.
```

### I29 — Iniciar sesión con usuario en lugar de correo

**Milestone:** M0 — Entregable 1: piloto operativo  
**Labels:** `feat`, `seguridad`  
**Project:** Status `En progreso` · Prioridad `Alta` · Tamaño `S` · Etapa `M0 Entregable 1`  
**Depende de:** I10, I27

**Cuerpo del issue:**

```markdown
## Objetivo

Que los trabajadores entren con un nombre de usuario corto y no con un correo, que muchos no usan o no recuerdan.

## Criterios de aceptación

- [ ] La pantalla de ingreso pide "Usuario" y contraseña.
- [ ] El usuario no distingue mayúsculas y es único (3 a 30 caracteres: letras, números, punto o guion bajo).
- [ ] El administrador existente sigue entrando con su correo hasta que se le asigne un usuario.
- [ ] Se puede crear un trabajador con usuario y asignar uno a una cuenta existente por comando.
- [ ] Una contraseña incorrecta o un usuario inexistente muestran el mismo mensaje genérico.

## Notas técnicas

Plugin `username` de Better Auth con una migración que agrega `user.username` (único). El correo sigue siendo obligatorio en la base: para un trabajador puede ser un valor interno ficticio. Aplicar la migración en producción antes de desplegar el código.
```

### I30 — Registrar gastos y reporte de gastos

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M1 Mejoras operativas`  
**Depende de:** I02, I10, I27

**Cuerpo del issue:**

```markdown
## Objetivo

Que el administrador registre el dinero que sale de la chatarrería por motivos distintos a comprar material (pagos a personas, compras de insumos, servicios) y consulte cuánto se gastó por categoría.

## Alcance

- Registrar un gasto con fecha, categoría, monto, descripción, a quién se pagó (texto libre, opcional) y medio de pago (opcional).
- Categorías ("items") administrables por el administrador, con un conjunto inicial: Pago a trabajadores, Transporte y fletes, Servicios públicos, Arriendo, Mantenimiento y herramientas, Insumos, Impuestos y trámites, Otros.
- Los gastos no se borran ni se editan: se anulan con motivo, usuario y fecha, igual que las compras y ventas.
- Reporte de gastos por período con total y desglose por categoría; el trabajador no ve ni registra gastos.

## Criterios de aceptación

- [ ] El administrador registra un gasto con categoría y monto; los campos opcionales pueden quedar vacíos.
- [ ] El administrador crea y desactiva categorías sin perder los gastos ya registrados con ellas.
- [ ] Un gasto anulado deja de contar en los totales y conserva quién, cuándo y por qué.
- [ ] El reporte muestra el total del período y el desglose por categoría, y se puede filtrar por fechas y categoría.
- [ ] El trabajador no puede ver ni registrar gastos, ni abrir sus rutas.

## Notas técnicas

Supuesto: solo el administrador gestiona gastos. Los montos son pesos enteros. Un gasto puede ser un pago a una persona (categoría "Pago a trabajadores" con el nombre en "pagado a") o la compra de algo para el negocio.
```

### I31 — Capital del negocio y saldo

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M1 Mejoras operativas`  
**Depende de:** I04, I05, I30

**Cuerpo del issue:**

```markdown
## Objetivo

Conocer el dinero total con que cuenta el negocio y verlo bajar con cada compra y gasto, y subir con cada venta.

## Alcance

- Registrar el capital inicial y otros movimientos de capital (aporte o retiro del dueño) con fecha, monto y nota.
- Calcular el saldo: capital aportado menos retiros, más ventas, menos compras, menos gastos; solo cuentan las operaciones activas.
- Mostrar el saldo actual y su desglose en la pantalla de capital y en el inicio del administrador.
- Mostrar la evolución del saldo por día en un período.

## Criterios de aceptación

- [ ] El administrador registra el capital inicial y los aportes o retiros posteriores.
- [ ] Al registrar una compra o un gasto el saldo baja por su monto; al registrar una venta sube.
- [ ] Anular una compra, venta o gasto devuelve el saldo a su valor anterior.
- [ ] El saldo se muestra con su desglose (capital, ventas, compras, gastos, retiros).
- [ ] El trabajador no ve el saldo ni los movimientos de capital.

## Notas técnicas

Supuesto: el saldo es caja disponible y las compras y ventas se consideran pagadas de contado en el momento. Si existen fiados o créditos se tratarán en un issue aparte. El inventario no se suma al saldo; se muestra su valor aparte en el reporte de rentabilidad (I32).
```

### I32 — Reporte de rentabilidad

**Milestone:** M1 — Mejoras operativas  
**Labels:** `feat`, `ui`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M1 Mejoras operativas`  
**Depende de:** I05, I06, I30, I31

**Cuerpo del issue:**

```markdown
## Objetivo

Saber cuánto gana realmente el negocio en un período, descontando lo que costó el material vendido y los gastos, y cuánto valdría el inventario si se vendiera a un mayorista.

## Alcance

- Ingresos: total de ventas activas del período.
- Costo de lo vendido: costo promedio ponderado de compra de cada material, aplicado a los kilos vendidos.
- Utilidad bruta = ingresos − costo de lo vendido, con margen porcentual y desglose por material.
- Gastos del período por categoría (I30) y utilidad neta = utilidad bruta − gastos.
- Inventario actual valorado al costo y al precio de venta mayorista del material; diferencia como utilidad potencial.
- Filtro por rango de fechas; solo el administrador.

## Criterios de aceptación

- [ ] El reporte muestra ingresos, costo de lo vendido, utilidad bruta, gastos por categoría y utilidad neta del período.
- [ ] El costo de lo vendido usa el costo promedio ponderado de las compras activas del material hasta la fecha de la venta.
- [ ] Anular una compra, venta o gasto cambia el reporte de forma coherente.
- [ ] Se muestra el valor del inventario al costo y al precio de venta mayorista, con la utilidad potencial.
- [ ] Los materiales sin precio de venta o sin compras se señalan, no se valoran en cero en silencio.
- [ ] El trabajador no accede al reporte.

## Notas técnicas

Supuesto: "precio de venta a mayorista" es el precio de venta configurado en el material. Si el negocio vende a varios niveles de precio se definirá en un issue aparte. El costo promedio se recalcula por material a partir de las compras activas; las correcciones y anulaciones lo ajustan.
```

## Resumen de dependencias y orden sugerido

### Criterio de salida de M0

M0 se acepta cuando I01–I08, I10–I13 e I16 están completos y verificados en el entorno publicado. La app debe tener autenticación antes de exponer datos; migraciones, lectura/escritura y restauración deben probarse antes de cargar datos reales. El objetivo es iniciar una operación sencilla, no completar todos los reportes ni integraciones.

```text
M0: I01 -> I02 -> I03 -> I04 -> I05 -> I06 -> I07
    I10 autenticación -> I11 despliegue privado con acceso restringido
    I11 -> I16 respaldo/restauración en base no productiva
    I12 historial -> I13 anulación
    I08 acepta acceso, registro, consulta, corrección y recuperación; solo entonces se habilita al cliente

M1: I09 terceros (depende de I02/I04)
    I14 exportación (depende de I06/I12)
    I15 recibo térmico (depende de I07)
    I22 decimales · I23 borrar material · I24 buscar/crear material
    I12 + I13 + I24 -> I25 teléfono -> I26 diseño
    I27 rol de trabajador (M0) -> I28 gestión de usuarios
    I27 -> I29 inicio de sesión con usuario (M0)
    PRIORIDAD: I30 gastos -> I31 capital y saldo -> I32 rentabilidad

M2: I17 -> I18 -> I19 (I19 también requiere I04/I05)

M3: I20 valida los flujos terminados -> I21 capacitación y aceptación
```

## Fuera del alcance de estos milestones

- Facturación electrónica o documento POS electrónico validado por la DIAN.
- Roles adicionales al administrador y al trabajador (I27); solo el administrador anula y corrige operaciones.
- Soporte garantizado para cualquier modelo de báscula o impresión ESC/POS directa.
- Aplicación móvil nativa o modo sin conexión.
- Multiempresa o registro público de negocios.

Estos puntos requieren una decisión y estimación separadas antes de agregarse al alcance.
