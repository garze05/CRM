"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eventSchema } from "../lib/validation/event";
import { createEvent } from "../lib/server/events";

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
