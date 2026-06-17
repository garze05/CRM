"use client";

import { DeleteAction } from "../components/delete-action";
import {
	DataTable,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatCrc, formatDateKey } from "../lib/format";
import { QUOTE_STATUS_LABELS } from "../lib/domain/labels";

export type QuoteRow = {
	id: string;
	quoteNumber: string;
	eventName: string;
	clientName: string;
	status: string;
	total: number;
	validUntil: Date;
};

const columns: DataTableColumn<QuoteRow>[] = [
	{
		key: "number",
		header: "Cotización",
		sortValue: quote => quote.quoteNumber,
		render: quote => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>
					{quote.quoteNumber}
				</p>
				<p className='mt-1 text-base'>{quote.eventName}</p>
			</div>
		),
	},
	{
		key: "client",
		header: "Cliente",
		sortValue: quote => quote.clientName.toLocaleLowerCase("es"),
		render: quote => quote.clientName,
	},
	{
		key: "status",
		header: "Estado",
		filterValue: quote => quote.status,
		filterLabel: value => QUOTE_STATUS_LABELS[value] ?? value,
		render: quote => (
			<StatusBadge
				value={quote.status}
				label={QUOTE_STATUS_LABELS[quote.status]}
			/>
		),
	},
	{
		key: "total",
		header: "Total",
		sortValue: quote => quote.total,
		render: quote => (
			<span className='font-black text-[var(--text-primary)]'>
				{formatCrc(quote.total)}
			</span>
		),
	},
	{
		key: "validUntil",
		header: "Vigencia",
		sortValue: quote => quote.validUntil.getTime(),
		render: quote => formatDateKey(quote.validUntil),
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: quote => (
			<DeleteAction entityType='Quote' id={quote.id} returnTo='/cotizaciones' />
		),
	},
];

export function QuotesTable({ rows }: { rows: QuoteRow[] }) {
	return (
		<DataTable
			tableId='cotizaciones'
			columns={columns}
			rows={rows}
			rowHref={quote => `/cotizaciones/${quote.id}`}
			searchLabel='Buscar cotización'
			searchPlaceholder='Código, cliente o evento'
			searchText={quote =>
				`${quote.quoteNumber} ${quote.clientName} ${quote.eventName}`
			}
			emptyTitle='Sin cotizaciones todavía'
			emptyDescription='Generá la primera cotización desde un evento contactado.'
		/>
	);
}
