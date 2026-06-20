// Mensajes sugeridos de WhatsApp según la guía comercial de OkiDoki.
//
// Variables disponibles: {{cliente}} {{evento}} {{fecha}} {{total}} {{vigencia}}
// (se interpolan con renderWhatsappTemplate al copiar el mensaje).

export type WhatsappTemplateId =
  | "INSTANT_QUALIFICATION"
  | "PACKAGE_RECOMMENDATION"
  | "CLOSE_WITH_DEPOSIT"
  | "QUOTE_FOLLOWUP_24H"
  | "QUOTE_FOLLOWUP_72H"
  | "QUOTE_FOLLOWUP_7D"
  | "DEPOSIT_REMINDER"
  | "REACTIVATION"
  | "POST_EVENT";

export const WHATSAPP_TEMPLATES: Record<
  WhatsappTemplateId,
  { label: string; body: string }
> = {
  INSTANT_QUALIFICATION: {
    label: "Respuesta instantánea",
    body: "¡Hola! 🎉 Gracias por escribirnos a OkiDoki. Con gusto te ayudamos a armar la fiesta perfecta 🥳 Para recomendarte lo mejor, contame: ¿para qué fecha sería y qué edad cumple el festejado/a?",
  },
  PACKAGE_RECOMMENDATION: {
    label: "Recomendar paquete",
    body: "Perfecto 🙌 Para una fiesta así, lo que más nos piden y lo que mejor funciona es el paquete completo: animador profesional + botarga + inflable, con música y todo el show. Los chiquitos la pasan increíble y vos te despreocupás de entretenerlos. Te paso un video cortito de cómo se ve 👇",
  },
  CLOSE_WITH_DEPOSIT: {
    label: "Cierre con anticipo",
    body: "Para esa fecha todavía tengo el espacio libre, pero los fines de semana se nos ocupan rápido. Si querés te la aparto de una. Para reservar se hace un anticipo de {{total}} y el resto el día del evento. ¿Te aparto la fecha?",
  },
  QUOTE_FOLLOWUP_24H: {
    label: "Toque 1 — al día siguiente",
    body: "¡Hola {{cliente}}! 😊 ¿Te quedó alguna duda sobre el paquete para {{evento}}? Con gusto te ayudo con lo que necesités 🎉",
  },
  QUOTE_FOLLOWUP_72H: {
    label: "Toque 2 — prioridad por fecha",
    body: "¡Hola! Solo para avisarte que me preguntaron por la fecha del {{fecha}} 👀 Antes de apartarla, quería darte la prioridad a vos. ¿La reservamos?",
  },
  QUOTE_FOLLOWUP_7D: {
    label: "Toque 3 — cierre suave",
    body: "¡Hola {{cliente}}! No quiero ser insistente 😅 Solo para cerrar: ¿seguimos con {{evento}} o lo dejamos para otra ocasión? Cualquiera está bien, es para liberar la fecha si no 🙌",
  },
  DEPOSIT_REMINDER: {
    label: "Recordatorio de anticipo",
    body: "¡Hola {{cliente}}! Te recuerdo que el anticipo de {{total}} para {{evento}} deja tu fecha confirmada. Apenas lo recibimos, la apartamos de una.",
  },
  REACTIVATION: {
    label: "Reactivación de cliente",
    body: "¡Hola {{cliente}}! ¡Saludos de OkiDoki! Hace un tiempo celebramos {{evento}} con ustedes. ¿Se acerca alguna fecha especial en la que podamos ayudarte?",
  },
  POST_EVENT: {
    label: "Seguimiento post-evento",
    body: "¡Hola {{cliente}}! ¡Gracias por celebrar con OkiDoki! Nos encantaría saber cómo les fue en {{evento}}.",
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
