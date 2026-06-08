import Image from "next/image";

const navigationGroups = [
	{
		label: "Gestión",
		items: ["Clientes", "Eventos", "Colaboradores", "Inventario"],
	},
	{
		label: "Métricas",
		items: ["General", "Ventas"],
	},
];

const pipeline = [
	{ label: "LEAD", total: 2 },
	{ label: "CONTACTADO", total: 4 },
	{ label: "COTIZADO", total: 3 },
	{ label: "RESERVADO", total: 2 },
	{ label: "CONFIRMADO", total: 5 },
	{ label: "REALIZADO", total: 8 },
];

const activeEvents = [
	{
		name: "Cumpleaños de Emma",
		date: "22 jun 2026",
		status: "Cotizado",
		payment: "Pendiente",
	},
	{
		name: "Fiesta Empresa Sol",
		date: "04 jul 2026",
		status: "Reservado",
		payment: "Anticipo por vencer",
	},
	{
		name: "Día familiar escolar",
		date: "18 jul 2026",
		status: "Confirmado",
		payment: "Anticipo recibido",
	},
];

const followUps = [
	"Cotización sin respuesta hace 24h",
	"Anticipo vence en 3 días",
	"Reactivar cliente recurrente",
];

export default function Home() {
	return (
		<main className='min-h-screen bg-[var(--background-color)] text-[var(--text-primary)]'>
			<div className='flex min-h-screen'>
				<aside className='hidden w-72 shrink-0 flex-col border-r border-[color:var(--border-color)] bg-[var(--primary-active)] px-6 py-6 text-[var(--on-primary)] lg:flex'>
					<Image
						src='/okidokicrm_logo.png'
						alt='OkiDoki CRM'
						width={220}
						height={80}
						priority
						className='h-auto max-h-36 w-full object-contain'
					/>

					<nav className='space-y-8 text-lg'>
						{navigationGroups.map(group => (
							<section key={group.label} aria-labelledby={group.label}>
								<h2
									id={group.label}
									className='mb-3 text-base font-bold uppercase text-[var(--accent-color)]'
								>
									{group.label}
								</h2>
								<div className='space-y-2'>
									{group.items.map(item => {
										const isActive = item === "Clientes";

										return (
											<a
												href='#'
												key={item}
												className={`flex min-h-12 items-center gap-3 rounded-md px-4 py-3 font-semibold transition ${
													isActive
														? "bg-[var(--accent-color)] text-[var(--on-accent)]"
														: "text-[var(--on-primary)] opacity-85 hover:bg-[var(--primary-hover)]"
												}`}
											>
												<span
													className={`h-3 w-3 rounded-sm ${
														isActive
															? "bg-[var(--success-color)]"
															: "bg-[var(--secondary-color)]"
													}`}
													aria-hidden='true'
												/>
												<span>{item}</span>
											</a>
										);
									})}
								</div>
							</section>
						))}
					</nav>

					<a
						href='#quote'
						className='mt-auto flex min-h-14 items-center justify-center gap-3 rounded-md bg-[var(--accent-color)] px-4 py-3 text-lg font-black text-[var(--on-accent)] shadow-sm transition hover:bg-[var(--accent-hover)]'
					>
						<span aria-hidden='true'>+</span>
						<span>Nueva cotización</span>
					</a>
				</aside>

				<section className='flex min-w-0 flex-1 flex-col'>
					<div className='border-b border-[color:var(--border-color)] bg-[var(--primary-active)] px-5 py-4 text-[var(--on-primary)] lg:hidden'>
						<div className='mb-4 flex items-center justify-between gap-4'>
							<Image
								src='/okidokicrm_logo.png'
								alt='OkiDoki CRM'
								width={112}
								height={48}
								priority
								className='h-auto max-h-12 w-full object-contain'
							/>
							<a
								href='#quote'
								className='min-h-12 rounded-md bg-[var(--accent-color)] px-4 py-3 text-base font-black text-[var(--on-accent)]'
							>
								Nueva cotización
							</a>
						</div>
						<div className='flex gap-2 overflow-x-auto pb-1'>
							{["Clientes", "Eventos", "Colaboradores", "Métricas"].map(
								item => (
									<a
										href='#'
										key={item}
										className={`whitespace-nowrap rounded-md px-4 py-3 text-base font-bold ${
											item === "Clientes"
												? "bg-[var(--accent-color)] text-[var(--on-accent)]"
												: "bg-[var(--primary-hover)] text-[var(--on-primary)]"
										}`}
									>
										{item}
									</a>
								),
							)}
						</div>
					</div>

					<header className='border-b border-[color:var(--border-color)] bg-[var(--surface-color)] px-5 py-5 shadow-sm md:px-8'>
						<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
							<div>
								<p className='mb-2 text-base font-bold text-[var(--accent-color)]'>
									Clientes &gt; Cliente X
								</p>
								<div className='flex flex-wrap items-center gap-3'>
									<h1 className='text-4xl font-black leading-tight text-[var(--text-primary)] md:text-5xl'>
										Cliente X
									</h1>
									<span className='rounded-md bg-[var(--success-color)] px-3 py-2 text-base font-black text-[var(--on-primary)]'>
										ID 00043
									</span>
								</div>
							</div>

							<div className='grid grid-cols-2 gap-3 sm:flex'>
								<button className='min-h-12 rounded-md border-2 border-[color:var(--primary-color)] px-4 py-3 text-base font-black text-[var(--primary-color)] transition hover:border-[color:var(--primary-hover)] hover:text-[var(--primary-hover)]'>
									Guardar cambios
								</button>
								<button className='min-h-12 rounded-md bg-[var(--primary-color)] px-4 py-3 text-base font-black text-[var(--on-primary)] transition hover:bg-[var(--primary-hover)]'>
									Crear evento
								</button>
							</div>
						</div>
					</header>

					<div className='grid min-w-0 flex-1 gap-5 p-5 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
						<div className='min-w-0 space-y-5'>
							<section className='min-w-0 rounded-md border border-[color:var(--border-color)] bg-[var(--card-color)] p-5 shadow-sm md:p-7'>
								<div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
									<div>
										<h2 className='text-2xl font-black text-[var(--text-primary)]'>
											Datos del cliente
										</h2>
										<p className='mt-1 text-lg text-[var(--text-secondary)]'>
											Contacto principal para WhatsApp y cotizaciones.
										</p>
									</div>
									<span className='w-fit rounded-md bg-[var(--background-color)] px-4 py-2 text-base font-bold text-[var(--secondary-color)]'>
										Familiar
									</span>
								</div>

								<form className='grid gap-5 md:grid-cols-2'>
									<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
										<span>Nombre</span>
										<input
											defaultValue='María'
											className='min-h-14 w-full rounded-md border-2 border-[color:var(--border-color)] bg-[var(--background-color)] px-4 text-lg font-semibold text-[var(--text-primary)] outline-none focus:border-[color:var(--accent-color)]'
										/>
									</label>
									<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
										<span>Apellidos</span>
										<input
											defaultValue='Rodríguez'
											className='min-h-14 w-full rounded-md border-2 border-[color:var(--border-color)] bg-[var(--background-color)] px-4 text-lg font-semibold text-[var(--text-primary)] outline-none focus:border-[color:var(--accent-color)]'
										/>
									</label>
									<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
										<span>Teléfono</span>
										<input
											defaultValue='+506 8888 1144'
											className='min-h-14 w-full rounded-md border-2 border-[color:var(--border-color)] bg-[var(--background-color)] px-4 text-lg font-semibold text-[var(--text-primary)] outline-none focus:border-[color:var(--accent-color)]'
										/>
									</label>
									<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
										<span>Tipo</span>
										<select
											defaultValue='FAMILIAR'
											className='min-h-14 w-full rounded-md border-2 border-[color:var(--border-color)] bg-[var(--background-color)] px-4 text-lg font-semibold text-[var(--text-primary)] outline-none focus:border-[color:var(--accent-color)]'
										>
											<option value='FAMILIAR'>Familiar</option>
											<option value='EDUCATIVO'>Educativo</option>
											<option value='CORPORATIVO'>Corporativo</option>
										</select>
									</label>
									<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
										<span>Notas</span>
										<textarea
											defaultValue='Prefiere contacto por WhatsApp. Le interesan paquetes con personaje principal e inflable pequeño.'
											className='min-h-28 w-full resize-none rounded-md border-2 border-[color:var(--border-color)] bg-[var(--background-color)] px-4 py-3 text-lg font-semibold leading-7 text-[var(--text-primary)] outline-none focus:border-[color:var(--accent-color)]'
										/>
									</label>
								</form>
							</section>

							<section className='min-w-0 rounded-md border border-[color:var(--border-color)] bg-[var(--card-color)] p-5 shadow-sm md:p-7'>
								<div className='mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
									<div>
										<h2 className='text-2xl font-black text-[var(--text-primary)]'>
											Pipeline de ventas
										</h2>
										<p className='mt-1 text-lg text-[var(--text-secondary)]'>
											Vista rápida del embudo para hoy y este mes.
										</p>
									</div>
									<span className='w-fit rounded-md bg-[var(--warning-color)] px-4 py-2 text-base font-black text-[var(--on-accent)]'>
										24 seguimientos activos
									</span>
								</div>

								<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3'>
									{pipeline.map((stage, index) => (
										<div
											key={stage.label}
											className='min-h-32 rounded-md border border-[color:var(--border-color)] bg-[var(--background-color)] p-4'
										>
											<div
												className='mb-4 h-2 rounded-full'
												style={{
													backgroundColor: [
														"var(--warning-color)",
														"var(--accent-color)",
														"var(--info-color)",
														"var(--primary-color)",
														"var(--success-color)",
														"var(--secondary-color)",
													][index],
												}}
											/>
											<p className='text-3xl font-black text-[var(--text-primary)]'>
												{stage.total}
											</p>
											<p className='mt-2 text-base font-black text-[var(--text-secondary)]'>
												{stage.label}
											</p>
										</div>
									))}
								</div>
							</section>

							<section className='min-w-0 rounded-md border border-[color:var(--border-color)] bg-[var(--card-color)] p-5 shadow-sm md:p-7'>
								<div className='mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
									<h2 className='text-2xl font-black text-[var(--text-primary)]'>
										Eventos activos
									</h2>
									<button className='min-h-12 rounded-md bg-[var(--primary-color)] px-4 py-3 text-base font-black text-[var(--on-primary)] transition hover:bg-[var(--primary-hover)]'>
										Ver calendario
									</button>
								</div>

								<div className='max-w-full overflow-x-auto rounded-md border border-[color:var(--border-color)]'>
									<div className='grid min-w-[720px] grid-cols-[1.2fr_0.8fr_0.8fr_1fr] bg-[var(--primary-active)] px-5 py-3 text-base font-black text-[var(--on-primary)]'>
										<span>Nombre</span>
										<span>Fecha</span>
										<span>Estado</span>
										<span>Pago</span>
									</div>
									{activeEvents.map(event => (
										<div
											key={event.name}
											className='grid min-w-[720px] grid-cols-[1.2fr_0.8fr_0.8fr_1fr] border-t border-[color:var(--border-color)] px-5 py-4 text-lg text-[var(--text-secondary)]'
										>
											<span className='font-bold text-[var(--text-primary)]'>
												{event.name}
											</span>
											<span>{event.date}</span>
											<span>{event.status}</span>
											<span className='font-bold text-[var(--accent-color)]'>
												{event.payment}
											</span>
										</div>
									))}
								</div>
							</section>
						</div>

						<aside className='min-w-0 space-y-5'>
							<section className='rounded-md border border-[color:var(--border-color)] bg-[var(--card-color)] p-5 shadow-sm'>
								<div className='mb-5 flex items-center gap-4'>
									<div className='grid h-24 w-24 place-items-center rounded-full bg-[var(--background-color)] text-4xl font-black text-[var(--accent-color)] ring-4 ring-[var(--warning-color)]'>
										MR
									</div>
									<div>
										<h2 className='text-2xl font-black text-[var(--text-primary)]'>
											María Rodríguez
										</h2>
										<p className='text-lg font-semibold text-[var(--text-secondary)]'>
											Cliente familiar
										</p>
									</div>
								</div>

								<dl className='space-y-4 text-lg'>
									<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
										<dt className='font-bold text-[var(--text-secondary)]'>
											Primer contacto
										</dt>
										<dd className='font-black text-[var(--text-primary)]'>
											07 jun 2026
										</dd>
									</div>
									<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
										<dt className='font-bold text-[var(--text-secondary)]'>
											Último contacto
										</dt>
										<dd className='font-black text-[var(--text-primary)]'>
											Hoy
										</dd>
									</div>
									<div className='flex justify-between gap-4 border-t border-[color:var(--border-color)] pt-4'>
										<dt className='font-bold text-[var(--text-secondary)]'>
											Eventos realizados
										</dt>
										<dd className='font-black text-[var(--text-primary)]'>2</dd>
									</div>
								</dl>
							</section>

							<section className='rounded-md border border-[color:var(--border-color)] bg-[var(--primary-active)] p-5 text-[var(--on-primary)] shadow-sm'>
								<h2 className='text-2xl font-black'>Tareas pendientes</h2>
								<div className='mt-5 space-y-3'>
									{followUps.map(task => (
										<label
											key={task}
											className='flex min-h-14 items-center gap-3 rounded-md bg-[var(--primary-hover)] px-4 py-3 text-lg font-bold'
										>
											<input
												type='checkbox'
												className='h-5 w-5 accent-[var(--accent-color)]'
											/>
											<span>{task}</span>
										</label>
									))}
								</div>
							</section>

							<section
								id='quote'
								className='rounded-md border border-[color:var(--border-color)] bg-[var(--accent-color)] p-5 text-[var(--on-accent)] shadow-sm'
							>
								<p className='text-lg font-black'>Cotización sugerida</p>
								<h2 className='mt-2 text-3xl font-black'>COT-2026-0043</h2>
								<p className='mt-3 text-lg font-semibold'>
									Paquete Fiesta + botarga adicional + transporte estimado.
								</p>
								<button className='mt-5 min-h-12 w-full rounded-md bg-[var(--primary-active)] px-4 py-3 text-base font-black text-[var(--on-primary)] transition hover:bg-[var(--primary-hover)]'>
									Generar PDF
								</button>
							</section>
						</aside>
					</div>
				</section>
			</div>
		</main>
	);
}
