"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventSchema } from "../lib/validation/event";
import { createEvent, updateEvent } from "../lib/server/events";

const ALL_FUNNEL_STAGES = [
	"PROSPECT",
	"CONTACTED",
	"QUOTED",
	"RESERVED",
	"CONFIRMED",
	"COMPLETED",
	"CANCELED",
];
const ALL_EVENT_TYPES = ["CHILDREN", "CORPORATE", "INSTITUTIONAL"];

export type NewEventState = {
	error?: string;
	fieldErrors?: Partial<
		Record<"clientId" | "name" | "eventType" | "funnelStage" | "eventDate", string>
	>;
	values?: Record<string, string>;
};

export async function createEventAction(
	_prevState: NewEventState,
	formData: FormData,
): Promise<NewEventState> {
	const raw = {
		clientId: String(formData.get("clientId") ?? ""),
		name: String(formData.get("name") ?? ""),
		eventType: String(formData.get("eventType") ?? ""),
		funnelStage: String(formData.get("funnelStage") ?? ""),
		eventDate: String(formData.get("eventDate") ?? ""),
		startTime: String(formData.get("startTime") ?? ""),
		durationHours: String(formData.get("durationHours") ?? ""),
		venueName: String(formData.get("venueName") ?? ""),
		venueAddress: String(formData.get("venueAddress") ?? ""),
		venueType: String(formData.get("venueType") ?? ""),
	};

	const parsed = eventSchema.safeParse(raw);
	if (!parsed.success) {
		const fieldErrors: NewEventState["fieldErrors"] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0];
			if (
				key === "clientId" ||
				key === "name" ||
				key === "eventType" ||
				key === "funnelStage" ||
				key === "eventDate"
			) {
				fieldErrors[key] = issue.message;
			}
		}
		return { fieldErrors, values: raw };
	}

	const duration = parsed.data.durationHours
		? Number(parsed.data.durationHours)
		: null;
	if (duration !== null && (Number.isNaN(duration) || duration <= 0)) {
		return {
			fieldErrors: undefined,
			error: "La duración debe ser un número de horas positivo.",
			values: raw,
		};
	}

	const result = await createEvent({
		clientId: parsed.data.clientId,
		name: parsed.data.name,
		eventType: parsed.data.eventType,
		funnelStage: parsed.data.funnelStage,
		eventDate: parsed.data.eventDate || null,
		startTime: parsed.data.startTime || null,
		durationHours: duration,
		venueName: parsed.data.venueName || null,
		venueAddress: parsed.data.venueAddress || null,
		venueType: parsed.data.venueType || null,
	});

	if (!result.ok) {
		return { error: result.error, values: raw };
	}

	revalidatePath("/eventos");
	redirect(`/eventos/${result.id}`);
}

export type UpdateEventState = { error?: string; ok?: boolean };

export async function updateEventAction(
	_prevState: UpdateEventState,
	formData: FormData,
): Promise<UpdateEventState> {
	const id = String(formData.get("id") ?? "");
	const clientId = String(formData.get("clientId") ?? "");
	const name = String(formData.get("name") ?? "").trim();
	const eventType = String(formData.get("eventType") ?? "");
	const funnelStage = String(formData.get("funnelStage") ?? "");
	const guestCountRaw = String(formData.get("guestCount") ?? "").trim();

	if (!id) return { error: "Evento inválido." };
	if (!clientId) return { error: "Seleccioná un cliente." };
	if (!name) return { error: "El nombre del evento es obligatorio." };
	if (!ALL_EVENT_TYPES.includes(eventType)) {
		return { error: "Tipo de evento inválido." };
	}
	if (!ALL_FUNNEL_STAGES.includes(funnelStage)) {
		return { error: "Estado del embudo inválido." };
	}
	const guestCount = guestCountRaw ? Number(guestCountRaw) : null;
	if (guestCount !== null && (Number.isNaN(guestCount) || guestCount < 0)) {
		return { error: "El número de invitados debe ser positivo." };
	}

	const result = await updateEvent({
		id,
		clientId,
		name,
		eventType,
		funnelStage,
		eventDate: String(formData.get("eventDate") ?? "") || null,
		startTime: String(formData.get("startTime") ?? "") || null,
		guestCount,
		venueAddress: String(formData.get("venueAddress") ?? "") || null,
		internalNotes: String(formData.get("internalNotes") ?? "") || null,
	});

	if (!result.ok) return { error: result.error };

	revalidatePath(`/eventos/${id}`);
	revalidatePath("/eventos");
	return { ok: true };
}
