// Servicio server-side de la configuración del negocio (fila única de Settings).
// Estos valores alimentan el cálculo de cotizaciones (transporte, IVA, anticipo)
// y las reglas de descuento/recargo heredadas de REGLAS_DESCUENTO del Sheets.
import "server-only";
import { prisma } from "../db";

/** Devuelve la fila de configuración, creándola con defaults si no existe. */
export async function getSettings() {
	const existing = await prisma.settings.findFirst();
	if (existing) return existing;
	return prisma.settings.create({ data: {} });
}

export type Settings = Awaited<ReturnType<typeof getSettings>>;

/** Campos numéricos/textuales editables desde /ajustes. */
export type SettingsUpdate = {
	currency: string;
	timezone: string;
	quoteValidityDays: number;
	depositPercent: number;
	depositLeadTimeDays: number;
	taxRate: number;
	transportBasePrice: number;
	transportRatePerKm: number;
	transportFreeKm: number;
	transportOriginAddress: string;
	transportOriginLat: number | null;
	transportOriginLng: number | null;
	quantityDiscountPercent: number;
	hoursDiscountPercent: number;
	hoursDiscountMinHours: number;
	maxDiscountPercent: number;
	surchargeEducationalPercent: number;
	surchargeCorporatePercent: number;
	surchargeShoppingCenterPercent: number;
	surchargeAgencyPercent: number;
};

export async function updateSettings(data: SettingsUpdate): Promise<void> {
	const current = await getSettings();
	await prisma.settings.update({
		where: { id: current.id },
		data,
	});
}
