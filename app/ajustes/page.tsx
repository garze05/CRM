import { PageHeader } from "../components/page-header";
import { getSettings } from "../lib/server/settings";
import { SettingsForm, type SettingsFormValues } from "./settings-form";

export default async function SettingsPage() {
	const settings = await getSettings();

	const values: SettingsFormValues = {
		currency: settings.currency,
		timezone: settings.timezone,
		quoteValidityDays: settings.quoteValidityDays,
		depositPercent: Number(settings.depositPercent),
		depositLeadTimeDays: settings.depositLeadTimeDays,
		taxRatePercent: Number(settings.taxRate) * 100,
		transportOriginAddress: settings.transportOriginAddress,
		transportBasePrice: Number(settings.transportBasePrice),
		transportRatePerKm: Number(settings.transportRatePerKm),
		transportFreeKm: settings.transportFreeKm,
		quantityDiscountPercent: Number(settings.quantityDiscountPercent),
		hoursDiscountPercent: Number(settings.hoursDiscountPercent),
		hoursDiscountMinHours: Number(settings.hoursDiscountMinHours),
		maxDiscountPercent: Number(settings.maxDiscountPercent),
		surchargeEducationalPercent: Number(settings.surchargeEducationalPercent),
		surchargeCorporatePercent: Number(settings.surchargeCorporatePercent),
		surchargeShoppingCenterPercent: Number(
			settings.surchargeShoppingCenterPercent,
		),
		surchargeAgencyPercent: Number(settings.surchargeAgencyPercent),
	};

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Ajustes" }]}
				title='Ajustes'
				description='Configuración del negocio: cotizaciones, transporte, descuentos y recargos.'
			/>

			<SettingsForm values={values} />
		</>
	);
}
