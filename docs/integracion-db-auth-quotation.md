# Integración DB · Auth · Quotation API

Documenta cómo el CRM se conecta a su base de datos (Prisma), autentica al
equipo (Auth.js + Google) y consume la **Quotation API** (servicio Python en
`/Users/garze/Code/CorrespondencyBot`).

> **Principio rector:** la **Quotation API es la fuente de verdad** del cálculo
> de cotizaciones, los precios (Google Sheets), el transporte (Google Maps) y el
> documento final. Cuando el modelo o la UI del CRM no se alineaban con el
> contrato de la API, se ajustó el CRM. Las decisiones de ese ajuste están abajo.

---

## 1. Base de datos (Prisma 7)

- Cliente único en [app/lib/db.ts](../app/lib/db.ts) con el driver adapter
  `@prisma/adapter-pg` (Pool de `pg`). La URL vive en `DATABASE_URL` (.env.local).
- El cliente se genera con el provider `prisma-client` en `app/generated/prisma`.
- Servicios server-side en `app/lib/server/*.ts` (`import "server-only"`):
  devuelven datos listos para la UI con enums en inglés (valores de Prisma).
- Seed de desarrollo en [prisma/seed.ts](../prisma/seed.ts): `npx prisma db seed`.

### Enums: código en inglés, UI en español

Los valores se guardan en inglés (Prisma). Las etiquetas en español se resuelven
en los componentes con los mapas de [app/lib/domain/labels.ts](../app/lib/domain/labels.ts).
`StatusBadge` acepta el valor inglés como `value` (color) y la etiqueta española
como `label` (texto).

### Fechas date-only

Los campos `@db.Date` (ej. `Event.eventDate`) se guardan a medianoche UTC.
Formatearlos en zona `America/Costa_Rica` los retrocede un día. **Regla:**
date-only se formatea en `UTC`; los timestamps (`firstContactAt`, etc.) en
`America/Costa_Rica`.

---

## 2. Autenticación (Auth.js v5 + Google)

- Config edge-safe compartida: [app/lib/auth.config.ts](../app/lib/auth.config.ts)
  (sin Prisma). Runtime completo con adaptador: [app/lib/auth.ts](../app/lib/auth.ts).
- **Estrategia JWT** (no database sessions). Motivos:
  1. El `proxy.ts` (antes `middleware.ts`, renombrado en Next 16) valida la
     sesión en el edge sin tocar Postgres.
  2. Guardamos el `id_token` de Google en el JWT para reenviarlo a la Quotation
     API (ver §3).
- Rutas públicas: `/catalogo`, `/login`, `/api/auth`. El resto exige sesión.
- Solo cuentas **verificadas** del dominio `ALLOWED_EMAIL_DOMAIN` entran
  (callback `signIn`).
- `AUTH_GOOGLE_ID` debe ser el **mismo Client ID** que `GOOGLE_OAUTH_CLIENT_ID`
  en la Quotation API: el CRM emite el id_token con esa audiencia y la API lo
  verifica contra el mismo valor.

---

## 3. Quotation API — contrato y reconciliación

Cliente HTTP en `app/lib/integrations/quotation-api.ts` (Fase 5). Endpoint
principal para el CRM: `POST /quotes/manual` (no depende de IDs de Google
Sheets, recibe los datos del formulario).

### 3.1 Numeración del documento (`codigo`) — DIVERGENCIA RESUELTA

La API genera el código así (cotizador_okidoki.py `generar_codigo`):

```
codigo = {C|R}{DD}{MM}-{id_evento}      ej. C0620-26107
```

Es decir, concatena el `id_evento` **que le pasa el llamador** después del guion.
El CRM tenía otro formato en [app/lib/domain/numbering.ts](../app/lib/domain/numbering.ts):

```
{C|R}{DDMM}-{YY}{consecutivo}           ej. C1503-26101
```

**Decisión (API es fuente de verdad del string impreso en el PDF):** el CRM
**no** inventa su propio `quoteNumber`. En su lugar:

1. El CRM calcula el sufijo numérico `{YY}{consecutivo}` con `DocumentCounter`
   (consecutivo anual desde 100) → ej. `26101`.
2. Lo pasa como `id_evento` en el request a la API.
3. La API compone `C{DDMM}-26101` y lo devuelve.
4. El CRM guarda ese `codigo` devuelto en `Quote.quoteNumber`.

Así el formato de negocio se preserva, la API sigue siendo quien arma el string,
y el CRM controla la unicidad/secuencia. El `id_evento` **no** es el UUID del
evento del CRM (la API espera un int); el UUID permanece interno al CRM.

### 3.2 tipo_cliente — MAPEO

La API espera claves en minúscula que existen en su tabla de descuentos
(REGLAS_DESCUENTO en Sheets). Mapeo CRM → API:

| CRM (`ClientType`) | API (`tipo_cliente`) | Recargo en API |
| ------------------ | -------------------- | -------------- |
| `FAMILY`           | `familiar`           | 0%             |
| `EDUCATIONAL`      | `escolar`            | 5%             |
| `CORPORATE`        | `corporativo`        | 10%            |

Los recargos los aplica **la API** (lee REGLAS_DESCUENTO). Los campos
`surchargeEducationalPercent` / `surchargeCorporatePercent` de `Settings` en el
CRM son informativos/visuales cuando se cotiza vía la API — no se envían.

### 3.3 Totales — MAPEO

Respuesta de la API (`totales`): `subtotal_sin_iva`, `iva`, `total`, `abono`,
`pendiente`. **El transporte NO viene como campo aparte**: la API lo incluye
como una línea más en `servicios` (`tipo: "transporte"`), y `subtotal_sin_iva`
ya lo contiene.

Mapeo a las columnas de `Quote`:

| Columna `Quote`  | Origen                                                            |
| ---------------- | ----------------------------------------------------------------- |
| `transportCost`  | Suma de las líneas `servicios` cuyo concepto es transporte        |
| `subtotal`       | `subtotal_sin_iva` − `transportCost` (servicios sin transporte)   |
| `taxAmount`      | `iva`                                                             |
| `total`          | `total` (autoritativo de la API; **no** se recalcula en el CRM)   |
| `discount`       | `0` — los descuentos ya vienen aplicados dentro de cada subtotal  |
| `lineItems`      | el JSON `servicios` completo (trazabilidad y re-render)           |

Se mantiene la invariante `subtotal + transportCost + taxAmount − discount = total`.

`abono` / `pendiente` (50/50) se usan al **reservar** (Reservation
`depositAmount` / `balanceAmount`), no en la cotización.

### 3.4 PDF (`pdfUrl`) — LIMITACIÓN CONOCIDA

`POST /documents/render` devuelve **rutas locales del sistema de archivos de la
API** (ej. `output/api/C0620-26107.docx`), no URLs web. El CRM no puede servir
ese archivo directamente.

**MVP:** se guarda la ruta devuelta en `Quote.pdfUrl` como referencia. La
descarga real requiere, como trabajo siguiente, que la Quotation API exponga un
endpoint de descarga (`GET /documents/{codigo}`) o almacenamiento compartido.

### 3.5 Reenvío del id_token — LIMITACIÓN CONOCIDA

El CRM reenvía el `id_token` de Google (guardado en el JWT) como
`Authorization: Bearer`. El id_token de Google **expira en ~1h**. Para el MVP es
aceptable (sesiones cortas, el equipo re-autentica); en desarrollo local la API
puede correr con `API_AUTH_ENABLED=false`. El refresco del token antes de
vencer es trabajo siguiente.

### 3.6 Manejo de errores

La API responde con códigos significativos: `400` (datos inválidos), `401`
(token ausente/ inválido), `403` (cuenta no aceptada), `502` (falla Sheets /
OpenRouter / Maps), `503` (faltan credenciales/variables). El cliente HTTP del
CRM ([quotation-api.ts](../app/lib/integrations/quotation-api.ts)) traduce estos
a un `QuotationApiError` con mensaje en español, visible en el formulario sin
filtrar detalles internos. Falla de red / servicio caído → mensaje "No se pudo
contactar el servicio de cotización".

### 3.7 Consecutivo en generación fallida

El consecutivo (`DocumentCounter`) se reserva **antes** de llamar a la API,
porque el `id_evento` que compone el `codigo` lo necesita. Si la API falla, el
número queda consumido (hueco en la secuencia). Es aceptable para el MVP: no
rompe la unicidad ni la numeración. Mantener una transacción de BD abierta
durante la llamada de red sería peor (locks).

### 3.8 Flujo de "Nueva cotización" — SIMPLIFICACIÓN

El wizard original de 4 pasos con catálogo visual se reemplazó por un formulario
funcional: seleccionar evento + líneas de servicio/personaje (nombre libre que
la API resuelve contra el catálogo de Sheets) + opciones (transporte, IVA). El
selector visual de catálogo (que requiere `GET /catalog/*` con credenciales de
Sheets) queda como mejora futura. La generación crea la cotización como
`BORRADOR`; enviarla (`SENT`) y aceptarla son acciones separadas (pendientes).

---

## Estado de la integración

| Fase | Alcance                                          | Estado |
| ---- | ------------------------------------------------ | ------ |
| 1    | Prisma client + `db.ts`                          | ✅     |
| 2    | Auth.js + Google + protección de rutas           | ✅     |
| 3    | Servicio de clientes + pantallas a DB            | ✅     |
| 4    | Servicio de eventos + pantallas a DB             | ✅     |
| 5    | Cliente Quotation API + flujo de cotizaciones    | ✅     |
