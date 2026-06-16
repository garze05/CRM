"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientSchema } from "../lib/validation/client";
import { normalizePhone } from "../lib/validation/phone";
import { createClient } from "../lib/server/clients";

export type NewClientState = {
	error?: string;
	fieldErrors?: Partial<Record<"firstName" | "lastName" | "phone" | "type", string>>;
	values?: {
		firstName: string;
		lastName: string;
		phone: string;
		type: string;
		notes: string;
	};
};

export async function createClientAction(
	_prevState: NewClientState,
	formData: FormData,
): Promise<NewClientState> {
	const raw = {
		firstName: String(formData.get("firstName") ?? ""),
		lastName: String(formData.get("lastName") ?? ""),
		phone: String(formData.get("phone") ?? ""),
		type: String(formData.get("type") ?? ""),
		notes: String(formData.get("notes") ?? ""),
	};

	const parsed = clientSchema.safeParse({
		firstName: raw.firstName,
		lastName: raw.lastName,
		phone: raw.phone,
		type: raw.type,
		notes: raw.notes,
	});

	if (!parsed.success) {
		const fieldErrors: NewClientState["fieldErrors"] = {};
		for (const issue of parsed.error.issues) {
			const key = issue.path[0];
			if (
				key === "firstName" ||
				key === "lastName" ||
				key === "phone" ||
				key === "type"
			) {
				fieldErrors[key] = issue.message;
			}
		}
		return { fieldErrors, values: raw };
	}

	const normalized = normalizePhone(parsed.data.phone, "CR");
	if (!normalized) {
		return {
			fieldErrors: { phone: "Número de teléfono inválido" },
			values: raw,
		};
	}

	const result = await createClient({
		firstName: parsed.data.firstName,
		lastName: parsed.data.lastName,
		phone: normalized.e164,
		phoneCountry: normalized.country,
		phoneFormatted: normalized.formatted,
		type: parsed.data.type,
		notes: parsed.data.notes,
	});

	if (!result.ok) {
		return {
			fieldErrors: result.field ? { [result.field]: result.error } : undefined,
			error: result.field ? undefined : result.error,
			values: raw,
		};
	}

	revalidatePath("/clientes");
	redirect(`/clientes/${result.id}`);
}
