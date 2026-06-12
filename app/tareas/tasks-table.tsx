"use client";

import Link from "next/link";
import {
	DataTable,
	formatEnumLabel,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import { formatDate, type TaskRecord } from "../lib/mock-data";

const columns: DataTableColumn<TaskRecord>[] = [
	{
		key: "title",
		header: "Tarea",
		width: "minmax(260px, 1.8fr)",
		sortValue: task => task.title.toLocaleLowerCase("es"),
		render: task => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>{task.title}</p>
				{task.description ? (
					<p className='mt-1 line-clamp-1 text-base'>{task.description}</p>
				) : null}
			</div>
		),
	},
	{
		key: "entity",
		header: "Asociada a",
		sortValue: task => task.entityLabel.toLocaleLowerCase("es"),
		render: task => (
			<Link
				href={task.entityHref}
				className='pointer-events-auto font-bold text-[var(--secondary-color)] underline-offset-2 hover:underline'
			>
				{task.entityLabel}
			</Link>
		),
	},
	{
		key: "dueDate",
		header: "Vence",
		sortValue: task => task.dueDate ?? "9999-12-31",
		render: task =>
			task.dueDate ? formatDate(task.dueDate) : "Sin fecha límite",
	},
	{
		key: "origin",
		header: "Origen",
		filterValue: task => task.origin,
		filterLabel: formatEnumLabel,
		render: task => <StatusBadge value={task.origin} />,
	},
	{
		key: "status",
		header: "Estado",
		filterValue: task => task.status,
		filterLabel: formatEnumLabel,
		render: task => <StatusBadge value={task.status} />,
	},
];

export function TasksTable({
	rows,
	initialStatus,
}: {
	rows: TaskRecord[];
	initialStatus?: string[];
}) {
	return (
		<DataTable
			tableId='tareas'
			columns={columns}
			rows={rows}
			searchLabel='Buscar tarea'
			searchPlaceholder='Título, cliente o evento'
			searchText={task =>
				`${task.title} ${task.description ?? ""} ${task.entityLabel}`
			}
			emptyTitle='Sin tareas todavía'
			emptyDescription='Las tareas manuales y los recordatorios automáticos aparecerán aquí.'
			initialFilters={initialStatus ? { status: initialStatus } : undefined}
		/>
	);
}
