# 4. Evaluación de librerías clave

Criterios: MIT/gratuito sin features bloqueadas, compatible con React 19/Next 16,
personalizable con Tailwind 4 + tokens propios, tamaño razonable, sin pelear contra
los requisitos no estándar (tarjetas operativas ricas, bandas de temporada).

## 4.1 Calendario

| Opción | Pros | Contras | Riesgo de pago |
|--------|------|---------|----------------|
| **FullCalendar v6** | Maduro; las 3 vistas requeridas (dayGrid/timeGrid) están en plugins MIT; `eventContent` acepta nodos React | CSS propio difícil de alinear con los tokens; bundle grande; las tarjetas ricas no caben en sus slots de mes; React wrapper con fricción en React 19 | **Sí**: vistas de recursos/timeline (carriles por colaborador, lo que más serviría para conflictos) son **FullCalendar Premium** (licencia comercial) |
| **React Big Calendar** | MIT completo; `components.event` personalizable | Estética anticuada (CSS global a sobrescribir), API de fechas vía localizer, mantenimiento lento, sin concepto de "bandas" de días | No |
| **Schedule-X** | Moderno, theming decente | Núcleo libre pero varias features en plan de pago; ecosistema joven | **Sí** (plugins premium) |
| **Propio sobre `date-fns`** | Control total de tarjetas, bandas de temporada, colores por etapa y conflictos; cero CSS ajeno; trivial de mantener para 3 vistas sin drag-and-drop | Hay que escribir la cuadrícula del mes (~1 componente) y la lógica de rangos (~100 líneas con date-fns) | No |

**Recomendación: calendario propio con `date-fns` (+ `@date-fns/tz` para
America/Costa_Rica).** Justificación: los requisitos duros del MVP (tarjetas con
~10 datos operativos, separación visual de temporadas, paridad visual con el design
system, español) son exactamente lo que las librerías hacen difícil, mientras que lo
que las librerías regalan (rejilla horaria, drag-and-drop, resize) **no está en el
MVP**. La vista mes es una cuadrícula CSS; semana/día son listas ordenadas. La
integración futura con Google Calendar es un problema de **datos** (campos de sync ya
en el modelo), no de UI.
**Disparador para migrar a FullCalendar:** si post-MVP se necesita reprogramar
arrastrando o carriles por colaborador (eso implicaría Premium — presupuestarlo).

## 4.2 Tablas

| Opción | Evaluación |
|--------|------------|
| **TanStack Table v8** | Headless (el look actual de `ManagementTable` se conserva), MIT, orden + filtros por columna + facetas (`getFacetedUniqueValues` → filtro estilo Excel con checkboxes de valores) + filtro global, TypeScript de primera |
| AG Grid | Filtros Excel nativos, pero el set completo es Enterprise (pago) y el estilo es ajeno |
| Material React Table | Arrastra MUI completo — choca con el design system |

**Recomendación: TanStack Table v8** envuelto en un `DataTable` propio. Persistir
estado de filtros/orden en query params (compartible) y `localStorage` por usuario
(preferencia "preferiblemente persistente" del MVP, barato de lograr).
Server-side: para volúmenes del negocio (cientos de filas) basta filtrado client-side
con carga completa por entidad; búsqueda global de eventos por relaciones
(teléfono/personaje) sí va al servidor.

## 4.3 Teléfono con país, bandera y formateo

| Opción | Evaluación |
|--------|------------|
| **react-phone-number-input** | MIT, usa `libphonenumber-js`, selector de país con banderas, formateo as-you-type, valor E.164, props para país default (CR) y etiquetas en español |
| react-international-phone | MIT, similar, menos adoptada |
| Solo `libphonenumber-js` + select propio | Más control, más trabajo (banderas, lista de países en español) |

**Recomendación: `react-phone-number-input` + `libphonenumber-js`**, con país
default `CR`, etiquetas de país en español (`labels` es) y estilos propios para
cumplir el tamaño de controles del design system. Guardar `{phone: E.164,
phoneCountry, phoneFormatted}` (los tres campos ya existen en el schema).
`libphonenumber-js` también valida en el servidor (Zod `.refine`).

## 4.4 Calificación con estrellas

**Recomendación: componente propio `StarRating`** (~60 líneas): `radiogroup` con 5
radios visualmente ocultos + estrellas SVG/Iconify, navegable por teclado, etiqueta
"Calificación: 3 de 5", estado "Sin calificación" cuando es null. Ninguna dependencia
justifica su peso para esto, y la accesibilidad queda bajo control.

## 4.5 Otras dependencias del MVP

| Necesidad | Recomendación |
|-----------|---------------|
| Validación | **Zod** (cliente + server actions) |
| Fechas | **date-fns v4 + @date-fns/tz** (UTC en BD, render en America/Costa_Rica) |
| ORM | **Prisma** (definido) |
| Auth | **next-auth v5 (Auth.js) + @auth/prisma-adapter** con Google |
| CSV para seeds | **csv-parse** |
| Nada de | Redux/Zustand (server components + URL state bastan), librerías de UI completas (MUI/AntD), moment.js |
