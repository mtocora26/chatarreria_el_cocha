# Issues para GitHub Projects — Sistema de Gestión para Chatarrería

**Fecha de planeación:** 28 de septiembre de 2026  
**Inicio asumido:** 28 de septiembre de 2026  
**Prototipo demostrable:** 30 de septiembre de 2026  
**Entrega completa objetivo:** 19 de octubre de 2026  
**Responsable sugerido:** Manuel David Castro

Este documento contiene los issues para crear manualmente desde GitHub Issues en VS Code. Para cada issue, copia el título, configura labels y milestone, pega el cuerpo y luego agrégalo al proyecto. Los códigos `I01`, `I02`, etc. solo sirven para referenciar dependencias en este documento; reemplázalos por los números reales de GitHub al crear los issues.

## Cómo cargarlo en GitHub

1. Crea un GitHub Project llamado **Sistema de Gestión para Chatarrería**.
2. Configura los campos del proyecto según esta tabla:

| Campo     | Tipo      | Opciones                                            |
| --------- | --------- | --------------------------------------------------- |
| Status    | Estado    | Backlog, Por hacer, En progreso, En revisión, Hecho |
| Prioridad | Selección | Alta, Media, Baja                                   |
| Tamaño    | Selección | S, M, L                                             |
| Etapa     | Selección | M0 Prototipo, M1 Operación, M2 Báscula, M3 Entrega  |

3. Crea los milestones indicados más abajo y asigna sus fechas límite.
4. Crea los labels de la lista siguiente. GitHub ya ofrece `bug` por defecto en muchos repositorios; verifica si existe antes de duplicarlo.
5. Crea cada issue y agrégalo al Project. Configura los campos **Status**, **Prioridad**, **Tamaño** y **Etapa** usando los valores indicados en cada issue.
6. Al tener los números reales, vincula las dependencias con las opciones de GitHub **Development / linked issues** o agregando `Blocked by #N` al cuerpo.

### Labels

Usar estos nombres exactos para que sean consistentes con la arquitectura:

`feat` · `bug` · `docs` · `infra` · `ui` · `test` · `seguridad` · `bascula` · `recibo` · `inventario` · `decision` · `bloqueado`

Un issue puede tener más de un label. Los milestones y las opciones del Project son elementos separados: no se crean como labels.

## Milestones

| Milestone                       | Fecha límite | Resultado esperado                                                                                                                                                      |
| ------------------------------- | -----------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0 — Prototipo demostrable**  |  30 sep 2026 | Demo local con materiales, compras, ventas, inventario y recibo imprimible. Sin datos reales ni acceso público; los registros se guardan en PostgreSQL desde el inicio. |
| **M1 — Operación segura**       |   9 oct 2026 | Aplicación desplegada con acceso privado, gestión diaria, reportes, exportación y respaldo probado.                                                                     |
| **M2 — Integración de báscula** |  16 oct 2026 | Compatibilidad comprobada con el equipo real o decisión documentada de mantener el ingreso manual / usar un agente local.                                               |
| **M3 — Entrega y capacitación** |  19 oct 2026 | Pruebas finales, revisión de seguridad, manual, capacitación y aceptación del cliente.                                                                                  |

> Las fechas suponen trabajo desde el 28 de septiembre de 2026. La primera demo es un prototipo local, no un servicio desplegado sin autenticación. El despliegue accesible al cliente solo se hace después de proteger el acceso.

## Issues M0 — Prototipo demostrable

### I01 — Inicializar aplicación y flujo de calidad

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `infra`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Prototipo`  
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

## Criterios de aceptación

- [ ] La aplicación inicia localmente con el comando documentado.
- [ ] ESLint y la verificación de TypeScript terminan sin errores.
- [ ] Las cuatro secciones principales son accesibles desde la navegación.
- [ ] La navegación funciona en un viewport de celular y en escritorio.
- [ ] No se incluyen secretos ni credenciales en el repositorio.

## Notas técnicas

Seguir el stack propuesto en `Arquitectura_Sistema_Chatarreria.md`. Evitar crear capas o abstracciones que no se usen en el prototipo.
```

### I02 — Crear esquema PostgreSQL y persistencia inicial

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `infra`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Prototipo`  
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

La base prevista es PostgreSQL en Neon. Durante M0 se permite conexión local; no desplegar una instancia pública sin autenticación.
```

### I03 — Gestionar materiales y tarifas

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `feat`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Prototipo`  
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

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `feat`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M0 Prototipo`  
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
- Permitir registrar la compra sin tercero durante el prototipo; la selección de proveedor se completa en M1.

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

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `feat`, `inventario`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `L` · Etapa `M0 Prototipo`  
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

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `feat`, `inventario`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Prototipo`  
**Depende de:** I04, I05

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

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `feat`, `recibo`, `ui`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `M` · Etapa `M0 Prototipo`  
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

### I08 — Preparar demostración del prototipo

**Milestone:** M0 — Prototipo demostrable  
**Labels:** `test`, `docs`  
**Project:** Status `Por hacer` · Prioridad `Alta` · Tamaño `S` · Etapa `M0 Prototipo`  
**Depende de:** I03, I04, I05, I06, I07

**Cuerpo del issue:**

```markdown
## Objetivo

Dejar una ruta de demostración repetible para presentar el prototipo el 30 de septiembre.

## Criterios de aceptación

- [ ] Existe un procedimiento corto para configurar variables y arrancar el prototipo localmente.
- [ ] Hay datos de demostración identificados como ficticios, sin información real del cliente.
- [ ] Se puede demostrar crear material, registrar compra, registrar venta, consultar stock e imprimir recibo.
- [ ] Se verifica la demo en escritorio y en un viewport móvil.
- [ ] Se anotan pendientes y comentarios del cliente para convertirlos en issues separados si cambian el alcance.

## Notas técnicas

No publicar el prototipo en internet sin autenticación. La base local debe usar el mismo esquema que continuará en M1.
```

## Issues M1 — Operación segura

### I09 — Gestionar clientes y proveedores

**Milestone:** M1 — Operación segura  
**Labels:** `feat`, `ui`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Operación`  
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

**Milestone:** M1 — Operación segura  
**Labels:** `feat`, `seguridad`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `L` · Etapa `M1 Operación`  
**Depende de:** I02

**Cuerpo del issue:**

```markdown
## Objetivo

Restringir el acceso al sistema al propietario y, si se requiere, a un segundo administrador autorizado.

## Alcance

- Configurar Better Auth con sesiones seguras y persistencia en PostgreSQL.
- Proteger todas las rutas y acciones que leen o modifican datos del negocio.
- Definir un procedimiento controlado para crear los 1–2 usuarios iniciales; no habilitar registro público.
- Documentar el cierre de sesión y la recuperación de acceso configurada.

## Criterios de aceptación

- [ ] Un visitante no autenticado no puede consultar materiales, operaciones ni inventario.
- [ ] Las acciones de servidor comprueban sesión antes de acceder o modificar datos.
- [ ] El sistema no ofrece registro abierto al público.
- [ ] La sesión se invalida al cerrar sesión.
- [ ] Las claves y secretos se guardan en variables de entorno y no en Git.

## Notas técnicas

Confirmar compatibilidad de Better Auth con la versión del framework y el adaptador PostgreSQL antes de cerrar la implementación.
```

### I11 — Desplegar la aplicación privada

**Milestone:** M1 — Operación segura  
**Labels:** `infra`, `seguridad`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `M` · Etapa `M1 Operación`  
**Depende de:** I09, I10

**Cuerpo del issue:**

```markdown
## Objetivo

Publicar la aplicación para uso del cliente con acceso autenticado y conexión segura a PostgreSQL.

## Alcance

- Verificar las condiciones actuales del plan del proveedor de hosting para uso comercial.
- Configurar variables de entorno de producción fuera del repositorio.
- Configurar el despliegue automático desde la rama acordada.
- Revisar que rutas y acciones privadas no sean accesibles sin sesión.

## Criterios de aceptación

- [ ] La aplicación está disponible mediante HTTPS.
- [ ] Las operaciones de escritura apuntan a la base de producción correcta.
- [ ] Una sesión cerrada no puede consultar ni modificar datos.
- [ ] Las credenciales de producción no aparecen en el bundle del navegador ni en Git.
- [ ] Se documenta cómo desplegar una versión anterior o detener el despliegue ante un incidente.

## Notas técnicas

La arquitectura propone Netlify y Neon. Verificar en el momento del despliegue límites, condiciones comerciales y compatibilidad de Next.js; si no cumplen, registrar decisión y alternativa antes de cambiar.
```

### I12 — Consultar historial y resumen diario

**Milestone:** M1 — Operación segura  
**Labels:** `feat`, `ui`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `M` · Etapa `M1 Operación`  
**Depende de:** I04, I05

**Cuerpo del issue:**

```markdown
## Objetivo

Consultar operaciones por fecha y resumir compras frente a ventas para el día seleccionado.

## Alcance

- Mostrar fecha, consecutivo, tipo, tercero, total y estado.
- Filtrar por fecha o rango de fechas y por tipo de operación.
- Mostrar total comprado, total vendido y cantidad de operaciones para el período.

## Criterios de aceptación

- [ ] Los filtros se aplican en servidor y muestran un estado vacío cuando no hay resultados.
- [ ] Los totales excluyen operaciones anuladas.
- [ ] Los importes se presentan en COP y las fechas usan la zona horaria definida para el negocio.
- [ ] Al abrir una operación se pueden consultar sus líneas y recibo.
```

### I13 — Anular operaciones con trazabilidad

**Milestone:** M1 — Operación segura  
**Labels:** `feat`, `inventario`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `M` · Etapa `M1 Operación`  
**Depende de:** I04, I05, I06, I12

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

## Notas técnicas

Definir y guardar el usuario que anuló la operación si la autenticación ya provee esa información.
```

### I14 — Exportar datos a Excel

**Milestone:** M1 — Operación segura  
**Labels:** `feat`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Operación`  
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

**Milestone:** M1 — Operación segura  
**Labels:** `feat`, `recibo`  
**Project:** Status `Backlog` · Prioridad `Media` · Tamaño `M` · Etapa `M1 Operación`  
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

**Milestone:** M1 — Operación segura  
**Labels:** `infra`, `seguridad`, `test`  
**Project:** Status `Backlog` · Prioridad `Alta` · Tamaño `M` · Etapa `M1 Operación`  
**Depende de:** I11

**Cuerpo del issue:**

```markdown
## Objetivo

Crear una copia recuperable de la base de datos de producción y demostrar que se puede restaurar.

## Alcance

- Automatizar `pg_dump` con una frecuencia diaria compatible con el proveedor.
- Guardar la copia cifrada o en un destino con acceso restringido y retención definida.
- Evitar imprimir secretos en logs de GitHub Actions.
- Documentar y ejecutar una restauración en una base no productiva.

## Criterios de aceptación

- [ ] Se completa una copia de seguridad y se verifica su resultado.
- [ ] Una restauración de prueba recupera materiales y transacciones de muestra.
- [ ] Los secretos están en GitHub Secrets y no en el workflow.
- [ ] Se documentan retención, ubicación, responsable y pasos de restauración.
- [ ] Se define cómo alertar si el respaldo falla.

## Notas técnicas

No considerar suficiente el historial de restauración del plan gratuito. Confirmar cuotas y costos del destino externo antes de activarlo.
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

## Resumen de dependencias y orden sugerido

```text
M0: I01 -> I02 -> I03 -> I04 -> I05 -> I06
                              \-> I07
     I08 valida la demo de I03-I07

M1: I09 depende de I02/I04
    I10 depende de I02 -> I11 depende de I09/I10
    I12 depende de I04/I05 -> I13 depende de I04-I06/I12
    I14 depende de I06/I12
    I15 depende de I07
    I16 depende de I11

M2: I17 -> I18 -> I19 (I19 también requiere I04/I05)

M3: I20 valida los flujos terminados -> I21 capacitación y aceptación
```

## Fuera del alcance de estos milestones

- Facturación electrónica o documento POS electrónico validado por la DIAN.
- Roles diferenciados como cajero y administrador.
- Soporte garantizado para cualquier modelo de báscula o impresión ESC/POS directa.
- Aplicación móvil nativa o modo sin conexión.
- Multiempresa o registro público de negocios.

Estos puntos requieren una decisión y estimación separadas antes de agregarse al alcance.
