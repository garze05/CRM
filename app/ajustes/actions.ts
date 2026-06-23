"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "../lib/server/settings";

function num(formData: FormData, key: string, fallback = 0): number {
	const raw = String(formData.get(key) ?? "").trim();
	const n = Number(raw);
	return Number.isFinite(n) ? n : fallback;
}

function str(formData: FormData, key: string): string {
	return String(formData.get(key) ?? "").trim();
}

function coordinate(formData: FormData, key: string): number | null {
	const raw = str(formData, key);
	if (!raw) return null;
	const n = Number(raw);
	return Number.isFinite(n) ? n : null;
}

export type SettingsState = { ok?: boolean; error?: string };

export async function updateSettingsAction(
	_prev: SettingsState,
	formData: FormData,
): Promise<SettingsState> {
	try {
		await updateSettings({
			currency: str(formData, "currency") || "CRC",
			timezone: str(formData, "timezone") || "America/Costa_Rica",
			quoteValidityDays: num(formData, "quoteValidityDays", 7),
			depositPercent: num(formData, "depositPercent", 50),
			depositLeadTimeDays: num(formData, "depositLeadTimeDays", 14),
			// El IVA se ingresa en porcentaje (13) y se guarda como fracción (0.13).
			taxRate: num(formData, "taxRatePercent", 13) / 100,
			transportBasePrice: num(formData, "transportBasePrice"),
			transportRatePerKm: num(formData, "transportRatePerKm"),
			transportFreeKm: num(formData, "transportFreeKm"),
			transportOriginAddress: str(formData, "transportOriginAddress"),
			transportOriginLat: coordinate(formData, "transportOriginLat"),
			transportOriginLng: coordinate(formData, "transportOriginLng"),
			quantityDiscountPercent: num(formData, "quantityDiscountPercent"),
			hoursDiscountPercent: num(formData, "hoursDiscountPercent"),
			hoursDiscountMinHours: num(formData, "hoursDiscountMinHours"),
			maxDiscountPercent: num(formData, "maxDiscountPercent"),
			surchargeEducationalPercent: num(formData, "surchargeEducationalPercent"),
			surchargeCorporatePercent: num(formData, "surchargeCorporatePercent"),
			surchargeShoppingCenterPercent: num(
				formData,
				"surchargeShoppingCenterPercent",
			),
			surchargeAgencyPercent: num(formData, "surchargeAgencyPercent"),
		});
		revalidatePath("/ajustes");
		return { ok: true };
	} catch (error) {
		console.error("updateSettingsAction", error);
		return { error: "No se pudieron guardar los ajustes. Intentá de nuevo." };
	}
}
