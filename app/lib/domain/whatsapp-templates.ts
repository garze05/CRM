// Mensajes sugeridos de WhatsApp — PLACEHOLDERS.
//
// ⚠️ PENDIENTE DE NEGOCIO (decisión 2026-06-11): la redacción y el tono de
// estas plantillas las escribe el equipo de OkiDoki, no el desarrollador.
// Reemplazar cada texto marcado [PENDIENTE NEGOCIO] antes de lanzar el MVP.
//
// Variables disponibles: {{cliente}} {{evento}} {{fecha}} {{total}} {{vigencia}}
// (se interpolan con renderWhatsappTemplate al copiar el mensaje).

export type WhatsappTemplateId =
  | "QUOTE_FOLLOWUP_72H"
  | "DEPOSIT_REMINDER"
  | "REACTIVATION"
  | "POST_EVENT";

export const WHATSAPP_TEMPLATES: Record<
  WhatsappTemplateId,
  { label: string; body: string }
> = {
  QUOTE_FOLLOWUP_72H: {
    label: "Seguimiento de cotización (72 h sin respuesta)",
    body: "[PENDIENTE NEGOCIO] Hola {{cliente}}, te escribimos de OkiDoki sobre la cotización de {{evento}}. Sigue vigente hasta el {{vigencia}}. ¿Te gustaría confirmar o ajustar algo?",
  },
  DEPOSIT_REMINDER: {
    label: "Recordatorio de anticipo",
    body: "[PENDIENTE NEGOCIO] Hola {{cliente}}, te recordamos que el anticipo de {{total}} para {{evento}} vence pronto. Con el anticipo dejamos tu fecha confirmada.",
  },
  REACTIVATION: {
    label: "Reactivación de cliente",
    body: "[PENDIENTE NEGOCIO] Hola {{cliente}}, ¡saludos de OkiDoki! Hace un tiempo celebramos {{evento}} con ustedes. ¿Se acerca alguna fecha especial en la que podamos ayudarte?",
  },
  POST_EVENT: {
    label: "Seguimiento post-evento",
    body: "[PENDIENTE NEGOCIO] Hola {{cliente}}, ¡gracias por celebrar con OkiDoki! Nos encantaría saber cómo les fue en {{evento}}.",
  },
};

export function renderWhatsappTemplate(
  id: WhatsappTemplateId,
  vars: Partial<Record<"cliente" | "evento" | "fecha" | "total" | "vigencia", string>>,
): string {
  return WHATSAPP_TEMPLATES[id].body.replace(
    /\{\{(\w+)\}\}/g,
    (match, key: string) => vars[key as keyof typeof vars] ?? match,
  );
}
