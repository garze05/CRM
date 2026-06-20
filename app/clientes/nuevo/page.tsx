import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { NewClientForm } from "./new-client-form";

export default function NewClientPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Clientes", href: "/clientes" },
					{ label: "Nuevo cliente" },
				]}
				title='Nuevo cliente'
				description='Alta rápida para prospectos que llegan por WhatsApp o llamada.'
				actions={
					<Link
						href='/clientes'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a clientes
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<NewClientForm />
			</div>
		</>
	);
}
