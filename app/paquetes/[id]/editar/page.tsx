import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../components/page-header";
import { PackageBuilder } from "../../nuevo/package-builder";
import { listActiveCatalogItems } from "../../../lib/server/catalog";
import { getPackageForEdit } from "../../../lib/server/packages";

export default async function EditPackagePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [pkg, inventoryItems] = await Promise.all([
		getPackageForEdit(id),
		listActiveCatalogItems(),
	]);

	if (!pkg) notFound();

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
					catalog={inventoryItems}
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
