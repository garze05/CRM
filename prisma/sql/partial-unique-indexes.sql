-- OkiDoki CRM — Restricciones que Prisma no puede declarar en el schema.
-- Columnas camelCase requieren comillas dobles en PostgreSQL (Prisma no agrega @map
-- a esos campos, por lo que la BD los guarda tal cual: "deletedAt", "eventId", etc.)
--
-- Cómo aplicar:
--   1. npx prisma migrate dev --create-only --name partial_unique_indexes
--   2. Copiar este contenido al migration.sql generado.
--   3. npx prisma migrate dev

-- Teléfono de cliente único entre clientes NO eliminados (soft delete permite
-- recrear un cliente cuyo registro anterior fue enviado a papelería).
CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_active_unique
  ON clients (phone)
  WHERE "deletedAt" IS NULL;

-- Solo 1 cotización activa (SENT) por evento. Las anteriores quedan en historial
-- (EXPIRED / REJECTED / DRAFT).
CREATE UNIQUE INDEX IF NOT EXISTS quotes_one_sent_per_event
  ON quotes ("eventId")
  WHERE status = 'SENT' AND "deletedAt" IS NULL;

-- Una línea de paquete referencia exactamente un servicio O un ítem de catálogo.
ALTER TABLE package_items
  ADD CONSTRAINT package_items_exactly_one_ref
  CHECK (num_nonnulls("serviceId", "catalogItemId") = 1);

-- Calificaciones siempre en rango 1–5.
ALTER TABLE events
  ADD CONSTRAINT events_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
ALTER TABLE event_assignments
  ADD CONSTRAINT event_assignments_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
