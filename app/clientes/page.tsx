import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { ClientsTable, type ClientRow } from "./clients-table";
import { listClients } from "../lib/server/clients";

export default async function ClientsPage() {
	const rows: ClientRow[] = await listClients();

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
				title='Clientes'
				description='Repositorio central de contactos para WhatsApp, seguimiento y cotizaciones.'
				actions={
					<Link
						href='/clientes/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo cliente' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<ClientsTable rows={rows} />
				</SectionCard>
			</div>
		</>
	);
}
