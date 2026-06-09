import Link from "next/link";
import { CrmShell } from "./components/crm-shell";
import { Breadcrumb } from "./components/breadcrumb";
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

	return (
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb items={[{ label: "Inicio" }]} />
						<h1 className='page-heading'>Página Principal</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Vista diaria para seguimiento comercial, eventos activos y trabajo
							pendiente.
						</p>
					</div>
				</div>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='min-w-0 space-y-5'>
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

					<section className='surface-card min-w-0 border-t-4 border-t-[var(--secondary-color)] p-5 md:p-7'>
						<div className='mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
							<div>
								<h2 className='text-2xl font-black text-[var(--text-primary)]'>
									Eventos activos
								</h2>
								<p className='mt-1 text-lg text-[var(--text-secondary)]'>
									Eventos cotizados, reservados o confirmados.
								</p>
							</div>
							<Link
								href='/eventos'
								className='secondary-action flex min-h-12 w-fit items-center rounded-full px-4 py-3 text-base font-black transition'
							>
								Ver calendario
							</Link>
						</div>

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
					</section>
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
		</CrmShell>
	);
}
