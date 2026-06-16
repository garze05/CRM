# Quotation API — Integración con el CRM

## Qué es

La Quotation API es un servicio HTTP independiente (Python + FastAPI) que expone el motor de cotizaciones de OkiDoki. Calcula precios, aplica descuentos, llama a Google Maps para el transporte y genera los documentos Word/PDF finales.

El código vive en `/Users/garze/Code/CorrespondencyBot` (nombre del directorio heredado; el proyecto se llama internamente "Quotation API").

Documentación del servicio: `CorrespondencyBot/docs/api.md`.

## Cómo levantarlo en desarrollo

```bash
cd /Users/garze/Code/CorrespondencyBot
source .venv/bin/activate
uvicorn api:app --reload
# API disponible en http://localhost:8000
# Swagger UI en   http://localhost:8000/docs
```

## Cómo llama el CRM a la API

El CRM nunca llama a Google Maps, Google Sheets ni genera documentos directamente. Todo eso es responsabilidad de la Quotation API. El CRM solo hace `fetch` a `QUOTATION_API_URL` pasando un Google ID token como credencial.

### Autenticación

NextAuth obtiene un ID token de Google durante el login del usuario. Ese token se reenvía en cada llamada a la Quotation API:

```
Authorization: Bearer <GOOGLE_ID_TOKEN>
```

La Quotation API verifica la firma del token y el `aud` contra `GOOGLE_OAUTH_CLIENT_ID` (que debe ser el mismo valor que `AUTH_GOOGLE_ID` en este proyecto).

### Endpoints que usará el CRM

| Endpoint | Uso |
|---|---|
| `GET /health` | Verificar que la API está viva antes de generar una cotización |
| `GET /catalog/personajes` | Cargar catálogo de personajes para el selector de eventos |
| `GET /catalog/servicios` | Cargar servicios disponibles |
| `POST /quotes/manual` | Generar cotización a partir de los datos del formulario del CRM |
| `POST /descriptions` | Enriquecer descripción introductoria con IA (opcional) |
| `POST /documents/render` | Renderizar DOCX/PDF desde el JSON de cotización |

### Ejemplo de llamada desde el CRM (TypeScript)

```typescript
// app/lib/quotation-api.ts

const QUOTATION_API_URL = process.env.QUOTATION_API_URL ?? "http://localhost:8000";

async function fetchQuotationApi<T>(
  path: string,
  idToken: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${QUOTATION_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Quotation API ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function generarCotizacion(payload: QuotePayload, idToken: string) {
  return fetchQuotationApi<CotizacionResponse>("/quotes/manual", idToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
```

El `idToken` se obtiene de la sesión de NextAuth. Ver cómo extraerlo en `auth.ts` cuando esté implementado.

## Separación de secretos

| Variable | Vive en | Por qué |
|---|---|---|
| `AUTH_GOOGLE_ID` | Solo CRM | Es el Client ID del OAuth flow que inicia el CRM |
| `AUTH_GOOGLE_SECRET` | Solo CRM | El secret del OAuth flow nunca sale del CRM |
| `GOOGLE_OAUTH_CLIENT_ID` | Solo Quotation API | Mismo valor que `AUTH_GOOGLE_ID`; se usa para verificar el `aud` del token entrante |
| `GOOGLE_MAPS_API_KEY` | Solo Quotation API | Solo la API llama a Google Maps |
| `OPENROUTER_API_KEY` | Solo Quotation API | Solo la API llama a OpenRouter |
| `DATABASE_URL` | Solo CRM | Apunta a `okidoki_crm` (Prisma). La Quotation API no tiene BD propia. |
| `QUOTATION_API_URL` | Solo CRM | URL del servicio para que el CRM sepa a dónde llamar |

## Flujo de generación de cotización

```
Usuario CRM
    │
    ▼
[Formulario evento] → POST /api/quotes (Next.js route handler)
                            │
                            │ usa QUOTATION_API_URL + idToken de sesión
                            ▼
                    POST /quotes/manual (Quotation API)
                            │
                        ┌───┴────────────────────┐
                        │                        │
                   Google Sheets           Google Maps API
                   (precios, catálogo)     (costo transporte)
                        │                        │
                        └───────────┬────────────┘
                                    ▼
                            JSON de cotización
                                    │
                    POST /documents/render (Quotation API)
                                    │
                              DOCX / PDF
                                    │
                    ◄───────────────┘
            CRM guarda pdf_url en BD y actualiza estado del evento
```
