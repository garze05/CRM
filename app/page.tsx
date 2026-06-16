import Link from "next/link";
import { ActivityFeed } from "./components/activity-feed";
import { FunnelBoard } from "./components/funnel-board";
import { IconLabel } from "./components/icon-label";
import { MetricCard } from "./components/metric-card";
import { PageHeader } from "./components/page-header";
import { SectionCard } from "./components/section-card";
import { StatusBadge } from "./components/status-badge";
import { TaskList } from "./components/task-list";
import { listAllTasks } from "./lib/server/tasks";
import {
	events,
	formatCrc,
	formatDate,
	getEventClient,
	pipelineStages,
	recentActivity,
} from "./lib/mock-data";

export default async function Home() {
	const activeEvents = events.filter(event =>
		["COTIZADO", "RESERVADO", "CONFIRMADO"].includes(event.pipelineStatus),
	);
	const confirmedIncome = events
		.filter(event => ["CONFIRMADO", "REALIZADO"].includes(event.pipelineStatus))
		.reduce((total, event) => total + event.estimatedTotal, 0);
	const projectedIncome = activeEvents.reduce(
		(total, event) => total + event.estimatedTotal,
		0,
	);
	const nextEvents = events
		.filter(event =>
			["RESERVADO", "CONFIRMADO", "COTIZADO"].includes(event.pipelineStatus),
		)
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(0, 4);
	const openTasks = (await listAllTasks()).filter(task =>
		["PENDING", "IN_PROGRESS"].includes(task.status),
	);

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio" }]}
				title='Página Principal'
				description='Qué hay que hacer hoy y cómo va el mes: embudo, eventos próximos y tareas.'
				actions={
					<div className='flex flex-wrap gap-3'>
						<Link
							href='/clientes/nuevo'
							className='primary-action flex min-h-10 w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition'
						>
							<IconLabel label='Nuevo prospecto' />
						</Link>
						<Link
							href='/eventos?vista=calendario'
							className='secondary-action flex min-h-10 w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition'
						>
							<IconLabel
								icon='material-symbols:calendar-month-rounded'
								label='Ir al calendario'
							/>
						</Link>
					</div>
				}
			/>

			<div className='grid min-w-0 flex-1 gap-4 px-5 pb-28 md:px-6 md:pb-6 xl:grid-cols-[minmax(0,1fr)_320px]'>
				<div className='min-w-0 space-y-5'>
					<SectionCard
						title='Embudo de ventas'
						description='Eventos activos por etapa este mes. Tocá una etapa para ver su lista.'
					>
						<FunnelBoard stages={pipelineStages} />
					</SectionCard>

					<SectionCard
						title='Próximos eventos'
						description='Lo que viene en los siguientes días, con su estado de pago.'
						action={
							<Link
								href='/eventos?vista=calendario'
								className='secondary-action flex min-h-10 w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition'
							>
								<IconLabel
									icon='material-symbols:calendar-month-rounded'
									label='Ver calendario'
								/>
							</Link>
						}
					>
						<div className='grid gap-3 md:grid-cols-2'>
							{nextEvents.map(event => {
								const client = getEventClient(event);

								return (
									<Link
										key={event.id}
										href={`/eventos/${event.id}`}
										className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-3 transition hover:bg-[#f7f2ec]'
									>
										<div className='flex items-start justify-between gap-3'>
											<div>
												<p className='text-lg font-black text-[var(--text-primary)]'>
													{event.name}
												</p>
												<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
													{formatDate(event.date)} · {event.startTime}
												</p>
											</div>
											<StatusBadge value={event.pipelineStatus} />
										</div>
										<p className='mt-3 text-base font-semibold text-[var(--text-secondary)]'>
											{client
												? `${client.firstName} ${client.lastName}`
												: "Sin cliente"}{" "}
											· {event.venueName}
										</p>
										<div className='mt-3'>
											<StatusBadge value={event.paymentStatus} />
										</div>
									</Link>
								);
							})}
						</div>
					</SectionCard>

					<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
						<MetricCard
							label='Tasa de cierre'
							value='38%'
							helper='Prospectos a eventos realizados'
							accentColor='var(--secondary-color)'
						/>
						<MetricCard
							label='Ingreso confirmado'
							value={formatCrc(confirmedIncome)}
							helper='Eventos confirmados o realizados'
							accentColor='var(--success-color)'
						/>
						<MetricCard
							label='Ingreso proyectado'
							value={formatCrc(projectedIncome)}
							helper='Cotizado, reservado y confirmado'
							accentColor='var(--accent-color)'
						/>
						<MetricCard
							label='Respuesta promedio'
							value='1.8 días'
							helper='Entre cotización y respuesta'
							accentColor='var(--warning-color)'
						/>
					</section>
				</div>

				<aside className='min-w-0 space-y-5'>
					<SectionCard
						title='Tareas pendientes'
						description='Recordatorios automáticos y tareas del equipo.'
						action={
							<Link
								href='/tareas'
								className='secondary-action flex min-h-10 w-fit items-center rounded-lg px-4 py-2 text-sm font-black transition'
							>
								Ver todas
							</Link>
						}
					>
						<TaskList tasks={openTasks} completeRevalidate='/' />
					</SectionCard>

					<SectionCard
						title='Actividad reciente'
						description='Quién hizo qué y cuándo.'
					>
						<ActivityFeed entries={recentActivity} />
					</SectionCard>
				</aside>
			</div>
		</>
	);
}
