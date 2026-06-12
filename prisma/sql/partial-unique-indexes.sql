-- OkiDoki CRM — Restricciones que Prisma no puede declarar.
-- Aplicar como migración manual después de la primera `prisma migrate dev`:
--   1. npx prisma migrate dev --create-only --name partial_unique_indexes
--   2. Copiar este contenido al archivo migration.sql generado.
--   3. npx prisma migrate dev

-- Teléfono de cliente único entre clientes NO eliminados (soft delete permite
-- recrear un cliente cuyo registro anterior fue enviado a papelería).
CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_active_unique
  ON clients (phone)
  WHERE deleted_at IS NULL;

-- Solo 1 cotización activa (SENT) por evento. Las anteriores quedan en historial
-- (EXPIRED / REJECTED / DRAFT).
CREATE UNIQUE INDEX IF NOT EXISTS quotes_one_sent_per_event
  ON quotes (event_id)
  WHERE status = 'SENT' AND deleted_at IS NULL;

-- Una línea de paquete referencia exactamente un servicio O un ítem de catálogo.
ALTER TABLE package_items
  ADD CONSTRAINT package_items_exactly_one_ref
  CHECK (num_nonnulls(service_id, catalog_item_id) = 1);

-- Calificaciones siempre en rango 1–5.
ALTER TABLE events
  ADD CONSTRAINT events_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
ALTER TABLE event_assignments
  ADD CONSTRAINT event_assignments_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);

-- Una tarea debe colgar de al menos una entidad o ser independiente: sin CHECK
-- (las tareas generales del equipo son válidas sin FKs).
