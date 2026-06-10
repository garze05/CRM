import Link from "next/link";
import { Breadcrumb } from "../components/breadcrumb";
import { DeleteAction } from "../components/delete-action";
import { IconLabel } from "../components/icon-label";
import { ManagementTable, type ManagementColumn } from "../components/management-table";
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

					<ManagementTable
						columns={columns}
						rows={quotes}
						rowHref={quote => `/cotizaciones/${quote.id}`}
					/>
				</section>
			</div>
		</>
	);
}
