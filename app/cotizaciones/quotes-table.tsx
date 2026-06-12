"use client";

import { DeleteAction } from "../components/delete-action";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatCrc, formatDate, type QuoteRecord } from "../lib/mock-data";

export type QuoteRow = QuoteRecord & {
	eventName: string;
	clientName: string;
};

const columns: DataTableColumn<QuoteRow>[] = [
	{
		key: "number",
		header: "Cotización",
		sortValue: quote => quote.number,
		render: quote => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>{quote.number}</p>
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
		filterLabel: formatEnumLabel,
		render: quote => <StatusBadge value={quote.status} />,
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
		sortValue: quote => quote.validUntil,
		render: quote => formatDate(quote.validUntil),
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: () => <DeleteAction />,
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
				`${quote.number} ${quote.clientName} ${quote.eventName}`
			}
			emptyTitle='Sin cotizaciones todavía'
			emptyDescription='Generá la primera cotización desde un evento contactado.'
		/>
	);
}
