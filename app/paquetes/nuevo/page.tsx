import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { PackageBuilder } from "./package-builder";
import { inventoryItems } from "../../lib/mock-data";

export default function NewPackagePage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Paquetes y servicios", href: "/paquetes" },
					{ label: "Crear paquete" },
				]}
				title='Crear paquete'
				description='Componé un paquete desde el catálogo con precio por tipo de cliente.'
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
				<PackageBuilder catalog={inventoryItems} />
			</div>
		</>
	);
}
