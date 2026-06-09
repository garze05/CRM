import Link from "next/link";
import { Breadcrumb } from "../components/breadcrumb";
import { CrmShell } from "../components/crm-shell";
import { IconLabel } from "../components/icon-label";
import { ManagementTable, type ManagementColumn } from "../components/management-table";
import { StatusBadge } from "../components/status-badge";
import {
	events,
	formatCrc,
	formatDate,
	getEventClient,
	suggestedQuote,
	type EventRecord,
} from "../lib/mock-data";

type QuoteRow = {
	id: string;
	number: string;
	event: EventRecord;
	status: "BORRADOR" | "ENVIADA" | "ACEPTADA";
	total: number;
	validUntil: string;
};

const quoteRows: QuoteRow[] = events
	.filter(event =>
		["COTIZADO", "RESERVADO", "CONFIRMADO"].includes(event.pipelineStatus),
	)
	.map((event, index) => ({
		id: `cotizacion-${event.id}`,
		number:
			index === 0
				? suggestedQuote.number
				: `COT-2026-${String(44 + index).padStart(4, "0")}`,
		event,
		status:
			event.pipelineStatus === "COTIZADO"
				? "ENVIADA"
				: event.pipelineStatus === "RESERVADO"
					? "ACEPTADA"
					: "BORRADOR",
		total: event.estimatedTotal,
		validUntil: event.date,
	}));

const columns: ManagementColumn<QuoteRow>[] = [
	{
		key: "number",
		header: "Cotización",
		render: quote => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>{quote.number}</p>
				<p className='mt-1 text-base'>{quote.event.name}</p>
			</div>
		),
	},
	{
		key: "client",
		header: "Cliente",
		render: quote => {
			const client = getEventClient(quote.event);

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
];

export default function QuotesPage() {
	return (
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Cotizaciones" },
							]}
						/>
						<h1 className='page-heading'>Cotizaciones</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Control de cotizaciones emitidas, aceptadas y pendientes de
							seguimiento.
						</p>
					</div>
					<Link
						href='/cotizaciones/nueva'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nueva cotización' />
					</Link>
				</div>
			</header>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Buscar cotización</span>
							<input
								placeholder='Número, cliente o evento'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select className='form-control'>
								<option>Todos</option>
								<option>Borrador</option>
								<option>Enviada</option>
								<option>Aceptada</option>
								<option>Vencida</option>
							</select>
						</label>
					</div>

					<ManagementTable columns={columns} rows={quoteRows} />
				</section>
			</div>
		</CrmShell>
	);
}
