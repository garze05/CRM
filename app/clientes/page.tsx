import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { Button } from "../components/ui/button";
import { ClientsTable, type ClientRow } from "./clients-table";
import { listClients } from "../lib/server/clients";

export default async function ClientsPage() {
	const rows: ClientRow[] = await listClients();

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
				title='Clientes'
				description='Repositorio central de contactos. La relación vive aquí; el embudo se controla por evento.'
				actions={
					<Button asChild size='lg'>
						<Link href='/clientes/nuevo'>
							<IconLabel label='Nuevo cliente' />
						</Link>
					</Button>
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
