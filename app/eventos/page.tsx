import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { EventsTable, type EventRow } from "./events-table";
import { events, getEventClient } from "../lib/mock-data";

export default async function EventsPage({
	searchParams,
}: {
	searchParams: Promise<{ etapa?: string }>;
}) {
	const { etapa } = await searchParams;

	const rows: EventRow[] = events.map(event => {
		const client = getEventClient(event);

		return {
			...event,
			clientName: client
				? `${client.firstName} ${client.lastName}`
				: "Sin cliente",
			clientPhone: client?.phone ?? "",
		};
	});

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Eventos" }]}
				title='Eventos'
				description='Seguimiento de eventos cotizados, reservados, confirmados y realizados.'
				actions={
					<Link
						href='/eventos/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo evento' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<EventsTable rows={rows} initialStage={etapa} />
				</SectionCard>
			</div>
		</>
	);
}
