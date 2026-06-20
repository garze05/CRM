import Link from "next/link";
import { ActivityFeed } from "./components/activity-feed";
import { FunnelBoard } from "./components/funnel-board";
import { IconLabel } from "./components/icon-label";
import { MetricCard } from "./components/metric-card";
import { PageHeader } from "./components/page-header";
import { SectionCard } from "./components/section-card";
import { StatusBadge } from "./components/status-badge";
import { TaskPanel } from "./components/task-panel";
import { Button } from "./components/ui/button";
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
		closeRate,
		quotesAwaitingDecision,
		pendingDeposits,
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
						<Button asChild size='lg'>
							<Link href='/clientes/nuevo'>
								<IconLabel label='Nuevo prospecto' />
							</Link>
						</Button>
						<Button asChild variant='outline' size='lg'>
							<Link href='/eventos?vista=calendario'>
								<IconLabel
									icon='material-symbols:calendar-month-rounded'
									label='Ir al calendario'
								/>
							</Link>
						</Button>
					</div>
				}
			/>

			<div className='grid min-w-0 flex-1 gap-4 px-5 pb-28 md:px-6 md:pb-6 xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-5'>
					<section
						aria-label='Indicadores clave'
						className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
					>
						<MetricCard
							icon='material-symbols:trending-up-rounded'
							label='Tasa de cierre'
							value={closeRate}
							helper='Prospectos a eventos realizados'
							accentColor='var(--secondary-color)'
						/>
						<MetricCard
							icon='material-symbols:paid-rounded'
							label='Ingreso confirmado'
							value={formatCrc(confirmedIncome)}
							helper='Eventos confirmados o realizados'
							accentColor='var(--success-color)'
						/>
						<MetricCard
							icon='material-symbols:savings-rounded'
							label='Cotizaciones por decidir'
							value={String(quotesAwaitingDecision)}
							helper='Sin paquete elegido todavía'
							accentColor='var(--accent-color)'
						/>
						<MetricCard
							icon='material-symbols:payments-rounded'
							label='Anticipos pendientes'
							value={String(pendingDeposits)}
							helper='Fechas que necesitan anticipo'
							accentColor='var(--warning-color)'
						/>
					</section>

					<SectionCard title='Embudo de ventas'>
						<FunnelBoard stages={funnelStages} />
					</SectionCard>

					<SectionCard
						title='Próximos eventos'
						action={
							<Button asChild variant='outline' size='sm'>
								<Link href='/eventos?vista=calendario'>
									<IconLabel
										icon='material-symbols:calendar-month-rounded'
										label='Ver calendario'
									/>
								</Link>
							</Button>
						}
					>
						{nextEvents.length > 0 ? (
							<ul className='grid gap-3 md:grid-cols-2'>
								{nextEvents.map(event => (
									<li key={event.id} className='min-w-0'>
										<Link
											href={`/eventos/${event.id}`}
											className='block min-h-11 rounded-lg border border-border bg-muted p-3 transition hover:border-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
										>
											<div className='flex items-start justify-between gap-3'>
												<div className='min-w-0'>
													<p className='truncate text-lg font-black text-foreground'>
														{event.name}
													</p>
													<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
														{formatDateKey(event.date)} ·{" "}
														{event.startTime || "Sin hora"}
													</p>
												</div>
												<StatusBadge
													value={event.pipelineStatus}
													label={FUNNEL_STAGE_LABELS[event.pipelineStatus]}
												/>
											</div>
											<p className='mt-3 text-base font-semibold text-[var(--text-secondary)]'>
												{event.clientName} ·{" "}
												{event.venueAddress || "Sin dirección"}
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
									</li>
								))}
							</ul>
						) : (
							<p className='rounded-lg border border-dashed border-border bg-muted p-6 text-center text-base font-semibold text-muted-foreground'>
								No hay eventos próximos agendados.
							</p>
						)}
					</SectionCard>

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
