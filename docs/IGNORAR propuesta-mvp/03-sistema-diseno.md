# 3. Sistema de diseño UI

El prototipo ya define un lenguaje visual correcto (cálido, profesional, legible).
Este documento lo formaliza y lo completa; **no se cambia la paleta existente**.

## 3.1 Paleta (tokens existentes en `app/globals.css` — se conservan)

| Token | Valor | Uso |
|-------|-------|-----|
| `--primary-color` | `#a64600` (teja) | Títulos, acciones primarias |
| `--secondary-color` | `#007c73` (teal) | Acciones secundarias, éxito |
| `--accent-color` | `#ff8c42` (naranja) | Navegación activa, focos |
| `--tertiary-color` | `#ffd166` (amarillo) | Resaltados, temporadas festivas |
| `--background/surface/card` | crema `#f7f5ef → #fffefa` | Fondos por capas |
| `--error-color` | `#c91d2b` | Errores, alertas de vencimiento |
| `--warning-color` | `#8a6b00` | Advertencias (conflictos, vigencia) |

Adiciones propuestas (mismo archivo):

```css
--stage-prospect: #927d72;   --stage-contacted: #4ecdc4;
--stage-quoted: #ffd166;     --stage-reserved: #ff8c42;
--stage-confirmed: #007c73;  --stage-completed: #a64600;
--stage-canceled: #c91d2b;   --season-band: color-mix(in srgb, var(--tertiary-color) 12%, transparent);
```

(`StatusBadge` ya mapea colores por estado; mover ese mapa a tokens permite que
calendario, embudo y badges compartan color por etapa.)

## 3.2 Tipografía y espaciado

- **Plus Jakarta Sans** (actual). Body ≥16px (`1rem`), labels de formulario
  `1.125rem/700`, valores de métricas `text-3xl/900`, `page-heading` con clamp
  actual. No introducir tamaños <14px salvo metadatos de tarjetas.
- Escala de espaciado Tailwind estándar; padding interior de tarjetas `p-5/p-6`;
  separación entre secciones `space-y-8`.
- Áreas táctiles ≥44px (los controles actuales de 3.5rem ya lo cumplen).

## 3.3 Componentes reutilizables (inventario objetivo)

**Existentes que se conservan tal cual:** `SectionCard`, `MetricCard`, `PageHeader`
(+ `DecorativePageIcon`), `Breadcrumb`, `StatusBadge` (refactor a tokens),
`EntityThumbnail`, `PhotoThumbnailControl`, `IconLabel`, `DeleteAction`.

**Nuevos necesarios:**

| Componente | Propósito |
|------------|-----------|
| `DataTable` | Envuelve TanStack Table con el look de `ManagementTable`: orden por header, filtro por columna (popover estilo Excel con valores facetados + búsqueda), filtro global, estados vacíos, persistencia en URL |
| `ColumnFilterPopover` | Menú por encabezado: ordenar A-Z/Z-A, lista de valores con checkboxes, limpiar filtro |
| `PhoneInput` | País + bandera + formateo en vivo; emite `{e164, country, formatted}` |
| `StarRating` | 1–5 ★ accesible (radiogroup); modo lectura y edición; "Sin calificación" |
| `FunnelBoard` | Embudo horizontal con conteos y montos, clicable |
| `CalendarMonth` / `CalendarWeek` / `CalendarDay` | Vistas del calendario propio |
| `EventCard` | Tarjeta operativa (variantes: compacta para mes, completa para semana/día) |
| `SeasonBand` | Banda de temporada festiva |
| `TaskItem` / `TaskList` | Tarea con checkbox, vencimiento, chip de entidad |
| `ActivityFeed` | Lista de entradas de auditoría humanizadas |
| `PaymentTimeline` | Línea de pagos de una reservación |
| `EntityPicker` | Buscador con dropdown para cliente/personaje/colaborador |
| `ConfirmDialog` | Confirmaciones destructivas (enviar a papelería) |
| `Toast` | Feedback de server actions (éxito/error) en español |
| `FormField` | Label + control + mensaje de error de Zod |

## 3.4 Patrones obligatorios

- **Ícono + etiqueta siempre** (ya cumplido): todo botón usa `IconLabel`; prohibido
  ícono solo. Tooltips solo como complemento.
- **Badges de estado**: pastilla redondeada, fondo al 15%, texto del color pleno,
  texto en español desde `FUNNEL_STAGE_LABELS` y mapas equivalentes (nunca el enum
  crudo en pantalla).
- **Formularios**: server actions + `useActionState`; errores bajo el campo en
  español; botón con estado de carga ("Guardando…"); éxito → toast + redirect.
- **Estados vacíos**: ilustración ligera (ícono decorativo existente), frase en
  español, CTA directa. Nunca tabla vacía sin explicación.
- **Carga**: `loading.tsx` por ruta con skeletons de tarjeta/tabla.
- **Errores**: `error.tsx` por ruta con mensaje amable + botón reintentar.
- **Responsive**: sidebar ≥lg, nav inferior <lg (actual). El calendario mes en móvil
  colapsa a lista de días con eventos; las tablas priorizan columnas clave y
  ofrecen tarjetas apiladas en <md.
- **Teléfonos**: siempre mostrados formateados (`8888 7777`) con acción
  `wa.me/+506...` (abre WhatsApp) — refuerza el canal principal del negocio.
- **Moneda**: `formatCrc` existente; referencia USD entre paréntesis y atenuada:
  "₡185.000 *(≈ $356)*".
