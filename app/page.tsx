import Link from "next/link";
import { ActivityFeed } from "./components/activity-feed";
import { FunnelBoard } from "./components/funnel-board";
import { IconLabel } from "./components/icon-label";
import { MetricCard } from "./components/metric-card";
import { PageHeader } from "./components/page-header";
import { SectionCard } from "./components/section-card";
import { StatusBadge } from "./components/status-badge";
import { TaskPanel } from "./components/task-panel";
import { formatCrc, formatDateKey } from "./lib/format";
import {
	PAYMENT_STATUS_LABELS,
	FUNNEL_STAGE_LABELS,
} from "./lib/domain/labels";
import { getDashboardData } from "./lib/server/dashboard";

export default async function Home() {
	const {
		funnelStages,
		nextEvents,
		openTasks,
		confirmedIncome,
		projectedIncome,
		closeRate,
		recentActivity,
	} = await getDashboardData();

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio" }]}
				title='Página Principal'
				description='Embudo, eventos próximos y tareas.'
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
					>
						<FunnelBoard stages={funnelStages} />
					</SectionCard>

					<SectionCard
						title='Próximos eventos'
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
													{formatDateKey(event.date)} · {event.startTime || "Sin hora"}
												</p>
											</div>
											<StatusBadge
												value={event.pipelineStatus}
												label={FUNNEL_STAGE_LABELS[event.pipelineStatus]}
											/>
										</div>
										<p className='mt-3 text-base font-semibold text-[var(--text-secondary)]'>
											{event.clientName} · {event.venueAddress || "Sin dirección"}
										</p>
										{event.paymentStatus ? (
											<div className='mt-3'>
												<StatusBadge
													value={event.paymentStatus}
													label={PAYMENT_STATUS_LABELS[event.paymentStatus]}
												/>
											</div>
										) : null}
									</Link>
								);
							})}
						</div>
					</SectionCard>

					<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
						<MetricCard
							label='Tasa de cierre'
							value={closeRate}
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

					<SectionCard title='Actividad reciente'>
						<ActivityFeed entries={recentActivity} />
					</SectionCard>
				</div>

				<aside className='min-w-0 space-y-5'>
					<TaskPanel
						title='Tareas pendientes'
						tasks={openTasks}
						revalidatePath='/'
						viewAllHref='/tareas'
					/>

				</aside>
			</div>
		</>
	);
}
