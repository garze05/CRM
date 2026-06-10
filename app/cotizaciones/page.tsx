import Link from "next/link";
import { DeleteAction } from "../components/delete-action";
import { IconLabel } from "../components/icon-label";
import { ListFilters } from "../components/list-filters";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import {
	formatCrc,
	formatDate,
	getEventClient,
	getQuoteEvent,
	quotes,
	type QuoteRecord,
} from "../lib/mock-data";

const columns: ManagementColumn<QuoteRecord>[] = [
	{
		key: "number",
		header: "Cotización",
		render: quote => {
			const event = getQuoteEvent(quote);

			return (
				<div>
					<p className='font-black text-[var(--text-primary)]'>{quote.number}</p>
					<p className='mt-1 text-base'>{event?.name ?? "Sin evento"}</p>
				</div>
			);
		},
	},
	{
		key: "client",
		header: "Cliente",
		render: quote => {
			const event = getQuoteEvent(quote);
			const client = event ? getEventClient(event) : undefined;

			return client ? `${client.firstName} ${client.lastName}` : "Sin cliente";
		},
	},
	{
		key: "status",
		header: "Estado",
		render: quote => <StatusBadge value={quote.status} />,
	},
	{
		key: "total",
		header: "Total",
		render: quote => (
			<span className='font-black text-[var(--text-primary)]'>
				{formatCrc(quote.total)}
			</span>
		),
	},
	{
		key: "validUntil",
		header: "Vigencia",
		render: quote => formatDate(quote.validUntil),
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: () => <DeleteAction />,
	},
];

export default function QuotesPage() {
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
					<ListFilters
						searchLabel='Buscar cotización'
						searchPlaceholder='Número, cliente o evento'
						selectLabel='Estado'
						selectOptions={[
							{ label: "Todos" },
							{ label: "Borrador" },
							{ label: "Enviada" },
							{ label: "Aceptada" },
							{ label: "Vencida" },
						]}
					/>

					<ManagementTable
						columns={columns}
						rows={quotes}
						rowHref={quote => `/cotizaciones/${quote.id}`}
					/>
				</SectionCard>
			</div>
		</>
	);
}
