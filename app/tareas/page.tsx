import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { MetricCard } from "../components/metric-card";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { TasksTable } from "./tasks-table";
import { listAllTasks } from "../lib/server/tasks";

export default async function TasksPage({
	searchParams,
}: {
	searchParams: Promise<{ estado?: string }>;
}) {
	const { estado } = await searchParams;
	const tasks = await listAllTasks();

	const pending = tasks.filter(task => task.status === "PENDING").length;
	const inProgress = tasks.filter(task => task.status === "IN_PROGRESS").length;
	const automatic = tasks.filter(
		task => task.origin !== "MANUAL" && task.status === "PENDING",
	).length;

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Tareas" }]}
				title='Tareas'
				description='Seguimientos, recordatorios automáticos y pendientes del equipo.'
				actions={
					<Link
						href='/tareas/nueva'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel icon='material-symbols:add-task-rounded' label='Nueva tarea' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<section className='grid gap-4 md:grid-cols-3'>
					<MetricCard
						label='Pendientes'
						value={pending}
						helper='Tareas sin iniciar'
						accentColor='var(--warning-color)'
					/>
					<MetricCard
						label='En progreso'
						value={inProgress}
						helper='Tareas iniciadas'
						accentColor='var(--info-color)'
					/>
					<MetricCard
						label='Recordatorios automáticos'
						value={automatic}
						helper='Generados por el sistema'
						accentColor='var(--accent-color)'
					/>
				</section>

				<SectionCard>
					<TasksTable
						rows={tasks}
						initialStatus={estado ? [estado] : undefined}
					/>
				</SectionCard>
			</div>
		</>
	);
}
