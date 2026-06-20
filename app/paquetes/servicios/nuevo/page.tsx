import Link from "next/link";
import { PageHeader } from "../../../components/page-header";
import { ServiceForm } from "../service-form";
import { listServiceCategories } from "../../../lib/server/packages";

export default async function NewServicePage() {
	const categories = await listServiceCategories();

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Paquetes y servicios", href: "/paquetes?tab=servicios" },
					{ label: "Crear servicio" },
				]}
				title='Crear servicio'
				description='Servicio adicional para armar paquetes o vender suelto.'
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
				<ServiceForm categories={categories} />
			</div>
		</>
	);
}
