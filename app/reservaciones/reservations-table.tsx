"use client";

import {
	DataTable,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatCrc, formatDateKey } from "../lib/format";
import { PAYMENT_STATUS_LABELS } from "../lib/domain/labels";
import type { ReservationListRow } from "../lib/server/reservations";

export type ReservationRow = ReservationListRow;

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
		sortValue: row => row.eventName.toLocaleLowerCase("es"),
		render: row => row.eventName,
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
		sortValue: row => row.eventDate?.getTime() ?? 0,
		render: row => formatDateKey(row.eventDate),
	},
	{
		key: "payment",
		header: "Pago",
		filterValue: row => row.paymentStatus,
		filterLabel: value => PAYMENT_STATUS_LABELS[value] ?? value,
		render: row => (
			<StatusBadge
				value={row.paymentStatus}
				label={PAYMENT_STATUS_LABELS[row.paymentStatus]}
			/>
		),
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
				`${row.reservationNumber} ${row.quoteNumber} ${row.eventName} ${row.clientName}`
			}
			emptyTitle='Sin reservaciones todavía'
			emptyDescription='Las reservaciones se crean al aceptar una cotización.'
		/>
	);
}
