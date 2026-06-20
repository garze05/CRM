import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../components/page-header";
import { PackageBuilder } from "../../nuevo/package-builder";
import {
	getPackageForEdit,
	listPackageBuilderEntries,
} from "../../../lib/server/packages";
import { getSettings } from "../../../lib/server/settings";

export default async function EditPackagePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [pkg, entries, settings] = await Promise.all([
		getPackageForEdit(id),
		listPackageBuilderEntries(),
		getSettings(),
	]);

	if (!pkg) notFound();

	const builderSettings = {
		quantityDiscountPercent: Number(settings.quantityDiscountPercent),
		hoursDiscountPercent: Number(settings.hoursDiscountPercent),
		hoursDiscountMinHours: Number(settings.hoursDiscountMinHours),
		maxDiscountPercent: Number(settings.maxDiscountPercent),
		priceRoundingTo: settings.priceRoundingTo,
	};

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Paquetes y servicios", href: "/paquetes" },
					{ label: "Editar paquete" },
				]}
				title='Editar paquete'
				description={`Ajustá la composición y los precios de "${pkg.name}".`}
				actions={
					<Link
						href='/paquetes'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a paquetes
					</Link>
				}
			/>

			<div className='px-5 pb-28 md:px-8 md:pb-8'>
				<PackageBuilder
					entries={entries}
					settings={builderSettings}
					mode='edit'
					packageId={pkg.id}
					initialLines={pkg.lines}
					initialValues={{
						name: pkg.name,
						durationHours: String(pkg.durationHours),
						basePrice: String(pkg.basePrice),
						active: pkg.active,
					}}
				/>
			</div>
		</>
	);
}
