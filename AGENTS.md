# OkiDoki CRM — AGENTS.md

Sistema de gestión comercial para empresa de eventos infantiles y corporativos.
Cubre el ciclo completo: captación de prospectos → seguimiento → cotización → reservación → realización del evento.

---

## Contexto del negocio

- Servicios: personajes botarga, inflables, animadores y paquetes combinados.
- Canales de entrada: WhatsApp (principal), llamadas entrantes (secundario).
- Tipos de cliente: Familiar, Institución Educativa, Corporativo — cada uno con lógica de precios distinta.
- Variables de cotización: paquete base + servicios adicionales + transporte (calculado via Google Maps API) + tipo de cliente.
- Usuarios del sistema: 2–3 personas (equipo familiar/pequeño). No se requieren roles complejos en el MVP.
- Stack definido: Next.js 16, PostgreSQL + Prisma, NextAuth con Google OAuth.

---

## Estado actual (pre-CRM)

Lo siguiente ya existe y debe integrarse, no rehacerse:

- **Script Python de cotización:** lee precios desde Google Sheets, calcula transporte con Google Maps API, genera PDF con plantilla actual. Este script es el núcleo del módulo de cotizaciones.
- **Catálogo en Google Sheets:** fuente de verdad de precios y servicios disponibles. En el MVP se mantiene como fuente externa; migración a BD es trabajo futuro.
- **Datos históricos en Excel:** clientes y eventos anteriores. Requieren limpieza antes de seedear la base de datos nueva.
- **UI/UX en papel:** diseño inicial ya definido. El sistema debe respetarlo como punto de partida.

---

## Embudo de ventas — Estados del pipeline

Todo evento activo funciona como una oportunidad comercial y tiene un estado que determina en qué etapa del embudo se encuentra.
El cliente conserva la relación, el tipo comercial y el historial; no tiene un estado de embudo independiente.
El sistema debe hacer visible este pipeline en todo momento desde eventos, dashboard y fichas de cliente como dato derivado.

```
PROSPECTO → CONTACTADO → COTIZADO → RESERVADO → CONFIRMADO → REALIZADO
                                                              ↓
                                                          CANCELADO (desde cualquier estado)
```

| Estado       | Descripción                                                   |
| ------------ | ------------------------------------------------------------- |
| `PROSPECTO`  | Primer contacto recibido, sin información completa aún        |
| `CONTACTADO` | Se obtuvo contexto del evento; pendiente de enviar cotización |
| `COTIZADO`   | Cotización enviada; esperando respuesta                       |
| `RESERVADO`  | Cliente aceptó; reservación generada; pendiente pago inicial  |
| `CONFIRMADO` | Pago del 50% recibido (2 semanas antes del evento)            |
| `REALIZADO`  | Evento ejecutado; pendiente cobro del saldo restante          |
| `CANCELADO`  | Proceso cerrado sin realización                               |

`RECURRENTE` no es etapa de evento. Es una condición del cliente, derivada de tener más de 1 evento realizado.

---

## Módulos del MVP

### 1. Clientes

**Propósito:** Repositorio central de todos los contactos del negocio.

**Atributos:**

- `id` — UUID, generado automáticamente
- `nombre` — string, requerido
- `apellidos` — string, requerido
- `telefono` — string, único, requerido (es el identificador natural en WhatsApp)
- `tipo_cliente` — enum: `FAMILIAR` | `EDUCATIVO` | `CORPORATIVO`
- `notas` — texto libre, opcional
- `fecha_primer_contacto` — timestamp, generado automáticamente al crear
- `fecha_ultimo_contacto` — timestamp, actualizado automáticamente en cada interacción registrada
- `creado_en` — timestamp
- `actualizado_en` — timestamp

**Reglas de negocio:**

- Un cliente puede tener múltiples eventos a lo largo del tiempo.
- El tipo de cliente pertenece al cliente y afecta directamente cómo se calcula la cotización por defecto.
- Si un cliente existente vuelve a contactar por un evento nuevo, se crea un nuevo evento con su propio estado inicial (`PROSPECTO`, `CONTACTADO` o `COTIZADO`) sin modificar el estado histórico de eventos anteriores.
- La ficha de cliente puede mostrar "oportunidad activa" como dato derivado del evento abierto más reciente; no debe persistir un estado de embudo duplicado en cliente.
- Un cliente se marca como recurrente cuando tiene más de 1 evento realizado; debe mostrarse como condición de relación, no como etapa del embudo.
- Si el teléfono ya existe en la BD al registrar un nuevo lead, el sistema debe alertar que es un cliente existente y asociarlo en lugar de duplicarlo.

**Sistema de seguimiento (recordatorios):**

- Si un evento está en estado `COTIZADO` y el cliente no ha respondido en 24h → recordatorio al usuario del CRM.
- Si un evento está en estado `COTIZADO` y el cliente no ha respondido en 72h → segundo recordatorio con sugerencia de mensaje de seguimiento.
- Si el último evento realizado de un cliente fue hace más de 3 meses sin nuevo contacto → recordatorio de reactivación.
- Los recordatorios se muestran en el dashboard principal como tareas pendientes.

---

### 2. Eventos

**Propósito:** Registro de cada evento cotizado, reservado o realizado, vinculado a un cliente.

**Atributos:**

- `id` — UUID, generado automáticamente
- `cliente_id` — FK a Clientes, requerido
- `estado_pipeline` — enum según estados definidos arriba
- `tipo_evento` — enum: `INFANTIL` | `CORPORATIVO` | `INSTITUCIONAL`
- `fecha_evento` — date, requerido desde estado COTIZADO
- `hora_inicio` — time
- `duracion_horas` — decimal
- `lugar_nombre` — string (nombre del venue o domicilio)
- `lugar_direccion` — string (dirección completa para cálculo de transporte)
- `lugar_tipo` — enum: `INTERIOR` | `EXTERIOR` (afecta disponibilidad de inflables)
- `num_invitados` — integer
- `edad_festejado` — integer (para eventos infantiles; orienta sugerencia de personaje)
- `paquete_id` — FK a Paquetes, nullable (puede cotizarse sin paquete en casos especiales)
- `servicios_adicionales` — array de IDs de servicios extra seleccionados
- `notas_internas` — texto libre para el equipo
- `calificacion` — integer 1–5, nullable (star rating manual del evento; no obligatorio)
- `creado_en` — timestamp
- `actualizado_en` — timestamp

**Reglas de negocio:**

- Un evento siempre pertenece a exactamente 1 cliente.
- El estado del embudo pertenece al evento, no al cliente.
- Al crear un evento para un cliente existente, el estado inicial se define para esa nueva oportunidad y no se hereda automáticamente de eventos realizados o cancelados.
- No puede existir un evento en estado `RESERVADO` o superior sin fecha definida.
- El sistema debe advertir conflictos de calendario (mismo personaje/colaborador en misma fecha y horario).
- Eventos en estado `CONFIRMADO` bloquean esa fecha en el calendario para los recursos asignados.

---

### 3. Paquetes y Servicios

**Propósito:** Definir la oferta estructurada del negocio. Elimina la cotización artesanal de cada elemento.

**Paquetes (3 niveles base):**

| Campo                     | Descripción                             |
| ------------------------- | --------------------------------------- |
| `id`                      | UUID                                    |
| `nombre`                  | ej: "Básico", "Fiesta", "Premium"       |
| `descripcion`             | Texto visible al cliente                |
| `duracion_horas`          | Duración incluida                       |
| `precio_base_familiar`    | Precio para tipo FAMILIAR               |
| `precio_base_educativo`   | Precio para tipo EDUCATIVO              |
| `precio_base_corporativo` | Precio para tipo CORPORATIVO            |
| `activo`                  | boolean — permite desactivar sin borrar |

**Servicios adicionales (à la carte):**

| Campo             | Descripción                                                 |
| ----------------- | ----------------------------------------------------------- |
| `id`              | UUID                                                        |
| `nombre`          | ej: "Botarga adicional", "Inflable extra", "Hora adicional" |
| `precio_unitario` | Base; puede variar por tipo de cliente                      |
| `tipo_precio`     | `FIJO` \| `POR_HORA` \| `POR_UNIDAD`                        |
| `activo`          | boolean                                                     |

**Reglas de negocio:**

- Los precios en la BD son la fuente de verdad del CRM. La migración desde Google Sheets es parte del setup inicial.
- El script Python existente debe adaptarse para leer de la BD en lugar de Google Sheets una vez migrados los datos.
- El transporte sigue calculándose externamente (Google Maps API) y sumándose al total de la cotización.

---

### 4. Cotizaciones

**Propósito:** Documento formal de precio generado para un evento específico, con trazabilidad completa.

**Atributos:**

- `id` — UUID
- `evento_id` — FK a Eventos, requerido
- `numero_cotizacion` — string legible, generado automáticamente con formato `C{DDMM}-{YY}{consecutivo}` (ej: `C1503-26101`)
- `subtotal` — decimal calculado
- `costo_transporte` — decimal, calculado por Google Maps API
- `descuento` — decimal, opcional
- `total` — decimal
- `moneda` — string (por defecto según configuración regional)
- `fecha_emision` — timestamp
- `fecha_vigencia` — date (por defecto: 7 días desde emisión)
- `estado` — enum: `BORRADOR` | `ENVIADA` | `ACEPTADA` | `VENCIDA` | `RECHAZADA`
- `pdf_url` — ruta al PDF generado
- `notas_cotizacion` — texto visible en el documento para el cliente

**Reglas de negocio:**

- La cotización se genera a partir del paquete + servicios adicionales del evento + transporte calculado.
- El PDF se genera automáticamente usando el script Python adaptado; incluye imagen del personaje del catálogo.
- Toda cotización tiene fecha de vigencia visible (crea urgencia legítima sin presionar).
- Al aceptar una cotización, el evento avanza automáticamente a estado `RESERVADO`.
- Solo puede haber 1 cotización activa (`ENVIADA`) por evento. Las anteriores quedan en historial.

---

### 5. Reservaciones

**Propósito:** Confirmar el acuerdo comercial y gestionar los pagos comprometidos.

**Atributos:**

- `id` — UUID
- `evento_id` — FK a Eventos, requerido
- `cotizacion_id` — FK a Cotizaciones, requerido
- `numero_reservacion` — string legible, generado automáticamente con formato `R{DDMM}-{YY}{consecutivo}` (ej: `R1503-26101`)
- `total_acordado` — decimal (puede diferir del total cotizado si hubo ajuste)
- `pago_anticipo` — decimal (50% del total, calculado automáticamente)
- `pago_anticipo_fecha_limite` — date (2 semanas antes del evento)
- `pago_saldo` — decimal (50% restante)
- `pago_saldo_fecha_limite` — date (antes de iniciar el evento)
- `estado_pago` — enum: `PENDIENTE_ANTICIPO` | `ANTICIPO_RECIBIDO` | `SALDO_PENDIENTE` | `PAGADO_COMPLETO`
- `pdf_url` — ruta al PDF de reservación
- `notas` — texto libre
- `creado_en` — timestamp

**Reglas de negocio:**

- No puede existir una reservación sin cotización aceptada asociada.
- Al registrar el anticipo recibido, el evento avanza a `CONFIRMADO`.
- El sistema genera recordatorio automático 3 días antes del vencimiento del anticipo.
- Al registrar el pago del saldo, el evento puede marcarse como `REALIZADO`.

---

### 6. Colaboradores

**Propósito:** Gestionar las personas que ejecutan los eventos (actores de botarga, animadores, etc.).

**Atributos:**

- `id` — UUID
- `nombre` — string
- `apellidos` — string
- `telefono` — string
- `rol` — enum: `BOTARGA` | `ANIMADOR` | `LOGISTICA` | `OTRO`
- `personajes_disponibles` — array de IDs de personajes que puede interpretar
- `activo` — boolean
- `notas` — texto libre

**Calificación:**

- La calificación de un colaborador se registra **por evento** en la tabla de asignaciones (relación Colaborador ↔ Evento), no en el perfil del colaborador directamente.
- Campo en la asignación: `calificacion` — integer 1–5, nullable (no obligatorio).
- El perfil del colaborador expone `calificacion_promedio` — decimal calculado como promedio de todas las calificaciones registradas en sus eventos. Se recalcula al guardar cada asignación calificada.
- Si un colaborador no tiene ninguna calificación registrada, `calificacion_promedio` se muestra como sin calificación, no como 0.

**Reglas de negocio:**

- Un colaborador puede estar asignado a múltiples eventos siempre que no haya conflicto de fecha/hora.
- El sistema debe mostrar disponibilidad del colaborador al asignarlo a un evento.

---

### 7. Catálogo (Personajes y servicios visuales)

**Propósito:** Repositorio de imágenes y descripción de personajes disponibles, usado en cotizaciones y como material de ventas.

**Atributos por personaje/servicio:**

- `id` — UUID
- `nombre` — string
- `categoria` — enum: `PERSONAJE` | `INFLABLE` | `DECORACION` | `OTRO`
- `descripcion` — texto corto
- `imagen_url` — ruta a la imagen principal
- `galeria_urls` — array de URLs de imágenes adicionales
- `activo` — boolean
- `tags` — array de strings para búsqueda (ej: "Disney", "Marvel", "niñas", "superheroes")

**Reglas de negocio:**

- Las imágenes del catálogo se incrustan en el PDF de cotización automáticamente.
- El catálogo debe poder enviarse como enlace independiente (vista pública, sin login).

---

### 8. Dashboard y Métricas

**Propósito:** Visibilidad del negocio en tiempo real para el equipo.

**Vistas requeridas en el MVP:**

- **Pipeline de ventas:** cantidad de leads en cada estado del embudo, hoy y este mes.
- **Tareas pendientes:** seguimientos vencidos, cotizaciones sin respuesta, anticipos por vencer.
- **Calendario de eventos:** vista mensual con eventos confirmados, con indicador de estado de pago.
- **Métricas básicas:**
  - Tasa de cierre (leads → realizados) por mes
  - Ingreso confirmado vs ingreso proyectado del mes
  - Eventos por tipo (infantil/corporativo/institucional)
  - Tiempo promedio entre cotización y respuesta

---

## Integraciones

### WhatsApp Business

- En el MVP: el CRM registra manualmente las interacciones de WhatsApp (el chat sigue en el teléfono).
- El sistema genera los mensajes sugeridos de seguimiento que el usuario puede copiar y enviar.
- Integración directa con la API de WhatsApp Business es trabajo futuro (post-MVP).

### Google Maps API

- Usada por el script de cotización para calcular distancia y costo de transporte.
- Se mantiene en el MVP; la llamada se hace desde el backend al generar la cotización.

### Google Sheets

- Fuente de verdad de precios durante la transición.
- El setup inicial incluye migración de datos a la BD de Prisma.
- Una vez migrado, Google Sheets queda como respaldo/referencia, no como fuente activa.

### Google OAuth

- Autenticación del equipo vía NextAuth.
- Sin roles complejos en el MVP: cualquier usuario autenticado tiene acceso completo.

---

## Datos históricos — Proceso de migración

Los Excel existentes con clientes y eventos anteriores deben pasar por:

1. **Limpieza manual** (fuera del sistema): normalizar nombres, eliminar duplicados, validar teléfonos.
2. **Script de seed** (parte del setup del proyecto): carga masiva a las tablas de Clientes y Eventos históricos con estado `REALIZADO`; los clientes con más de 1 evento realizado quedan marcados como recurrentes.
3. Los eventos históricos no requieren cotización ni reservación asociada; solo el registro del evento y cliente.

---

## Fuera del scope del MVP

Lo siguiente está identificado pero se construye en fases posteriores:

- Integración directa con la API de WhatsApp Business (automatización de mensajes).
- Portal de cliente para ver su cotización/reservación en línea.
- Facturación o integración con sistemas contables.
- App móvil nativa.
- Roles y permisos granulares (admin vs operativo).
- Reportes exportables a Excel/PDF.
- Migración del script Python a TypeScript nativo en el backend.
- **Búsqueda avanzada:** búsqueda borrosa (fuzzy search) sobre clientes, eventos y catálogo usando PostgreSQL + extensión `pgvector`. Búsqueda por voz usando Whisper de OpenAI como capa de transcripción antes de la consulta. Ambas funcionalidades comparten el mismo pipeline de búsqueda semántica.

---

## Principios de UI/UX

Estos principios aplican a toda la interfaz y deben respetarse en cada componente construido:

- **Tipografía normal y accesible:** el tamaño base de la interfaz debe mantenerse en 16px para legibilidad, pero sin escalar títulos, etiquetas, tablas o formularios de forma exagerada. La UI debe evitar que la información se salga de contenedores; si un usuario necesita verla más grande, puede usar los controles de zoom del navegador. Priorizar jerarquía clara, contraste suficiente, objetivos táctiles accesibles y texto que respire sin romper layouts.
- **Iconos con etiqueta obligatoria:** ningún ícono debe aparecer solo. Todo ícono debe ir acompañado de un texto descriptivo visible a su lado. No se permiten íconos sin label, ni tooltips como sustituto de la etiqueta (los tooltips son complemento, no reemplazo).
- **Diseño de referencia:** el wireframe en papel existente es el punto de partida; cualquier decisión de layout debe partir de él antes de proponer cambios.

---

## Convenciones del proyecto

- **Idioma del código:** inglés (variables, funciones, esquema de BD).
- **Idioma de la UI y documentación:** español sin excepciones. En lugar de "Lead" Prospecto, en lugar de "Pipeline" Embudo, etc.
- **Fechas:** siempre almacenadas en UTC; mostradas en hora local de Costa Rica (America/Costa_Rica).
- **Moneda:** colones costarricenses (CRC) como default; el sistema debe soportar mostrar en USD como referencia.
- **IDs:** UUID v4 para todas las entidades principales.
- **Soft delete:** todas las entidades usan `deleted_at` timestamp en lugar de borrado físico.
