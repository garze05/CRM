import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../../components/page-header";
import { ServiceForm } from "../../service-form";
import {
	getServiceForEdit,
	listServiceCategories,
} from "../../../../lib/server/packages";

export default async function EditServicePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [service, categories] = await Promise.all([
		getServiceForEdit(id),
		listServiceCategories(),
	]);

	if (!service) notFound();

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Paquetes y servicios", href: "/paquetes?tab=servicios" },
					{ label: "Editar servicio" },
				]}
				title='Editar servicio'
				description={`Ajustá los datos y el precio de "${service.name}".`}
				actions={
					<Link
						href='/paquetes?tab=servicios'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a servicios
					</Link>
				}
			/>

			<div className='px-5 pb-28 md:px-8 md:pb-8'>
				<ServiceForm
					categories={categories}
					mode='edit'
					serviceId={service.id}
					initialValues={{
						name: service.name,
						category: service.category,
						unitPrice: String(service.unitPrice),
						priceType: service.priceType,
						active: service.active,
						standaloneSellable: service.standaloneSellable,
					}}
				/>
			</div>
		</>
	);
}
