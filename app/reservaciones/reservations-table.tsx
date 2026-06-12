"use client";

import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatCrc, formatDate, type EventRecord } from "../lib/mock-data";

export type ReservationRow = EventRecord & {
	clientName: string;
	quoteNumber: string;
	reservationNumber: string;
	advancePayment: number;
	balancePayment: number;
};

const columns: DataTableColumn<ReservationRow>[] = [
	{
		key: "reservation",
		header: "Reservación",
		sortValue: row => row.reservationNumber,
		render: row => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>
					{row.reservationNumber}
				</p>
				<p className='mt-1 text-base'>{row.quoteNumber}</p>
			</div>
		),
	},
	{
		key: "event",
		header: "Evento",
		sortValue: row => row.name.toLocaleLowerCase("es"),
		render: row => row.name,
	},
	{
		key: "client",
		header: "Cliente",
		sortValue: row => row.clientName.toLocaleLowerCase("es"),
		render: row => row.clientName,
	},
	{
		key: "date",
		header: "Fecha",
		sortValue: row => row.date,
		render: row => formatDate(row.date),
	},
	{
		key: "payment",
		header: "Pago",
		filterValue: row => row.paymentStatus,
		filterLabel: formatEnumLabel,
		render: row => <StatusBadge value={row.paymentStatus} />,
	},
	{
		key: "advance",
		header: "Anticipo",
		sortValue: row => row.advancePayment,
		render: row => (
			<span className='font-black text-[var(--text-primary)]'>
				{formatCrc(row.advancePayment)}
			</span>
		),
	},
	{
		key: "balance",
		header: "Saldo",
		sortValue: row => row.balancePayment,
		render: row => (
			<span className='font-black text-[var(--text-primary)]'>
				{formatCrc(row.balancePayment)}
			</span>
		),
	},
];

export function ReservationsTable({ rows }: { rows: ReservationRow[] }) {
	return (
		<DataTable
			tableId='reservaciones'
			columns={columns}
			rows={rows}
			searchLabel='Buscar reservación'
			searchPlaceholder='Código, cliente o evento'
			searchText={row =>
				`${row.reservationNumber} ${row.quoteNumber} ${row.name} ${row.clientName}`
			}
			emptyTitle='Sin reservaciones todavía'
			emptyDescription='Las reservaciones se crean al aceptar una cotización.'
		/>
	);
}
