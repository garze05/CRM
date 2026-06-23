"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventSchema } from "../lib/validation/event";
import { createEvent, updateEvent } from "../lib/server/events";
import { recordActivity } from "../lib/server/activity";

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

function coordinate(formData: FormData, key: string): number | null {
	const raw = String(formData.get(key) ?? "").trim();
	if (!raw) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}

export type NewEventState = {
	error?: string;
	fieldErrors?: Partial<
		Record<
			| "clientId"
			| "name"
			| "eventType"
			| "funnelStage"
			| "eventDate"
			| "guestCount"
			| "honoreeAge",
			string
		>
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
			guestCount: String(formData.get("guestCount") ?? ""),
			honoreeName: String(formData.get("honoreeName") ?? ""),
			honoreeAge: String(formData.get("honoreeAge") ?? ""),
			partyTheme: String(formData.get("partyTheme") ?? ""),
			venueName: String(formData.get("venueName") ?? ""),
			venueAddress: String(formData.get("venueAddress") ?? ""),
			venueLat: String(formData.get("venueLat") ?? ""),
			venueLng: String(formData.get("venueLng") ?? ""),
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
					key === "eventDate" ||
					key === "guestCount" ||
					key === "honoreeAge"
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
		const guestCount = parsed.data.guestCount
			? Number(parsed.data.guestCount)
			: null;
		if (guestCount !== null && (Number.isNaN(guestCount) || guestCount < 0)) {
			return {
				fieldErrors: {
					guestCount: "La cantidad de chiquitos debe ser positiva.",
				},
				values: raw,
			};
		}
		const honoreeAge = parsed.data.honoreeAge
			? Number(parsed.data.honoreeAge)
			: null;
		if (honoreeAge !== null && (Number.isNaN(honoreeAge) || honoreeAge < 0)) {
			return {
				fieldErrors: { honoreeAge: "La edad del festejado debe ser positiva." },
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
			guestCount,
			honoreeName: parsed.data.honoreeName || null,
			honoreeAge,
			partyTheme: parsed.data.partyTheme || null,
			venueName: parsed.data.venueName || null,
			venueAddress: parsed.data.venueAddress || null,
			venueLat: coordinate(formData, "venueLat"),
			venueLng: coordinate(formData, "venueLng"),
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
	const honoreeAgeRaw = String(formData.get("honoreeAge") ?? "").trim();
	const honoreeAge = honoreeAgeRaw ? Number(honoreeAgeRaw) : null;
	if (honoreeAge !== null && (Number.isNaN(honoreeAge) || honoreeAge < 0)) {
		return { error: "La edad del festejado debe ser un número positivo." };
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
			honoreeName: String(formData.get("honoreeName") ?? "").trim() || null,
			honoreeAge,
			partyTheme: String(formData.get("partyTheme") ?? "").trim() || null,
			venueName: String(formData.get("venueName") ?? "").trim() || null,
			venueAddress: String(formData.get("venueAddress") ?? "") || null,
			venueLat: coordinate(formData, "venueLat"),
			venueLng: coordinate(formData, "venueLng"),
		internalNotes: String(formData.get("internalNotes") ?? "") || null,
	});

	if (!result.ok) return { error: result.error };

	await recordActivity({
		action: "event.updated",
		entityType: "Event",
		entityId: id,
		summary: `actualizó evento ${name}`,
	});

	revalidatePath(`/eventos/${id}`);
	revalidatePath("/eventos");
	revalidatePath("/");
	return { ok: true };
}
