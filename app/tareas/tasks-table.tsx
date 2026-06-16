"use client";

import Link from "next/link";
import {
	DataTable,
	type DataTableColumn,
} from "../components/data-table/data-table";
import { StatusBadge } from "../components/status-badge";
import {
	TASK_ORIGIN_LABELS,
	TASK_STATUS_LABELS,
} from "../lib/domain/labels";
import type { TaskItem } from "../lib/server/tasks";

function formatDue(date: Date | null) {
	if (!date) return "Sin fecha límite";
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

const columns: DataTableColumn<TaskItem>[] = [
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
		sortValue: task => (task.entityLabel ?? "").toLocaleLowerCase("es"),
		render: task =>
			task.entityHref ? (
				<Link
					href={task.entityHref}
					className='pointer-events-auto font-bold text-[var(--secondary-color)] underline-offset-2 hover:underline'
				>
					{task.entityLabel}
				</Link>
			) : (
				<span className='text-[var(--text-muted)]'>General</span>
			),
	},
	{
		key: "dueDate",
		header: "Vence",
		sortValue: task => (task.dueAt ? task.dueAt.getTime() : Number.MAX_SAFE_INTEGER),
		render: task => formatDue(task.dueAt),
	},
	{
		key: "origin",
		header: "Origen",
		filterValue: task => task.origin,
		filterLabel: value => TASK_ORIGIN_LABELS[value] ?? value,
		render: task => (
			<StatusBadge
				value={task.origin}
				label={TASK_ORIGIN_LABELS[task.origin] ?? task.origin}
			/>
		),
	},
	{
		key: "status",
		header: "Estado",
		filterValue: task => task.status,
		filterLabel: value => TASK_STATUS_LABELS[value] ?? value,
		render: task => (
			<StatusBadge
				value={task.status}
				label={TASK_STATUS_LABELS[task.status] ?? task.status}
			/>
		),
	},
];

export function TasksTable({
	rows,
	initialStatus,
}: {
	rows: TaskItem[];
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
				`${task.title} ${task.description ?? ""} ${task.entityLabel ?? ""}`
			}
			emptyTitle='Sin tareas todavía'
			emptyDescription='Las tareas manuales y los recordatorios automáticos aparecerán aquí.'
			initialFilters={initialStatus ? { status: initialStatus } : undefined}
		/>
	);
}
