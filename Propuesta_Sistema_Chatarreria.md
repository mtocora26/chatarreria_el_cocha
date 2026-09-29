# Propuesta de Servicio — Sistema de Gestión para Chatarrería

**Documento:** Propuesta de Alcance y Acuerdo de Servicio
**Fecha:** 16 de septiembre de 2026
**Cliente:** Jesús Alberto Pacheco
**Desarrollador:** Manuel David Castro

---

## 1. Resumen Ejecutivo

Esta propuesta presenta el desarrollo de un **sistema digital de gestión** para el negocio de compra y venta de chatarra del señor Jesús Alberto Pacheco. El objetivo es reemplazar el control manual (cuadernos, cálculos a mano) por una herramienta sencilla que permita registrar compras, ventas e inventario de materiales de forma rápida, ordenada y accesible desde el celular o el computador.

---

## 2. ¿Qué Incluye la Solución?

### 2.1 Gestión de Materiales y Precios

- Catálogo de tipos de chatarra (Cobre, Hierro, Bronce, Aluminio, etc.).
- Configuración de precios por kilo, diferenciando **Tarifa Minorista** y **Tarifa Mayorista**.

### 2.2 Registro de Compras (Entrada de Material)

- Selección rápida de cliente/proveedor.
- Selección del tipo de material, peso en kilos y tarifa aplicable.
- Cálculo automático del valor a pagar.
- Actualización automática del inventario.

### 2.3 Registro de Ventas (Salida de Material)

- Registro de salidas de material hacia siderúrgicas o compradores mayoristas.
- Descuento automático del stock disponible.

### 2.4 Control de Inventario en Tiempo Real

- Panel sencillo con la cantidad disponible (en kilos) de cada material.

### 2.5 Historial y Resumen Diario

- Vista rápida de las compras y ventas del día.
- Comparativo de total gastado vs. total ingresado.

### 2.6 Recibo Interno tipo POS

- Cada compra o venta genera un **recibo interno** con los datos del negocio, fecha, cliente, materiales, kilos, precio y total.
- Opción de **imprimir** el recibo para entregarlo al cliente o descargarlo en PDF.
- Formato adaptado para impresión en hoja normal o en impresora térmica de recibos (tirilla).

> Este recibo es un comprobante interno del negocio. **No constituye factura electrónica ni documento equivalente electrónico POS validado por la DIAN.**

### 2.7 Respaldo de Información

- Opción de exportar la información de compras, ventas e inventario a un archivo de Excel, para que el negocio siempre tenga una copia de sus datos.

### 2.8 Acceso desde Cualquier Dispositivo

- Aplicación web optimizada para usarse desde el navegador del celular o un computador, sin necesidad de instalar nada desde una tienda de aplicaciones.

### 2.9 Usuarios

- Acceso para 1 o 2 usuarios administradores (por ejemplo, el propietario y un encargado de confianza).

### 2.10 Conexión con Báscula Digital

- Lectura automática del peso desde la báscula digital (conexión serial/USB) con un botón "Tomar peso" al registrar una compra o venta.
- El sistema calcula el valor automáticamente con el peso leído y el precio del material.
- Funciona desde un **computador** conectado a la báscula, usando Google Chrome o Microsoft Edge.
- Siempre se mantiene la opción de escribir el peso manualmente (por ejemplo, desde el celular o si la báscula falla).

> La conexión depende de que la báscula tenga salida de datos (puerto serial RS-232 o USB). Se confirmará con pruebas sobre el equipo real. Si el modelo no lo permite, el peso se seguirá ingresando manualmente.

---

## 3. ¿Qué NO Incluye Esta Versión?

Para que el alcance quede claro desde el inicio:

- **Facturación electrónica / DIAN:** el sistema no genera reportes fiscales, facturas electrónicas ni documentos POS electrónicos validados por la DIAN. Esta funcionalidad podrá evaluarse más adelante como una **fase posterior**, y tendrá un valor adicional que se cotizará por separado una vez se revisen los requisitos.
- **Roles de usuario diferenciados:** todos los usuarios administradores tienen el mismo nivel de acceso (no hay perfiles limitados tipo "cajero").

---

## 4. Cómo Funciona el Acceso al Sistema

El sistema estará disponible en la nube, sin necesidad de un servidor propio ni instalaciones complicadas. Se podrá usar desde cualquier celular o computador con conexión a internet, simplemente entrando desde el navegador.

> El servicio inicial funciona sobre planes gratuitos de almacenamiento en la nube, adecuados para el volumen de uso de un negocio pequeño como este.

---

## 5. Inversión y Forma de Pago

**Valor total del proyecto:** $550.000 COP (incluye el recibo interno tipo POS con opción de impresión)

| Pago           | Momento                                                            | Valor        |
| -------------- | ------------------------------------------------------------------ | ------------ |
| 1er pago (50%) | Al iniciar el desarrollo, firmando la aceptación de esta propuesta | $275.000 COP |
| 2do pago (50%) | Contra entrega, despliegue y capacitación de uso                   | $275.000 COP |

> El primer pago no es reembolsable una vez iniciado el desarrollo.

---

## 6. Soporte Posterior a la Entrega

- Se incluyen **15 días** de ajustes menores sin costo adicional después de la entrega (correcciones de errores, pequeños cambios de funcionamiento).
- Cambios de alcance mayores o nuevas funciones se cotizarán por separado.

---

## 7. Tiempo Estimado de Entrega

El sistema se entregará por etapas para que el negocio pueda empezar a usarlo de inmediato. Todo lo que se registre desde la primera versión **queda guardado** y se conserva en las siguientes.

| Etapa               | Tiempo | Actividad                                                                                                                    |
| ------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Versión inicial** | 2 días | Catálogo de materiales y precios, registro de compras y ventas (peso manual), inventario básico y recibo interno imprimible. |
| **Semana 1–2**      |        | Historial y resumen diario, exportación a Excel, mejoras según el uso real del negocio.                                      |
| **Semana 2–3**      |        | Conexión con la báscula (pruebas con el equipo real), ajustes finales, capacitación y entrega final.                         |

---

## 8. Aceptación de la Propuesta

Al firmar este documento, el cliente acepta el alcance descrito y autoriza el inicio del desarrollo bajo las condiciones aquí establecidas.

|                                        |                               |
| -------------------------------------- | ----------------------------- |
| **Cliente:** Jesús Alberto Pacheco     | Firma: ______________________ |
| **Desarrollador:** Manuel David Castro | Firma: ______________________ |
| **Fecha:**                             | ______________________        |
