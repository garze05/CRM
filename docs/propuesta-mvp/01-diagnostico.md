# 1. Diagnóstico del estado actual

## 1.1 Resumen

El repositorio contiene un **prototipo de frontend completo y visualmente maduro,
pero 100% estático**: no hay base de datos, ni Prisma, ni autenticación, ni un solo
handler de formulario. Todos los datos provienen de
[`app/lib/mock-data.ts`](../../app/lib/mock-data.ts) (398 líneas). Es una base
excelente para el rediseño: el lenguaje visual, la navegación y las convenciones
ya existen; lo que falta es la capa de datos y los flujos operativos.

## 1.2 Estructura de rutas

| Ruta | Tipo | Estado |
|------|------|--------|
| `/` | Dashboard | Embudo, KPIs, tareas y calendario compacto — todo mock |
| `/clientes`, `/eventos`, `/cotizaciones`, `/colaboradores`, `/inventario` | Listas | `ManagementTable` + `ListFilters` (filtros sin lógica) |
| `/reservaciones` | Lista derivada | Sintetiza números RES-/montos al vuelo desde eventos |
| `/*/[id]` | Detalle | Formularios sin submit, `notFound()` correcto |
| `/*/nuevo` | Alta | Formularios sin submit ni validación |
| `/cotizaciones/nueva` | Workflow | Indicador de 4 pasos, sin lógica de avance |
| `/papeleria` | Soft delete | Pantalla de restauración (mock) — concepto correcto |
| `/ajustes` | Configuración | Campos de negocio + placeholders de integraciones |

## 1.3 Lo que ya funciona y se conserva

- **Shell de navegación** ([`crm-shell.tsx`](../../app/components/crm-shell.tsx)):
  sidebar agrupado (Gestión / Métricas), usuario, navegación móvil inferior,
  búsqueda global sticky. Estructura correcta; solo se reorganizan ítems.
- **Sistema de diseño implícito** ([`globals.css`](../../app/globals.css)):
  tokens CSS completos (paleta cálida naranja/teja + teal), Plus Jakarta Sans,
  base 16px+, modo oscuro preparado, controles de formulario de 3.5rem.
  Cumple los principios de tipografía grande y claridad.
- **Convención ícono + etiqueta** respetada en toda la UI (Iconify material-symbols).
- **Componentes reutilizables**: `ManagementTable`, `StatusBadge` (30+ estados
  mapeados), `MetricCard`, `SectionCard`, `PageHeader` + `Breadcrumb` (refactor en
  curso, sin commitear), `PhotoThumbnailControl`, `EntityThumbnail`.
- **UI en español, código en inglés**, formato `es-CR` con zona `America/Costa_Rica`
  ya aplicado en `formatCrc`/`formatDate`.
- **Papelería** como metáfora de soft delete — alineada con la convención `deleted_at`.

## 1.4 Lo que estorba o debe rediseñarse

- **`ListFilters` es decorativo** ([`list-filters.tsx`](../../app/components/list-filters.tsx)):
  inputs sin handlers. Se reemplaza por tabla headless con filtros reales (TanStack).
- **`ManagementTable` no ordena ni filtra** ([`management-table.tsx`](../../app/components/management-table.tsx)):
  se conserva el diseño visual, se reemplaza el motor.
- **Cotizaciones derivadas de eventos** (`mock-data.ts:325-344`): las cotizaciones
  deben ser entidad de primera clase con historial.
- **`/reservaciones` sintetiza datos** (números, anticipos) en el componente de página:
  esa lógica pertenece al dominio/BD.
- **Estado de embudo duplicado** en Cliente y Evento en el mock. El embudo pertenece
  al evento; el cliente solo deriva "recurrente". Hay que corregirlo al conectar datos.
- **Ítems "Métricas → General/Ventas" del sidebar apuntan a `/`** (placeholder).
- **`Inventario` mezcla dos conceptos**: catálogo visual (personajes/inflables) y
  oferta comercial (paquetes/servicios). Se separan: Catálogo (imágenes, vista
  pública) e Inventario comercial (paquetes + servicios + creador de paquetes).
- **Fotos solo en memoria** (`FileReader` → data URL, sin subida).

## 1.5 Lo que falta para cubrir el MVP

Sin ruta ni componente alguno:

1. **Calendario de eventos** (mensual/semanal/diario) — requisito obligatorio.
2. **Tareas** — solo 3 tareas mock en el dashboard; no hay CRUD ni modelo.
3. **Catálogo público** sin login.
4. **Creador de paquetes** (no existe el concepto de paquete en el mock).
5. **Perfil de colaborador** con historial, notas y calificaciones por evento.
6. **Flujo real de cotización** → PDF → aceptación → reservación.
7. **Registro de pagos** (anticipo/saldo) con fechas límite.
8. **Auditoría / actividad reciente**.
9. **Interacciones** (registro manual de WhatsApp/llamadas).
10. **Backend completo**: Prisma, Auth.js/Google, server actions, jobs de recordatorios.

## 1.6 CorrespondencyBot (referencia de integración)

El bot de cotizaciones ([`cotizador_okidoki.py`](../../../CorrespondencyBot/cotizador_okidoki.py),
[`generar_documento.py`](../../../CorrespondencyBot/generar_documento.py)) ya tiene una
costura perfecta para integrarse: **un contrato JSON intermedio**
(`output/cotizacion_output.json`) que separa el cálculo (Sheets + Maps + descuentos)
del render del documento (docxtpl + `Plantilla.docx` + LibreOffice→PDF).

Puntos clave detectados:

- Cálculo de transporte: Routes API v2, origen fijo "Heredia Canton Central Ulloa",
  ₡400/km después de 15 km libres, base ₡5.000, fallback silencioso a precio base.
- Reglas de descuento en hoja `REGLAS_DESCUENTO`: 15% por cantidad, 15% por ≥2h,
  tope acumulado 30%, recargo por tipo de cliente (escolar 5%, empresa 10%...).
- Numeración del bot (`C1503-26107` = tipo + DDMM del evento + sufijo): el negocio
  decidió conservar este formato con consecutivo anual desde 100 (`C1503-101`).
  `generar_documento.py` toma el `codigo` del JSON → el CRM lo genera **sin tocar
  el Python**.
- IVA 13% opcional (`--invoice`), reparto 50/50 anticipo/saldo ya implementado.
- PDF requiere LibreOffice instalado en el servidor.

## 1.7 Riesgos técnicos visibles

| Riesgo | Detalle | Mitigación |
|--------|---------|------------|
| **Spec vs. realidad del stack** | AGENTS.md exige Next 14; el repo usa Next 16.2.7 + React 19 + Tailwind 4 | No degradar; actualizar la spec (decisión de negocio, ver doc 08) |
| Formularios no controlados sin validación | Todo `defaultValue`, sin errores ni loading | Server Actions + Zod + `useActionState` |
| Enums UI hardcodeados en `StatusBadge` y selects | Se desincronizarán de la BD | Fuente única en `app/lib/domain/` (ya iniciado con `funnel.ts`) |
| Unicidad de teléfono vs. soft delete | `@unique` simple bloquearía recrear clientes en papelería | Índice único parcial `WHERE deleted_at IS NULL` (SQL crudo incluido) |
| PDF depende de LibreOffice | Falla silenciosa si no está instalado | Health-check en `/ajustes` + error visible al generar |
| Subida de fotos sin destino | `FileReader` local | Almacenamiento local en `storage/` en MVP; S3/Cloudinary después |
| Cambios sin commitear | Refactor `PageHeader`/`DecorativePageIcon` en working tree | Commitear ese refactor antes de la fase 3 |
