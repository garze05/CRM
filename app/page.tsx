import Link from "next/link";
import { MetricCard } from "./components/metric-card";
import { PageHeader } from "./components/page-header";
import { SectionCard } from "./components/section-card";
import { StatusBadge } from "./components/status-badge";
import {
	events,
	formatCrc,
	formatDate,
	getEventClient,
	pendingTasks,
	pipelineStages,
	suggestedQuote,
} from "./lib/mock-data";

const stageColors = [
	"var(--warning-color)",
	"var(--accent-color)",
	"var(--info-color)",
	"var(--primary-color)",
	"var(--success-color)",
	"var(--secondary-color)",
];

export default function Home() {
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
		.filter(event => event.pipelineStatus !== "CANCELADO")
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(0, 4);

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio" }]}
				title='Página Principal'
				description='Vista diaria para seguimiento comercial, eventos activos y trabajo pendiente.'
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='min-w-0 space-y-5'>
					<section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
						<MetricCard
							label='Tasa de cierre'
							value='38%'
							helper='Leads a eventos realizados'
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

					<section className='surface-card min-w-0 border-t-4 border-t-[var(--accent-color)] p-5 md:p-7'>
						<div className='mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									Embudo de ventas
								</h2>
								<p className='mt-1 text-lg text-[var(--text-secondary)]'>
									Vista rápida del embudo para hoy y este mes.
								</p>
							</div>
							<span className='w-fit rounded-full bg-[#fff0cf] px-4 py-2 text-base font-black text-[#6f5600]'>
								24 seguimientos activos
							</span>
						</div>

						<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
							{pipelineStages.map((stage, index) => (
								<div
									key={stage.label}
									className='min-h-40 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-6 text-center'
								>
									<div
										className='mx-auto mb-5 h-2 w-24 rounded-full'
										style={{ backgroundColor: stageColors[index] }}
									/>
									<p className='text-6xl font-black leading-none text-[var(--primary-color)]'>
										{stage.total}
									</p>
									<p className='mt-4 break-words text-lg font-black text-[var(--text-secondary)]'>
										{stage.label}
									</p>
								</div>
							))}
						</div>
					</section>

					<SectionCard
						title='Eventos activos'
						description='Eventos cotizados, reservados o confirmados.'
						action={
							<Link
								href='/eventos'
								className='secondary-action flex min-h-12 w-fit items-center rounded-full px-4 py-3 text-base font-black transition'
							>
								Ver calendario
							</Link>
						}
					>
						<div className='max-w-full overflow-x-auto rounded-lg border border-[color:var(--border-color)]'>
							<div className='grid min-w-[760px] grid-cols-[1.2fr_0.8fr_0.8fr_1fr] bg-[#f0ebe4] px-5 py-4 text-base font-black text-[var(--text-secondary)]'>
								<span>Nombre</span>
								<span>Fecha</span>
								<span>Estado</span>
								<span>Cliente</span>
							</div>
							{activeEvents.map(event => {
								const client = getEventClient(event);

								return (
									<Link
										key={event.id}
										href={`/eventos/${event.id}`}
										className='grid min-w-[760px] grid-cols-[1.2fr_0.8fr_0.8fr_1fr] items-center border-t border-[color:var(--border-color)] px-5 py-5 text-lg text-[var(--text-secondary)]'
									>
										<span className='font-bold text-[var(--text-primary)]'>
											{event.name}
										</span>
										<span>{formatDate(event.date)}</span>
										<span>
											<StatusBadge value={event.pipelineStatus} />
										</span>
										<span className='font-bold text-[var(--accent-color)]'>
											{client
												? `${client.firstName} ${client.lastName}`
												: "Sin cliente"}
										</span>
									</Link>
								);
							})}
						</div>
					</SectionCard>

					<SectionCard
						title='Calendario próximo'
						description='Vista compacta para detectar fechas críticas y preparación operativa.'
					>
						<div className='grid gap-3 md:grid-cols-2'>
							{nextEvents.map(event => {
								const client = getEventClient(event);

								return (
									<Link
										key={event.id}
										href={`/eventos/${event.id}`}
										className='rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] p-4 transition hover:bg-[#f7f2ec]'
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
									</Link>
								);
							})}
						</div>
					</SectionCard>
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card border-t-4 border-t-[#8a6b00] p-5'>
						<div className='flex items-center justify-between gap-3'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Tareas críticas
							</h2>
							<span className='rounded-full bg-[var(--error-color)] px-3 py-1 text-sm font-black text-white'>
								4 urgentes
							</span>
						</div>
						<div className='mt-5 space-y-3'>
							{pendingTasks.map(task => (
								<label
									key={task.id}
									className='flex min-h-14 items-start gap-3 rounded-lg px-2 py-3 text-lg font-bold text-[var(--text-primary)]'
								>
									<input
										type='checkbox'
										className='mt-1 h-5 w-5 shrink-0 accent-[var(--accent-color)]'
									/>
									<span>
										<span className='block'>{task.title}</span>
										<span className='mt-1 block text-base font-semibold opacity-85'>
											{task.clientName} · {task.dueLabel}
										</span>
									</span>
								</label>
							))}
						</div>
					</section>

					<section
						id='quote'
						className='rounded-lg bg-[var(--secondary-color)] p-5 text-white shadow-[var(--soft-shadow)]'
					>
						<p className='text-lg font-black'>Cotización sugerida</p>
						<h2 className='mt-2 text-3xl font-black'>
							{suggestedQuote.number}
						</h2>
						<p className='mt-3 text-lg font-semibold'>
							{suggestedQuote.description}
						</p>
						<dl className='mt-5 space-y-3 text-lg'>
							<div className='flex justify-between gap-4 border-t border-black/20 pt-3'>
								<dt className='font-bold'>Subtotal</dt>
								<dd className='font-black'>
									{formatCrc(suggestedQuote.subtotal)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-black/20 pt-3'>
								<dt className='font-bold'>Transporte</dt>
								<dd className='font-black'>
									{formatCrc(suggestedQuote.transport)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-black/20 pt-3'>
								<dt className='font-bold'>Total</dt>
								<dd className='font-black'>
									{formatCrc(suggestedQuote.total)}
								</dd>
							</div>
						</dl>
						<Link
							href='/cotizaciones/nueva'
							className='mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-white px-4 py-3 text-base font-black text-[var(--secondary-color)] transition hover:bg-[#eefaf8]'
						>
							Abrir workflow
						</Link>
					</section>
				</aside>
			</div>
		</>
	);
}
