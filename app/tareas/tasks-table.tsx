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
import { TaskCheckButton, TaskDeleteButton } from "./task-row-actions";

function formatDue(task: TaskItem) {
	if (!task.dueAt) return "Sin fecha límite";
	const date = new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "America/Costa_Rica",
	}).format(task.dueAt);
	if (!task.dueHasTime) return date;
	const time = new Intl.DateTimeFormat("es-CR", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
		timeZone: "America/Costa_Rica",
	}).format(task.dueAt);
	return `${date}, ${time}`;
}

const columns: DataTableColumn<TaskItem>[] = [
	{
		key: "check",
		header: "",
		width: "52px",
		interactive: true,
		render: task => (
			<TaskCheckButton
				taskId={task.id}
				title={task.title}
				completed={task.status === "COMPLETED"}
			/>
		),
	},
	{
		key: "title",
		header: "Tarea",
		width: "minmax(240px, 1.8fr)",
		sortValue: task => task.title.toLocaleLowerCase("es"),
		render: task => (
			<div>
				<p
					className={
						task.status === "COMPLETED"
							? "font-bold text-[var(--text-muted)] line-through"
							: "font-black text-[var(--text-primary)]"
					}
				>
					{task.title}
				</p>
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
		sortValue: task =>
			task.dueAt ? task.dueAt.getTime() : Number.MAX_SAFE_INTEGER,
		render: task => formatDue(task),
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
	{
		key: "action",
		header: "",
		width: "minmax(120px, 0.6fr)",
		className: "justify-self-end",
		interactive: true,
		render: task => <TaskDeleteButton taskId={task.id} title={task.title} />,
	},
];

const searchText = (task: TaskItem) =>
	`${task.title} ${task.description ?? ""} ${task.entityLabel ?? ""}`;

export function TasksTable({
	rows,
	initialStatus,
}: {
	rows: TaskItem[];
	initialStatus?: string[];
}) {
	const active = rows.filter(task => task.status !== "COMPLETED");
	const completed = rows.filter(task => task.status === "COMPLETED");

	return (
		<div className='space-y-8'>
			<DataTable
				tableId='tareas'
				columns={columns}
				rows={active}
				rowHref={task => `/tareas/${task.id}/editar`}
				searchLabel='Buscar tarea'
				searchPlaceholder='Título, cliente o evento'
				searchText={searchText}
				emptyTitle='Sin tareas pendientes'
				emptyDescription='Las tareas manuales y los recordatorios automáticos aparecerán aquí.'
				initialFilters={initialStatus ? { status: initialStatus } : undefined}
			/>

			{completed.length > 0 ? (
				<div className='space-y-3'>
					<h2 className='text-xl font-black text-[var(--text-primary)]'>
						Tareas completadas
					</h2>
					<DataTable
						tableId='tareas-completadas'
						columns={columns}
						rows={completed}
						rowHref={task => `/tareas/${task.id}/editar`}
						searchLabel='Buscar completadas'
						searchPlaceholder='Título, cliente o evento'
						searchText={searchText}
						emptyTitle='Sin tareas completadas'
						pageSize={6}
					/>
				</div>
			) : null}
		</div>
	);
}
