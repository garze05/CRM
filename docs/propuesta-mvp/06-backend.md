# 6. Backend listo para el MVP

## 6.1 Estructura de carpetas objetivo

```
app/
  (app)/                      # grupo autenticado: rutas actuales se mueven aquí
    layout.tsx                # CrmShell + sesión
    clientes/ eventos/ cotizaciones/ reservaciones/
    colaboradores/ inventario/ catalogo-admin/ tareas/ papeleria/ ajustes/
  catalogo/                   # vista pública sin login (layout propio)
  api/
    auth/[...nextauth]/route.ts
    jobs/reminders/route.ts   # POST protegido por CRON_SECRET
    jobs/expirations/route.ts
  lib/
    domain/                   # lógica pura, testeable sin BD
      funnel.ts               # ✅ ya creado
      pricing.ts              # cálculo de cotización (líneas, descuentos, IVA)
      reminders.ts            # reglas de tareas automáticas (puras)
      conflicts.ts            # solapes de recursos
      seasons.ts              # temporadas festivas
    server/                   # servicios con Prisma (solo import desde server)
      clients.ts events.ts quotes.ts reservations.ts
      collaborators.ts tasks.ts notes.ts audit.ts numbering.ts
    integrations/
      quote-document.ts       # puente con CorrespondencyBot
      google-maps.ts          # cálculo de transporte (Routes API v2)
    validation/               # esquemas Zod compartidos cliente/servidor
    db.ts                     # PrismaClient singleton + extensión soft delete
    auth.ts                   # config Auth.js + allowlist de correos
  generated/prisma/           # cliente generado por Prisma 7 (gitignored)
prisma/
  schema.prisma               # ✅ ya creado
  sql/partial-unique-indexes.sql  # ✅ ya creado
  seed.ts
  seed-data/                  # CSVs limpios (no commitear datos reales sensibles)
prisma.config.ts              # ✅ ya creado — conexión para la CLI (Prisma 7)
storage/documents/            # PDFs/DOCX generados (gitignored)
```

> **Prisma 7** (verificado con la CLI 7.8): la URL de conexión ya no va en el
> schema; la CLI la lee de `prisma.config.ts` y el runtime instancia
> `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })` con
> `@prisma/adapter-pg`. El generador es `prisma-client` con salida en
> `app/generated/prisma`.

## 6.2 Modelo de datos

Ver [`prisma/schema.prisma`](../../prisma/schema.prisma) — completo en esta rama.
Resumen: 24 modelos / 16 enums. Decisiones notables:

- `FunnelStage` en `Event`; `Client.isRecurring` cacheado.
- `Quote.lineItems Json` congela el detalle calculado (trazabilidad + re-render).
- `Payment` separado de `Reservation` (historial de pagos real).
- `Task.autoKey @unique` → idempotencia de recordatorios.
- `Note`, `Interaction`, `AuditLog` como bitácoras transversales.
- `DocumentCounter(type, year)` para `COT-2026-NNNN` / `RES-2026-NNNN`.
- `Settings` fila única editable desde `/ajustes` (vigencia, % anticipo, tarifas de
  transporte, IVA) — los valores actuales del Python quedan como defaults.
- Índices únicos parciales y CHECKs en
  [`prisma/sql/partial-unique-indexes.sql`](../../prisma/sql/partial-unique-indexes.sql).

**Soft delete**: extensión de Prisma (`$extends`) que (a) intercepta `delete` →
`update {deletedAt}` y (b) inyecta `deletedAt: null` en lecturas, con escape
explícito para Papelería (`includeDeleted`).

## 6.3 Capa de mutación: Server Actions

- Una acción por operación de dominio (`createClient`, `changeEventStage`,
  `registerPayment`…), siempre: sesión → Zod → servicio de dominio (transacción +
  auditoría) → `revalidatePath` → resultado tipado `{ok} | {error}` para
  `useActionState`.
- Lecturas: directamente en Server Components vía servicios (`getEventsPage(filters)`),
  sin capa REST. (Route handlers solo para auth, jobs y descargas de PDF.)

## 6.4 Jobs / cron

- `POST /api/jobs/reminders` (diario 7:00 CR + opcional cada hora en horario
  laboral): evalúa las reglas de `domain/reminders.ts`, upsert de tareas por
  `autoKey`, cierra automáticas obsoletas.
- `POST /api/jobs/expirations` (diario): cotizaciones `SENT` vencidas → `EXPIRED`;
  reservaciones `DEPOSIT_RECEIVED` con evento ≤7 días → `BALANCE_PENDING`.
- Protección: header `Authorization: Bearer ${CRON_SECRET}`.
- Disparador: Vercel Cron, cron del servidor o GitHub Actions — indiferente, ambos
  endpoints son idempotentes.

## 6.5 Integración con CorrespondencyBot (generación de documentos)

**Decisión: el CRM calcula, el Python renderiza.** Se respeta "no reescribir el
script en TypeScript": `generar_documento.py`, `Plantilla.docx` y la conversión a
PDF quedan intactos. El cálculo de precios migra al CRM porque la BD pasa a ser la
fuente de verdad (mandato del MVP); `cotizador_okidoki.py` queda como referencia y
respaldo durante la transición.

Flujo:

```
Server Action generateQuotePdf(quoteId)
  1. domain/pricing.ts  → líneas, descuentos, IVA, totales (desde BD)
  2. integrations/google-maps.ts → transporte (misma fórmula: base 5000,
     400/km tras 15 km libres, origen de Settings)
  3. Construir JSON con el MISMO contrato de cotizacion_output.json:
     { codigo: "COT-2026-0043", tipo_documento, fecha_envio, descripcion,
       cliente{...}, evento{...}, servicios[...], totales{...} }
  4. spawn: $CORRESPONDENCY_BOT_PYTHON generar_documento.py
       -i <tmp.json> -t Plantilla.docx --pdf   (cwd = CORRESPONDENCY_BOT_PATH)
  5. Mover output/<codigo>.pdf → storage/documents/ ; Quote.pdfUrl = ruta
  6. audit("quote.pdf_generated")
```

- `generar_documento.py` ya toma `codigo` del JSON → la numeración `COT-…` del CRM
  funciona **sin tocar una línea de Python** (verificado en el código del bot).
- Reservaciones: mismo puente con `tipo_documento: "Reservación"` (prefijo RES-).
- Requisito de despliegue: Python 3 + dependencias del bot + LibreOffice en el mismo
  host. `/ajustes` muestra un health-check (corre `--help` del script y verifica
  `soffice --version`).
- Alternativa si el despliegue separa servicios: envolver el bot con FastAPI
  (`POST /render` recibe el JSON, responde el PDF). El contrato no cambia.

## 6.6 Google Maps

- Portar a `integrations/google-maps.ts` la llamada Routes API v2 que ya hace el
  bot (POST `directions/v2:computeRoutes`, `regionCode: CR`, `languageCode: es`),
  con la misma degradación: sin API key o error → precio base + advertencia visible
  en el paso 2 del flujo de cotización (no silenciosa como en el bot).
- Parámetros (origen, tarifa/km, km libres, base) desde `Settings`.

## 6.7 Migración de datos (Sheets + Excel)

1. **Catálogo y precios (Sheets → BD)**: exportar `CATÁLOGO_GENERAL`, `BOTARGAS` y
   `REGLAS_DESCUENTO` a CSV → `prisma/seed-data/`. `seed.ts` crea `CatalogItem`
   (botargas con tipo/franquicia como tags), `Service` (conceptos generales) y
   defaults de `Settings`. Los recargos por tipo de cliente van a
   `Service.clientTypeSurcharge`.
2. **Históricos (Excel → BD)**: tras limpieza manual (normalizar nombres, deduplicar
   por teléfono, validar formato), exportar a `clientes.csv` y `eventos.csv`.
   `seed.ts --historical`: crea clientes (teléfono E.164), eventos `COMPLETED` sin
   cotización/reservación, y calcula `isRecurring` + `lastContactAt`.
3. **Paquetes**: NO se siembran datos inventados — se crean desde el creador de
   paquetes (regla del MVP: la app no asume paquetes iniciales).
4. Sheets queda como respaldo de solo lectura; el bot conserva su modo Sheets como
   plan B durante la transición.

## 6.8 PDFs y archivos

- MVP: `storage/documents/` local servido por route handler autenticado
  (`GET /api/documents/[file]`, valida sesión). El catálogo público usa imágenes en
  `public/` o URL externa. Migración futura a S3/R2 cambia solo `pdfUrl`/`imageUrl`.

## 6.9 Autenticación

- Auth.js v5 + Google + Prisma adapter. `signIn` callback: permitir solo correos de
  `ALLOWED_EMAILS`. Middleware protege `(app)/`; `/catalogo` y `/api/auth` libres.
- Sin roles: cualquier usuario autenticado tiene acceso total (mandato del MVP).
