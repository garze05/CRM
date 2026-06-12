# 8. Recomendaciones finales

## 8.1 Qué implementar primero

1. **Fases 1–2 (backend + datos)** sin tocar UI: todo lo demás depende de esto y
   desbloquea la migración de históricos (lo más valioso para el negocio desde el
   día uno: ver su cartera real en el sistema).
2. **Clientes + eventos (fase 5)** antes que cotizaciones: el embudo temprano
   (prospecto→contactado) es donde hoy se pierden leads por falta de seguimiento.
3. **Cotizaciones (fase 8)** es el corazón del valor — pero solo después de que
   pricing tenga tests que lo comparen contra el bot actual.

## 8.2 Qué evitar

- **No construir kanban arrastrable del embudo**: las transiciones tienen reglas;
  botones explícitos en el detalle son más seguros y más rápidos de construir.
- **No abstraer prematuramente** (repositorios genéricos, CQRS, colas): 2-3 usuarios,
  cientos de filas — Server Actions + Prisma directo es suficiente.
- **No tocar `Plantilla.docx` ni `generar_documento.py`** salvo bugs: es la pieza
  más probada del sistema actual.
- **No introducir librerías de UI completas** ni reescribir los tokens existentes.
- **No sembrar paquetes/datos ficticios**: estados vacíos + creador de paquetes.
- **Fuera del MVP (recordatorio):** WhatsApp API, portal de cliente, facturación,
  roles, reportes exportables, pgvector/Whisper, app nativa.

## 8.3 Deuda técnica aceptable (temporal y consciente)

| Deuda | Por qué se acepta | Cuándo pagarla |
|-------|-------------------|----------------|
| PDFs en disco local (`storage/`) | Un solo servidor, 2-3 usuarios | Al mover a hosting sin disco persistente → S3/R2 |
| Filtrado client-side en tablas | Volúmenes pequeños | Si una lista supera ~2.000 filas |
| Subprocess Python en el mismo host | Evita un servicio más | Si el despliegue separa servicios → FastAPI wrapper |
| Tipo de cambio USD manual (`Settings`/env) | Referencia visual, no transaccional | Post-MVP con API del BCCR |
| Sin tests E2E exhaustivos | Suite de dominio + UAT cubren el riesgo real | Cuando haya más de un dev |
| Calendario sin drag-and-drop | No está en el MVP | Si el equipo lo pide → evaluar FullCalendar Premium |

## 8.4 Decisiones de negocio — RESUELTAS (2026-06-11)

| # | Decisión | Respuesta del negocio | Dónde quedó aplicada |
|---|----------|----------------------|----------------------|
| 1 | Stack real vs. documentado | **Next 16** — AGENTS.md actualizado por el negocio | AGENTS.md |
| 2 | Catálogo público | **Sin precios, CTA a WhatsApp** | Doc 02 §2.10 |
| 3 | Reglas de descuento | Defaults del Sheets, **editables en Ajustes** | Campos en `Settings` (schema.prisma) |
| 4 | Cancelación con anticipo | **No hay devolución después de confirmar**; se registra en notas | Doc 05 §5.3 |
| 5 | Temporadas festivas | **Navidad, Día del Niño (9 set CR), Halloween** por ahora | `app/lib/domain/seasons.ts` |
| 6 | Mensajes de WhatsApp | Placeholder claro; redacción la pone el negocio | `app/lib/domain/whatsapp-templates.ts` (marcados `[PENDIENTE NEGOCIO]`) |
| 7 | Acceso | Solo correos **@okidokicr.com** | `ALLOWED_EMAIL_DOMAIN` en `.env.example` |
| 8 | Numeración | **Formato CorrespondencyBot** `{C\|R}{DDMM}-{YY}{seq}`, consecutivo anual desde 100, reinicia cada año | `app/lib/domain/numbering.ts` + `DocumentCounter` |

## 8.5 Qué queda preparado para fases futuras (sin costo extra hoy)

- **Google Calendar**: campos de sync en `Event` + selector neutro del calendario.
- **WhatsApp API**: `Interaction` ya modela canal/dirección; los mensajes sugeridos
  del MVP se convertirán en envíos automáticos.
- **Notificaciones externas**: las tareas automáticas + `AuditLog` son la cola de
  eventos que un canal de notificaciones consumirá.
- **Búsqueda avanzada (pgvector/Whisper)**: la búsqueda global del shell ya existe
  como punto de entrada único; PostgreSQL admite la extensión sin migrar nada.
- **Roles**: `User` + `AuditLog` registran actor desde el día uno; añadir un campo
  `role` después no rompe nada.
- **Reportes exportables**: las consultas agregadas del dashboard
  (`getDashboardMetrics`) serán la fuente de los reportes.
