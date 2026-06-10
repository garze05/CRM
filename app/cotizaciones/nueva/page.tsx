import { Breadcrumb } from "../../components/breadcrumb";
import { StatusBadge } from "../../components/status-badge";
import {
	clients,
	formatCrc,
	getClientFullName,
	inventoryItems,
	suggestedQuote,
} from "../../lib/mock-data";

const steps = [
	{ number: 1, title: "Cliente" },
	{ number: 2, title: "Evento" },
	{ number: 3, title: "Servicios" },
	{ number: 4, title: "Revisión" },
];

export default function NewQuotePage() {
	const activeClient = clients[0];
	const availableItems = inventoryItems.filter(item => item.active).slice(0, 3);

	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Cotizaciones", href: "/cotizaciones" },
								{ label: "Nueva cotización" },
							]}
						/>
						<h1 className='page-heading'>
							Nueva cotización
						</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Workflow inicial para capturar cliente, evento, servicios y revisar el
							total calculado por el motor de cotización.
						</p>
					</div>
					<button
						type='button'
						className='primary-action min-h-12 w-fit rounded-full px-5 py-3 text-base font-black transition'
					>
						Guardar borrador
					</button>
				</div>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='min-w-0 space-y-5'>
					<section className='surface-card p-5 md:p-7'>
						<div className='grid gap-3 md:grid-cols-4'>
							{steps.map(step => (
								<div
									key={step.number}
									className={`rounded-lg border p-4 ${
										step.number === 1
											? "border-[color:var(--accent-color)] bg-[var(--accent-color)] text-[var(--on-accent)]"
											: "border-[color:var(--border-color)] bg-[#f0ebe4] text-[var(--text-secondary)]"
									}`}
								>
									<p className='text-base font-black'>Paso {step.number}</p>
									<p className='mt-1 text-xl font-black'>{step.title}</p>
								</div>
							))}
						</div>
					</section>

					<section className='surface-card p-5 md:p-7'>
						<div className='mb-6'>
							<p className='text-base font-black text-[var(--accent-color)]'>
								Paso 1 de 4
							</p>
							<h2 className='mt-1 text-2xl font-black text-[var(--text-primary)]'>
								Cliente
							</h2>
						</div>
						<div className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Cliente existente</span>
								<select
									defaultValue={activeClient.id}
									className='form-control'
								>
									{clients.map(client => (
										<option key={client.id} value={client.id}>
											{getClientFullName(client)} · {client.phone}
										</option>
									))}
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Tipo de cliente</span>
								<select
									defaultValue={activeClient.type}
									className='form-control'
								>
									<option value='FAMILIAR'>Familiar</option>
									<option value='EDUCATIVO'>Educativo</option>
									<option value='CORPORATIVO'>Corporativo</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Teléfono WhatsApp</span>
								<input
									defaultValue={activeClient.phone}
									className='form-control'
								/>
							</label>
						</div>
					</section>

					<section className='surface-card p-5 md:p-7'>
						<div className='mb-6'>
							<p className='text-base font-black text-[var(--accent-color)]'>
								Paso 2 de 4
							</p>
							<h2 className='mt-1 text-2xl font-black text-[var(--text-primary)]'>
								Evento
							</h2>
						</div>
						<div className='grid gap-5 md:grid-cols-2'>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Tipo de evento</span>
								<select className='form-control'>
									<option>Infantil</option>
									<option>Corporativo</option>
									<option>Institucional</option>
								</select>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
								<span>Fecha del evento</span>
								<input
									type='date'
									defaultValue='2026-06-22'
									className='form-control'
								/>
							</label>
							<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
								<span>Dirección para transporte</span>
								<input
									defaultValue='San Pedro, Montes de Oca'
									className='form-control'
								/>
							</label>
						</div>
					</section>

					<section className='surface-card p-5 md:p-7'>
						<div className='mb-6'>
							<p className='text-base font-black text-[var(--accent-color)]'>
								Paso 3 de 4
							</p>
							<h2 className='mt-1 text-2xl font-black text-[var(--text-primary)]'>
								Servicios
							</h2>
						</div>
						<div className='space-y-3'>
							{availableItems.map(item => (
								<label
									key={item.id}
									className='flex min-h-14 items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[#f0ebe4] px-4 py-3 text-lg font-bold'
								>
									<input
										type='checkbox'
										defaultChecked={item.id !== "inventario-3"}
										className='h-5 w-5 shrink-0 accent-[var(--accent-color)]'
									/>
									<span className='min-w-0 flex-1'>
										<span className='block text-[var(--text-primary)]'>{item.name}</span>
										<span className='mt-1 block text-base font-semibold text-[var(--text-secondary)]'>
											{item.description}
										</span>
									</span>
									<StatusBadge value={item.category} />
								</label>
							))}
						</div>
					</section>
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='rounded-lg bg-[var(--secondary-color)] p-5 text-white shadow-[var(--soft-shadow)]'>
						<h2 className='text-2xl font-black'>Resumen</h2>
						<dl className='mt-5 space-y-4 text-lg'>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Cliente</dt>
								<dd className='mt-1 font-black'>{getClientFullName(activeClient)}</dd>
							</div>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Cotización</dt>
								<dd className='mt-1 font-black'>{suggestedQuote.number}</dd>
							</div>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Estado</dt>
								<dd className='mt-2'>
									<StatusBadge value='COTIZADO' label='BORRADOR' />
								</dd>
							</div>
						</dl>
					</section>

					<section className='surface-card p-5'>
						<p className='text-lg font-black text-[var(--accent-color)]'>
							Motor de cotización Python
						</p>
						<h2 className='mt-2 text-2xl font-black text-[var(--text-primary)]'>
							Resultado estimado
						</h2>
						<dl className='mt-5 space-y-3 text-lg'>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-3'>
								<dt className='font-bold text-[var(--text-secondary)]'>Subtotal</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatCrc(suggestedQuote.subtotal)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-3'>
								<dt className='font-bold text-[var(--text-secondary)]'>
									Transporte
								</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatCrc(suggestedQuote.transport)}
								</dd>
							</div>
							<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-3'>
								<dt className='font-bold text-[var(--text-secondary)]'>Total</dt>
								<dd className='font-black text-[var(--text-primary)]'>
									{formatCrc(suggestedQuote.total)}
								</dd>
							</div>
						</dl>
						<button
							type='button'
							className='mt-5 min-h-12 w-full rounded-full bg-[var(--accent-color)] px-4 py-3 text-base font-black text-[var(--on-accent)] transition hover:bg-[var(--accent-hover)]'
						>
							Generar PDF
						</button>
					</section>
				</aside>
			</div>
		</>
	);
}
