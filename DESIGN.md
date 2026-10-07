---
name: Chatarrería El Cocha
description: Herramienta de mostrador sobria en verde bosque y oro, hecha para leer cifras y registrar rápido.
colors:
  marca-950: "#172420"
  marca-900: "#24342e"
  marca-800: "#2f443c"
  marca-700: "#3d584d"
  marca-600: "#567266"
  marca-100: "#e3e9e5"
  marca-50: "#f1f4f2"
  oro-600: "#b8892f"
  oro-500: "#d7a747"
  oro-100: "#f6ecd6"
  fondo: "#f5f4ef"
  superficie: "#ffffff"
  texto: "#1c1917"
  texto-secundario: "#44403c"
  texto-suave: "#78716c"
  borde: "#d6d3d1"
  borde-tarjeta: "#e7e5e4"
  peligro: "#b91c1c"
  peligro-hover: "#991b1b"
  peligro-fondo: "#fef2f2"
  exito-fondo: "#f0fdf4"
  exito-texto: "#14532d"
typography:
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.marca-900}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.marca-800}"
  button-secondary:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-secundario}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.peligro}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    height: "44px"
  input:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.superficie}"
    rounded: "{rounded.xl}"
  nav-item-active:
    backgroundColor: "{colors.oro-500}"
    textColor: "{colors.marca-950}"
    rounded: "{rounded.lg}"
---

# Design System: Chatarrería El Cocha

## Overview

**Creative North Star: "La Báscula Confiable"**

Una herramienta de mostrador: sobria, legible, sin adornos. Todo gira en torno a que una cifra (kilos, precio, total, saldo) se lea de un vistazo y se registre en pocos toques. El verde bosque profundo da seriedad de oficio; el oro aparece como sello y marca de lo activo, nunca como decoración.

La densidad es media y cómoda: tarjetas blancas sobre un fondo hueso cálido, texto grande donde se toca y se lee, y poco más. La personalidad vive en detalles precisos (el ícono, la navegación activa en oro, el foco dorado), no en efectos.

**Key Characteristics:**
- Verde bosque + oro sobre fondo hueso cálido; neutros tipo piedra.
- Plano con sombra mínima: borde fino y `shadow-sm`.
- Objetivos táctiles de 44 px; pensado para celular y mostrador.
- Una sola familia tipográfica (Geist); jerarquía por tamaño y peso.
- Español directo, sin jerga.

## Colors

Paleta de dos acentos contenidos (verde de marca y oro) sobre neutros cálidos; el rojo y el verde claro solo comunican estado.

### Primary
- **Verde Bosque de Patio** (#24342e, `marca-900`): encabezado, botón primario, texto activo en la barra inferior. Escala de apoyo: `marca-950` #172420 (texto sobre oro), `marca-800` #2f443c (hover), `marca-700` #3d584d (enlaces), `marca-600` #567266 (borde de foco), `marca-100` #e3e9e5 y `marca-50` #f1f4f2 (texto/fondo suave sobre o junto al verde).

### Secondary
- **Oro de Sello** (#d7a747, `oro-500`): elemento activo en la navegación y anillo de foco (`oro-500`). `oro-600` #b8892f para oro más oscuro; `oro-100` #f6ecd6 como fondo del ícono activo en móvil.

### Neutral
- **Hueso Cálido** (#f5f4ef, `fondo`): fondo de la aplicación.
- **Superficie Blanca** (#ffffff): tarjetas, campos, barra inferior.
- **Tinta Piedra** (#1c1917 / #44403c / #78716c): texto principal, secundario y de ayuda.
- **Borde Piedra** (#d6d3d1 controles, #e7e5e4 tarjetas): contornos finos.

### Estado
- **Rojo Alerta** (#b91c1c, hover #991b1b, fondo #fef2f2): acciones destructivas y errores.
- **Verde Confirmación** (fondo #f0fdf4, texto #14532d): avisos de éxito.

### Named Rules
**The Oro Es Sello Rule.** El oro marca lo activo o enfocado (navegación, foco). No se usa como relleno de botones ni como decoración.

**The Rojo Solo Para Peligro Rule.** El rojo se reserva a errores y acciones destructivas.

## Typography

**Display/Body/Label Font:** Geist (con ui-sans-serif, system-ui, sans-serif)

**Character:** Una sola sans neutral y moderna; la jerarquía se construye con tamaño y peso, no con pares tipográficos.

### Hierarchy
- **Headline** (700, 1.875rem en ≥sm / 1.5rem móvil, 1.2): título de página.
- **Title** (700, 1.5rem): títulos de sección.
- **Body** (400, 0.875rem; 1rem en campos móviles, 1.43): contenido y tablas.
- **Label** (500, 0.875rem): etiquetas de campo, botones (600), navegación. Texto de ayuda en 0.75rem; navegación inferior en 11px.

### Named Rules
**The 16px En Campos Rule.** Los controles de formulario usan 16px en móvil (evita el zoom de iOS) y 14px desde `sm`.

## Layout

Contenedor central de ancho máximo 64rem (`max-w-5xl`) con gutter de 16px. Encabezado fijo superior (mín. 56px); en móvil la navegación pasa a una barra inferior fija de 64px con ícono y rótulo, con espacio extra (`pb-24`) para que no tape el contenido. Desde `sm` la navegación vuelve al encabezado. Ritmo vertical en múltiplos de 4/8px (gaps de 4–24px). Impresión: ancho completo, fondo blanco, sin encabezado ni navegación, tamaño carta.

## Elevation & Depth

Plano por defecto. La profundidad se logra con borde fino y, como mucho, `shadow-sm` en tarjetas, campos y botones llenos; el encabezado lleva `shadow-sm`. No hay capas con sombras pesadas ni blur.

### Named Rules
**The Plano Con Sombra Mínima Rule.** Nada supera `shadow-sm` en reposo.

## Shapes

Esquinas suaves y consistentes: 8px (`rounded-lg`) en botones, campos y elementos de navegación; 12px (`rounded-xl`) en tarjetas; píldora completa en insignias y en el indicador activo de la barra inferior; 6px en avisos. Bordes de 1px en piedra.

## Components

### Buttons
- **Shape:** esquinas suaves (8px), alto mínimo 44px, texto 14px semibold.
- **Primary:** verde bosque (#24342e) con texto blanco; hover verde más claro (#2f443c).
- **Secondary:** blanco, borde piedra, texto gris oscuro; hover gris muy claro.
- **Danger:** rojo sólido (#b91c1c) o variante secundaria con borde rojo.
- **Focus:** anillo de 2px oro con separación de 2px; deshabilitado al 60% de opacidad.

### Inputs / Fields
- **Style:** blanco, borde piedra, 8px, alto mínimo 44px, sombra mínima.
- **Focus:** borde verde (`marca-600`) y anillo oro al 40%.
- **Error:** borde rojo, mensaje en rojo bajo el campo asociado por `aria-describedby`; ayuda en gris 12px.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** blanco con borde `stone-200` y `shadow-sm`.

### Navigation
- **Superior (≥sm):** elementos en el encabezado verde; activo en oro con texto `marca-950`; hover sobre `marca-800`.
- **Inferior (móvil):** barra blanca con borde superior, ícono de trazo de 24px y rótulo de 11px; activo con píldora oro suave y texto verde. Respeta el área segura del dispositivo.

### Avisos e insignias
Avisos con borde y fondo claros (verde éxito, rojo error), `role="status"` o `role="alert"`. Insignias en píldora, 12px semibold.

## Do's and Don'ts

### Do:
- **Do** mantener 44px de alto mínimo en todo lo que se toca.
- **Do** usar el verde de marca para la acción principal y el oro solo para estado activo y foco.
- **Do** usar el color de borde y `shadow-sm` para separar superficies.
- **Do** mostrar cifras con claridad y jerarquía de tamaño/peso.
- **Do** reutilizar las clases compartidas de `src/shared/ui/estilos.ts`.

### Don't:
- **Don't** usar rojo para nada que no sea error o acción destructiva.
- **Don't** rellenar botones o fondos grandes de oro.
- **Don't** añadir sombras mayores a `shadow-sm` ni efectos de desenfoque.
- **Don't** introducir una segunda familia tipográfica sin una razón del producto.
- **Don't** reducir campos móviles por debajo de 16px de texto.
