import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/breadcrumb";
import { StatusBadge } from "../../components/status-badge";
import {
	formatCrc,
	formatDate,
	getEventClient,
	getQuoteById,
	getQuoteEvent,
	suggestedQuote,
} from "../../lib/mock-data";

export default async function QuoteDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const quote = getQuoteById(id);

	if (!quote) {
		notFound();
	}

	const event = getQuoteEvent(quote);
	const client = event ? getEventClient(event) : undefined;

	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Cotizaciones", href: "/cotizaciones" },
								{ label: quote.number },
							]}
						/>
						<div className='flex flex-wrap items-center gap-3'>
							<h1 className='page-heading'>{quote.number}</h1>
							<StatusBadge value={quote.status} />
						</div>
					</div>
					<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition'>
						Guardar cambios
					</button>
				</div>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<section className='surface-card min-w-0 p-5 md:p-7'>
					<div className='mb-6'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Datos de la cotización
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Documento comercial generado para un evento específico.
						</p>
					</div>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Número</span>
							<input defaultValue={quote.number} className='form-control' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select defaultValue={quote.status} className='form-control'>
								<option value='BORRADOR'>Borrador</option>
								<option value='ENVIADA'>Enviada</option>
								<option value='ACEPTADA'>Aceptada</option>
								<option value='VENCIDA'>Vencida</option>
								<option value='RECHAZADA'>Rechazada</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Cliente</span>
							<input
								defaultValue={
									client ? `${client.firstName} ${client.lastName}` : "Sin cliente"
								}
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Evento</span>
							<input defaultValue={event?.name ?? "Sin evento"} className='form-control' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Vigencia</span>
							<input
								type='date'
								defaultValue={quote.validUntil}
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Total</span>
							<input defaultValue={formatCrc(quote.total)} className='form-control' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Notas visibles para cliente</span>
							<textarea
								defaultValue='Cotización válida por 7 días desde su emisión.'
								className='form-control min-h-28 resize-none py-3 leading-7'
							/>
						</label>
					</form>
				</section>

				<aside className='min-w-0 space-y-5'>
					<section className='rounded-lg bg-[var(--secondary-color)] p-5 text-white shadow-[var(--soft-shadow)]'>
						<h2 className='text-2xl font-black'>Resumen</h2>
						<dl className='mt-5 space-y-4 text-lg'>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Subtotal</dt>
								<dd className='mt-1 font-black'>
									{formatCrc(suggestedQuote.subtotal)}
								</dd>
							</div>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Transporte</dt>
								<dd className='mt-1 font-black'>
									{formatCrc(suggestedQuote.transport)}
								</dd>
							</div>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Total</dt>
								<dd className='mt-1 font-black'>{formatCrc(quote.total)}</dd>
							</div>
							<div className='border-t border-white/20 pt-4'>
								<dt className='font-bold opacity-80'>Vigencia</dt>
								<dd className='mt-1 font-black'>{formatDate(quote.validUntil)}</dd>
							</div>
						</dl>
						{event ? (
							<Link
								href={`/eventos/${event.id}`}
								className='mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-white px-4 py-3 text-base font-black text-[var(--secondary-color)] transition hover:bg-[#eefaf8]'
							>
								Ver evento
							</Link>
						) : null}
					</section>
				</aside>
			</div>
		</>
	);
}
