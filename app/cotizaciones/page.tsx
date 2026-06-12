import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { QuotesTable, type QuoteRow } from "./quotes-table";
import { getEventClient, getQuoteEvent, quotes } from "../lib/mock-data";

export default function QuotesPage() {
	const rows: QuoteRow[] = quotes.map(quote => {
		const event = getQuoteEvent(quote);
		const client = event ? getEventClient(event) : undefined;

		return {
			...quote,
			eventName: event?.name ?? "Sin evento",
			clientName: client
				? `${client.firstName} ${client.lastName}`
				: "Sin cliente",
		};
	});

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Cotizaciones" }]}
				title='Cotizaciones'
				description='Control de cotizaciones emitidas, aceptadas y pendientes de seguimiento.'
				actions={
					<Link
						href='/cotizaciones/nueva'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nueva cotización' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<QuotesTable rows={rows} />
				</SectionCard>
			</div>
		</>
	);
}
