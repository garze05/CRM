# 7. Plan de implementación (15 fases)

Cada fase es pequeña, entrega valor verificable y deja `npm run build` + `npm run
lint` en verde. Orden pensado para que el equipo pueda empezar a usar el sistema
desde la fase 6.

---

### Fase 1 — Fundaciones de backend
- **Objetivo:** proyecto conectado a PostgreSQL con auth real.
- **Módulos:** `docker-compose.yml` (Postgres local), deps (`prisma` ya instalado
  en esta rama; faltan `@prisma/client`, `@prisma/adapter-pg`, `tsx`,
  `next-auth@5`, `@auth/prisma-adapter`, `zod`, `date-fns`, `@date-fns/tz`),
  `app/lib/db.ts`, `app/lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`,
  middleware, grupo `(app)/` con sesión, login con Google + allowlist.
- **Riesgos:** fricción Auth.js v5 con Next 16 → fijar versiones exactas.
- **Aceptación:** solo correos de `ALLOWED_EMAILS` entran; el usuario real reemplaza
  al mock del sidebar; `/catalogo` (placeholder) abre sin login.

### Fase 2 — Modelos Prisma y seed
- **Objetivo:** esquema migrado y datos reales mínimos.
- **Módulos:** `prisma migrate dev` con [`schema.prisma`](../../prisma/schema.prisma),
  migración manual con [`partial-unique-indexes.sql`](../../prisma/sql/partial-unique-indexes.sql),
  extensión soft delete en `db.ts`, `seed.ts` (Settings + catálogo desde CSV de
  Sheets), `seed.ts --historical` (clientes/eventos de Excel limpios).
- **Riesgos:** calidad de los Excel históricos → validar teléfonos al importar y
  reportar rechazos a un CSV de errores.
- **Aceptación:** `prisma studio` muestra catálogo real; clientes históricos con
  E.164 válido; recrear un cliente borrado no choca con el índice de teléfono.

### Fase 3 — Tablas de gestión con filtros
- **Objetivo:** `DataTable` (TanStack v8) con el look actual.
- **Módulos:** `app/components/data-table/` (tabla, `ColumnFilterPopover`, filtro
  global, estados vacíos, persistencia URL+localStorage); commitear antes el
  refactor `PageHeader`/`DecorativePageIcon` pendiente en working tree.
- **Riesgos:** sobre-ingeniería → solo orden + filtro por valores + búsqueda.
- **Aceptación:** en una lista demo se ordena por header, se filtra por valores
  estilo Excel, el estado sobrevive recarga y el diseño es indistinguible del actual.

### Fase 4 — Teléfonos y datos normalizados
- **Objetivo:** `PhoneInput` (país+bandera+formateo) y validación Zod compartida.
- **Módulos:** `app/components/phone-input.tsx`, `app/lib/validation/`
  (client, event, quote…), helpers E.164.
- **Aceptación:** escribir "88887777" con CR produce `+50688887777` / `8888 7777`;
  números inválidos muestran error en español.

### Fase 5 — Clientes y eventos reales (CRUD)
- **Objetivo:** primeras pantallas 100% funcionales contra BD.
- **Módulos:** `app/lib/server/clients.ts`, `events.ts`, server actions, listas con
  `DataTable`, altas/ediciones con validación, **detección de teléfono existente**,
  detalle de cliente con historial + interacciones + notas, detalle de evento con
  cambio de etapa validado (`funnel.ts`), `audit.ts` + `numbering.ts`.
- **Riesgos:** es la fase más grande — dividir en 5a (clientes) y 5b (eventos).
- **Aceptación:** flujo Prospecto→Contactado completo con datos reales; duplicar
  teléfono es imposible; cada acción aparece en `audit_logs`; mock-data deja de
  usarse en estas rutas.

### Fase 6 — Dashboard
- **Objetivo:** dashboard operativo con datos reales.
- **Módulos:** `FunnelBoard`, consultas agregadas (`getDashboardMetrics`),
  `TaskList` (lee tareas reales), `ActivityFeed`, próximos eventos.
- **Aceptación:** conteos del embudo clicables filtran `/eventos`; métricas del mes
  correctas contra una verificación manual en BD.

### Fase 7 — Calendario de eventos
- **Objetivo:** vista calendario (mes/semana/día) con tarjetas operativas.
- **Módulos:** `app/components/calendar/` (`CalendarMonth/Week/Day`, `EventCard`,
  `SeasonBand`), `domain/seasons.ts`, switch tabla⇄calendario por query param.
- **Riesgos:** alcance de la tarjeta → fijar el orden de campos del doc 02 §2.5 y
  no iterar estética en esta fase.
- **Aceptación:** las 3 pestañas navegan por rangos en zona CR; tarjeta muestra los
  10 datos operativos; días festivos con banda; eventos sin hora van a sección
  "Sin hora definida".

### Fase 8 — Cotizaciones
- **Objetivo:** flujo completo borrador→PDF→enviada.
- **Módulos:** `domain/pricing.ts` (puro, con tests), `integrations/google-maps.ts`,
  `integrations/quote-document.ts` (puente subprocess), `server/quotes.ts`,
  workflow de 4 pasos funcional, historial por evento.
- **Riesgos:** entorno Python/LibreOffice → health-check en `/ajustes` desde el
  inicio de la fase; transporte degrada a precio base con advertencia visible.
- **Aceptación:** una cotización real genera PDF con `COT-2026-NNNN`, queda
  `SENT` única activa (enviar otra expira la anterior), totales idénticos a los del
  bot ante el mismo input (caso de prueba comparativo).

### Fase 9 — Reservaciones y pagos
- **Objetivo:** aceptar cotización → reservación → pagos → confirmado.
- **Módulos:** `server/reservations.ts` (`acceptQuote`, `registerPayment`),
  `PaymentTimeline`, detalle de reservación, PDF de reservación (mismo puente).
- **Aceptación:** aceptar cotización crea RES- y mueve el evento a RESERVADO;
  registrar anticipo ≥50% mueve a CONFIRMADO; fechas límite calculadas (evento−14d).

### Fase 10 — Colaboradores y calificaciones
- **Objetivo:** asignaciones con disponibilidad, notas y ★ por evento.
- **Módulos:** `server/collaborators.ts`, `conflicts.ts` (solapes), `StarRating`,
  perfil de colaborador (próximos/pasados/comentarios/promedio), asignación desde
  el detalle de evento con advertencia de conflicto.
- **Aceptación:** asignar al mismo colaborador a dos eventos CONFIRMADOS solapados
  es imposible; promedio se recalcula al calificar; sin calificaciones → "Sin
  calificación".

### Fase 11 — Inventario y creador de paquetes
- **Objetivo:** CRUD paquetes/servicios + composición desde catálogo.
- **Módulos:** pestañas de `/inventario`, creador de paquetes dos-columnas,
  validación de paquete completo, integración con `pricing.ts`.
- **Aceptación:** un paquete creado aparece en el paso 3 de cotización con el precio
  del tipo de cliente correcto; no se puede guardar paquete sin líneas o sin precios.

### Fase 12 — Catálogo público
- **Objetivo:** `/catalogo` compartible sin login.
- **Módulos:** layout público, grid con filtros por categoría/tags, gestión de
  imágenes (subida a `storage/`), botón de WhatsApp.
- **Riesgos:** decidir con negocio si muestra precios (default: no).
- **Aceptación:** la URL abre sin sesión en móvil, solo ítems `active`, imágenes
  optimizadas con `next/image`.

### Fase 13 — Tareas, recordatorios y auditoría visible
- **Objetivo:** motor de tareas automáticas + pantalla `/tareas`.
- **Módulos:** `domain/reminders.ts` (reglas puras con tests), jobs
  `/api/jobs/reminders` y `/api/jobs/expirations`, `/tareas` con `DataTable`,
  pestaña "Actividad" en detalles.
- **Aceptación:** correr el job dos veces no duplica tareas (`autoKey`); una quote
  `SENT` de hace 25h genera el seguimiento; registrar interacción lo cierra;
  cotización vencida pasa a `EXPIRED` sola.

### Fase 14 — Pulido UX
- **Objetivo:** consistencia total.
- **Módulos:** `loading.tsx`/`error.tsx` en todas las rutas, estados vacíos con CTA,
  toasts, revisión móvil (tablas→tarjetas), revisión de textos en español,
  íconos siempre con etiqueta, mensajes sugeridos de WhatsApp en seguimientos.
- **Aceptación:** recorrido completo del embudo en móvil sin pantalla rota ni texto
  en inglés.

### Fase 15 — Pruebas y validación
- **Objetivo:** confianza para operar el negocio real.
- **Módulos:** tests unitarios de dominio (funnel, pricing, reminders, conflicts —
  vitest), test de integración del puente Python (golden file contra un JSON del
  bot), smoke E2E del flujo feliz (Playwright opcional), checklist de UAT con el
  equipo de OkiDoki usando datos reales migrados.
- **Aceptación:** suite verde en CI; el equipo completa un ciclo real
  prospecto→pago sin asistencia; los totales de 3 cotizaciones históricas
  coinciden con los del bot.

---

**Dependencias entre fases:** 1→2→(3,4 en paralelo)→5→6; 7 tras 5; 8 tras 5 y 11
parcial (servicios pueden cotizarse sin paquetes); 9 tras 8; 10, 12, 13 tras 5;
14–15 al final. Con un solo desarrollador: orden listado.
