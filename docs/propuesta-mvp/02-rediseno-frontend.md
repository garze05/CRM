# 2. Propuesta de rediseño del frontend

Principio rector: **el embudo visible y accionable en todo momento, y cada vista
optimizada para alguien que opera rápido por teléfono mientras atiende WhatsApp**.

## 2.1 Arquitectura de navegación

Se conserva el shell actual (sidebar + búsqueda global + nav móvil) con esta
reorganización:

```
Inicio
  └ Inicio (/)                      ← dashboard operativo

Gestión
  ├ Clientes (/clientes)
  ├ Eventos (/eventos)              ← tabla ⇄ calendario en la misma ruta
  ├ Cotizaciones (/cotizaciones)
  ├ Reservaciones (/reservaciones)
  ├ Colaboradores (/colaboradores)
  └ Tareas (/tareas)                ← NUEVA

Oferta
  ├ Inventario (/inventario)        ← paquetes + servicios + creador de paquetes
  └ Catálogo (/catalogo-admin)      ← personajes/inflables/decoración (admin)

Cuenta
  ├ Papelería (/papeleria)
  └ Ajustes (/ajustes)
```

- Se elimina el grupo "Métricas" (sus dos ítems apuntan a `/`); las métricas viven
  en el dashboard. Si crecen, se reintroduce `/metricas` post-MVP.
- **Vista pública**: `/catalogo` fuera del shell autenticado (layout propio, sin login),
  enlazable por WhatsApp.
- Grupos de rutas: `app/(app)/...` para todo lo autenticado (middleware de Auth.js),
  `app/catalogo/` público.
- Nav móvil inferior: Inicio · Eventos · Tareas · Clientes (cotizaciones se alcanza
  desde el evento; tareas es lo que se consulta en campo).

## 2.2 Dashboard (`/`)

- **Objetivo:** responder en un viewport "¿qué tengo que hacer hoy y cómo va el mes?".
- **Información (orden de prioridad):**
  1. **Tareas de hoy/vencidas** (recordatorios automáticos + manuales) con acción inline
     (completar, posponer, abrir entidad).
  2. **Embudo del mes**: columnas Prospecto→Realizado con conteos clicables
     (filtran `/eventos?etapa=X`) + columna "Recurrentes" (clientes).
  3. **Próximos eventos (7 días)**: tarjetas operativas compactas con estado de pago.
  4. **Métricas del mes**: tasa de cierre, ingreso confirmado vs. proyectado,
     eventos por tipo, tiempo promedio cotización→respuesta.
  5. **Actividad reciente** (AuditLog, últimas 10 acciones).
- **Acciones:** "Nuevo prospecto" (cliente+evento en un paso), "Nueva cotización",
  "Ir al calendario".
- **Estados vacíos:** sin tareas → "Todo al día ✅"; sin eventos → CTA de crear prospecto.
- **Conexión:** todo clic aterriza en la entidad filtrada; nada es decorativo.

## 2.3 Embudo (componente transversal)

`FunnelBoard`: fila horizontal de etapas con conteo y monto proyectado por etapa.
Aparece en dashboard (resumen) y en `/eventos` (como filtro activo). Cada etapa usa
los colores de `StatusBadge`. No es un kanban arrastrable en el MVP (la transición
de etapa tiene reglas de negocio; se hace desde el detalle del evento con botones
de acción explícitos: "Marcar contactado", "Generar cotización", etc.).

## 2.4 Clientes

### Lista (`/clientes`)
- Tabla de gestión (ver doc 03 §tablas): Nombre+teléfono formateado, Tipo,
  Último contacto, Eventos (realizados/totales), Recurrente (badge), Acciones.
- Filtros por columna estilo Excel + búsqueda global (nombre, teléfono parcial).
- Acción primaria: "Nuevo cliente".

### Alta (`/clientes/nuevo`)
- **Validación clave:** al escribir el teléfono se consulta en vivo
  (`findClientByPhone`); si existe → banner "Este teléfono pertenece a Ana Rojas"
  con botón "Abrir cliente y crear evento" en lugar de duplicar.
- Input telefónico con selector de país + bandera, default CR, formateo `XXXX YYYY`
  mientras se escribe (ver doc 04 §teléfono).

### Detalle (`/clientes/[id]`)
- **Objetivo:** ficha 360° del cliente.
- Columna principal: datos de contacto (editables), **historial de eventos**
  (tabla mini con etapa, fecha, total, calificación ★), **interacciones** (timeline
  de WhatsApp/llamadas registradas a mano con botón "Registrar contacto"),
  **tareas del cliente**, **notas por evento**.
- Sidebar: foto/iniciales, resumen (primer/último contacto, # eventos, recurrente),
  acciones "Crear evento", "Registrar contacto", "Nueva tarea".
- Estado vacío del historial: "Sin eventos aún — creá el primero".

## 2.5 Eventos

### Lista/tabla (`/eventos`)
- Se conserva la tabla actual con motor real: ordenable, filtros por columna
  (etapa, tipo, estado de pago, rango de fechas), búsqueda por teléfono, cliente,
  personaje, lugar y estado (búsqueda server-side sobre relaciones).
- **Switch Tabla ⇄ Calendario** en el header de la página (estado en query param
  `?vista=tabla|calendario` para que sea compartible). Misma fuente de datos,
  mismos filtros activos: son dos proyecciones de lo mismo.

### Calendario (`/eventos?vista=calendario`)
Tres pestañas obligatorias (query `?rango=mes|semana|dia`):

- **Mes:** cuadrícula 7×5-6 propia. Cada día muestra hasta 3 **fichas compactas**
  (hora · cliente · personaje principal, color por etapa) + "+N más" que abre el
  panel del día. Días con conflicto de recursos llevan indicador de alerta.
- **Semana:** 7 columnas tipo agenda; cada evento es una **tarjeta operativa**
  (ver abajo) ordenada por hora — sin rejilla horaria (los eventos duran horas y
  son pocos por día; la rejilla desperdicia espacio).
- **Día:** lista de tarjetas operativas a ancho completo + huecos visibles entre
  horarios (para evaluar capacidad).

**Tarjeta operativa de evento** (contenido mínimo, en este orden):
hora y duración · nombre del cliente · teléfono (tap-to-call/WhatsApp) · tipo de
evento · badge de etapa · lugar (nombre + dirección corta) · personajes/servicios
principales · colaboradores asignados (iniciales) · badge de estado de pago ·
alertas (anticipo vence, sin colaborador asignado, conflicto).

**Temporadas festivas:** tabla de configuración simple (`docs` post-MVP o constante
en `app/lib/domain/seasons.ts`: Navidad, día del niño, graduaciones…). En vista mes
los días de temporada llevan una **banda superior de color tenue + etiqueta**
("Temporada navideña"); en semana/día, un encabezado de sección. Sin saturar:
solo color de fondo al 8% y texto pequeño.

**Preparación Google Calendar:** el calendario lee de un selector
`getCalendarEvents(range)` que devuelve un tipo `CalendarEntry` neutro; cuando
llegue la sincronización, las entradas externas se mapearán al mismo tipo. Los
campos `externalCalendarEventId`, `syncStatus`, `lastSyncedAt` ya existen en el modelo.

### Alta (`/eventos/nuevo`)
- Selector de cliente con búsqueda por teléfono/nombre (o "crear cliente nuevo" inline).
- Secciones: Cliente y embudo → Fecha y lugar → Personajes y servicios (selector
  desde catálogo con miniaturas) → Colaboradores (con disponibilidad visible).
- Validación: fecha obligatoria si la etapa inicial ≥ RESERVADO (raro pero posible
  al migrar históricos).

### Detalle (`/eventos/[id]`)
- Header: nombre, badges de etapa + pago, **botón de acción según etapa**
  (la transición válida siguiente: "Generar cotización", "Registrar anticipo"…).
- Pestañas o secciones: Datos generales · Personajes y servicios · **Colaboradores**
  (asignaciones con nota y calificación ★ por colaborador) · **Cotizaciones**
  (historial, la activa resaltada) · Reservación y pagos · **Notas internas**
  (timeline) · Tareas del evento.
- Calificación ★ del evento (1–5, opcional) visible en el header al estar REALIZADO.
- Conflictos: al asignar colaborador/personaje se muestra advertencia inline si hay
  solape de fecha/hora con otro evento.

## 2.6 Cotizaciones

### Lista (`/cotizaciones`)
Igual que hoy + filtros reales. Badge de estado (Borrador/Enviada/Aceptada/Vencida/
Rechazada). Columna "Vence" con resaltado si quedan ≤2 días.

### Flujo nueva cotización (`/cotizaciones/nueva?evento=<id>`)
Se conserva el workflow de 4 pasos existente, ahora funcional:
1. **Cliente** (o tomado del evento de origen).
2. **Evento** (fecha, lugar → dispara cálculo de transporte al confirmar dirección).
3. **Servicios**: paquete (opcional) + personajes del catálogo + servicios à la
   carte; el resumen lateral recalcula subtotal/descuentos/transporte en vivo.
4. **Revisión**: totales, vigencia (default 7 días), notas visibles, toggle factura
   (IVA 13%), referencia USD. Acciones: "Guardar borrador" · "Generar PDF y marcar
   enviada".
- Al generar: el CRM asigna el código `C{DDMM}-{YY}{seq}` (formato CorrespondencyBot,
  consecutivo anual desde 100; ej. `C1503-26101`), llama al puente con CorrespondencyBot,
  guarda `pdfUrl` y muestra el PDF con botón "Copiar mensaje de WhatsApp sugerido".

### Detalle (`/cotizaciones/[id]`)
- Acciones por estado: Enviada → "Marcar aceptada" (crea reservación y avanza evento
  a RESERVADO), "Marcar rechazada", "Re-cotizar" (clona como borrador, la anterior
  queda en historial). Vencida → "Renovar vigencia".

## 2.7 Reservaciones (`/reservaciones`, `/reservaciones/[id]`)

- Lista con estado de pago, fechas límite de anticipo/saldo (resaltado si ≤3 días).
- Detalle: totales acordados, **registro de pagos** (formulario monto/fecha/método;
  el sistema deduce anticipo vs. saldo), timeline de pagos, PDF de reservación
  (mismo puente Python con `tipo_documento: "Reservación"`).
- Registrar anticipo → evento pasa a CONFIRMADO automáticamente (con toast que lo
  explica). Registrar saldo → habilita "Marcar evento como realizado".

## 2.8 Colaboradores

### Lista (`/colaboradores`)
Como hoy + filtros reales; columna calificación promedio (★ o "Sin calificación").

### Perfil (`/colaboradores/[id]`)
- Sidebar: foto, rol, teléfono, personajes que interpreta (chips desde catálogo),
  activo/inactivo, **calificación promedio**.
- Principal: **Próximos eventos asignados** · **Eventos pasados** (con nota y ★ por
  evento) · **Últimos comentarios** (notas de asignación más recientes).
- Estado vacío: "Sin eventos asignados todavía".

## 2.9 Inventario y creador de paquetes (`/inventario`)

- Pestañas: **Paquetes** · **Servicios**.
- CRUD de paquetes con 3 precios (familiar/educativo/corporativo), duración, activo.
- CRUD de servicios (precio, tipo FIJO/POR_HORA/POR_UNIDAD, categoría, activo).
- **Creador de paquetes** (`/inventario/paquetes/nuevo`): layout de dos columnas —
  izquierda el catálogo navegable (búsqueda + filtro por categoría, miniaturas),
  derecha la composición del paquete (líneas con cantidad/horas, validación de
  paquete incompleto: nombre + ≥1 línea + 3 precios > 0).
- **Sin datos falsos**: estados vacíos guían a crear el primer paquete o a correr la
  migración desde Sheets (banner con enlace a la doc del seed).

## 2.10 Catálogo

- **Admin (`/catalogo-admin`):** CRUD de ítems (personaje/inflable/decoración/servicio),
  imagen principal + galería, tags, activo.
- **Público (`/catalogo`):** grid de tarjetas con foto, nombre, descripción corta;
  filtro por categoría y búsqueda por tag; **sin precios** (decisión a validar con
  negocio); footer con botón de WhatsApp. Sin login, layout propio, SEO básico.

## 2.11 Tareas (`/tareas`)

- Tabla de gestión: título, entidad asociada (chip clicable), vencimiento, origen
  (Manual/Automática/Sistema), estado, responsable.
- Filtros rápidos: "Hoy", "Vencidas", "Esta semana".
- Crear tarea manual desde aquí o desde cualquier detalle (cliente/evento/...).
- Las automáticas no se editan: se completan o se descartan (quedan auditadas).

## 2.12 Auditoría / actividad

- MVP: sección "Actividad reciente" en dashboard + pestaña "Actividad" en el
  detalle de evento y cliente (filtrada por entidad). Formato:
  "**Huberth** marcó *Cumpleaños de Sofía* como **Confirmado** · hace 2 h".
- No se construye pantalla dedicada de auditoría en el MVP (los datos sí se guardan
  completos desde el día uno).
