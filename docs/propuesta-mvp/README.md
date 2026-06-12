# Propuesta MVP — OkiDoki CRM

Propuesta integral de rediseño y arquitectura para llevar el prototipo actual
(frontend estático con datos de prueba) a un MVP operativo completo.

Fecha: 11 de junio de 2026 · Rama: `feat/mvp-architecture`

## Documentos

| # | Documento | Contenido |
|---|-----------|-----------|
| 1 | [01-diagnostico.md](01-diagnostico.md) | Estado actual del frontend, qué se conserva, qué falta, riesgos |
| 2 | [02-rediseno-frontend.md](02-rediseno-frontend.md) | Navegación, vistas, calendario, flujos de cotización/reservación |
| 3 | [03-sistema-diseno.md](03-sistema-diseno.md) | Paleta, tipografía, componentes reutilizables, patrones |
| 4 | [04-librerias.md](04-librerias.md) | Evaluación: calendario, tablas, teléfono, estrellas |
| 5 | [05-logica-negocio.md](05-logica-negocio.md) | Reglas del embudo, pagos, recordatorios, conflictos, auditoría |
| 6 | [06-backend.md](06-backend.md) | Arquitectura de backend, integración con CorrespondencyBot, jobs, seeds |
| 7 | [07-plan-implementacion.md](07-plan-implementacion.md) | 15 fases ejecutables con criterios de aceptación |
| 8 | [08-recomendaciones.md](08-recomendaciones.md) | Prioridades, deuda técnica aceptable, decisiones pendientes |

## Artefactos concretos ya creados en esta rama

- [`prisma/schema.prisma`](../../prisma/schema.prisma) — modelo de datos completo del MVP (24 modelos, 16 enums), validado con Prisma 7.8.
- [`prisma.config.ts`](../../prisma.config.ts) — configuración de la CLI de Prisma 7 (conexión, migraciones, seed).
- [`prisma/sql/partial-unique-indexes.sql`](../../prisma/sql/partial-unique-indexes.sql) — restricciones que Prisma no declara (teléfono único activo, 1 cotización SENT por evento, CHECKs de rating).
- [`app/lib/domain/funnel.ts`](../../app/lib/domain/funnel.ts) — máquina de estados del embudo con etiquetas en español y validaciones.
- [`.env.example`](../../.env.example) — variables de entorno del MVP.

## Decisiones clave (resumen ejecutivo)

1. **El estado del embudo vive en el Evento** (la oportunidad), no en el Cliente.
   `RECURRENTE` es condición del cliente (`Client.isRecurring`), derivada de >1 evento realizado.
2. **El stack real es Next 16 / React 19 / Tailwind 4** — no se degrada a Next 14;
   se actualiza la documentación (requiere visto bueno del negocio).
3. **CorrespondencyBot se conserva como motor de documentos**: el CRM calcula precios
   desde la BD y entrega al script Python el mismo contrato JSON que ya consume
   `generar_documento.py`. Cero reescritura del render DOCX/PDF.
4. **Calendario propio** (mes = cuadrícula con fichas compactas; semana/día = agenda de
   tarjetas operativas) construido sobre `date-fns`. Las librerías existentes no cubren
   las tarjetas ricas ni las bandas de temporada sin pelear contra ellas.
5. **TanStack Table v8** como motor headless de las tablas de gestión, conservando el
   diseño visual de `ManagementTable` actual.
6. **Server Actions + Zod** como capa de mutación; servicios de dominio en
   `app/lib/server/` con auditoría transaccional.
7. **Tareas automáticas** generadas por un job idempotente (`autoKey` único) expuesto en
   `/api/jobs/reminders`, disparado por cron externo o Vercel Cron.
