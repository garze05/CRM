import Link from "next/link";
import { PageHeader } from "../../components/page-header";
import { listClientsForSelect } from "../../lib/server/events";
import { NewEventForm } from "./new-event-form";

export default async function NewEventPage({
	searchParams,
}: {
	searchParams: Promise<{ cliente?: string }>;
}) {
	const { cliente } = await searchParams;
	const clients = await listClientsForSelect();
	const selectedClientId = clients.some(client => client.id === cliente)
		? cliente
		: undefined;

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Eventos", href: "/eventos" },
					{ label: "Nuevo evento" },
				]}
				title='Nuevo evento'
				description='Nueva oportunidad vinculada a un cliente existente, con embudo propio para seguimiento y cotización.'
				actions={
					<Link
						href='/eventos'
						className='secondary-action flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
					>
						Volver a eventos
					</Link>
				}
			/>

			<div className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<NewEventForm clients={clients} selectedClientId={selectedClientId} />
			</div>
		</>
	);
}
