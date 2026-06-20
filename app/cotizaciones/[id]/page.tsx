import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "../../components/page-header";
import { CopyableMessage } from "../../components/copyable-message";
import { StatusBadge } from "../../components/status-badge";
import { TaskPanel } from "../../components/task-panel";
import { getQuoteDetail } from "../../lib/server/quotes";
import { getSettings } from "../../lib/server/settings";
import { listTasksForEntity } from "../../lib/server/tasks";
import { formatCrc, formatDateKey } from "../../lib/format";
import { QUOTE_STATUS_LABELS } from "../../lib/domain/labels";
import { PdfPreview } from "./pdf-preview";
import { updateQuoteDetailAction } from "../../lib/actions/details";
import {
	confirmDepositAction,
	createReservationFromQuoteAction,
	selectQuoteOptionAction,
} from "../actions";
import { TrashButton } from "../../components/trash-button";

function buildQuoteOptionsMessage({
	clientName,
	options,
	recommendedLabel,
}: {
	clientName: string;
	options: { label: string; quotedPrice: unknown; isRecommended: boolean }[];
	recommendedLabel: string | null;
}) {
	const lines = options.map(option => {
		const prefix = option.isRecommended ? "🎉 " : "🎈 ";
		const popular = option.isRecommended ? " (el más popular)" : "";
		return `${prefix}${option.label}${popular}: ${formatCrc(Number(option.quotedPrice))}`;
	});
	return `¡Hola ${clientName}! Te dejo las opciones para la fiesta:\n\n${lines.join(
		"\n",
	)}\n\n${
		recommendedLabel
			? `La mayoría se va por ${recommendedLabel} porque por la diferencia los chiquitos disfrutan muchísimo más. `
			: ""
	}¿Cuál se ajusta más a lo que tenías pensado?`;
}

function buildDepositMessage({
	clientName,
	eventName,
	eventDate,
	depositAmount,
}: {
	clientName: string;
	eventName: string;
	eventDate: Date | null;
	depositAmount: number;
}) {
	const dateText = eventDate ? ` del ${formatDateKey(eventDate)}` : "";
	return `¡Hola ${clientName}! Para ${eventName}${dateText} todavía tengo el espacio libre, pero los fines de semana se nos ocupan rápido. Si querés te la aparto de una.\n\nPara reservar se hace un anticipo de ${formatCrc(
		depositAmount,
	)} y el resto el día del evento. ¿Te aparto la fecha?`;
}

export default async function QuoteDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const quote = await getQuoteDetail(id);

	if (!quote) {
		notFound();
	}

	const event = quote.event;
	const client = event?.client;
	const validUntilKey = quote.validUntil.toISOString().slice(0, 10);
	const [eventTasks, settings] = await Promise.all([
		event ? listTasksForEntity({ eventId: event.id }) : [],
		getSettings(),
	]);
	const clientName = client
		? `${client.firstName} ${client.lastName}`
		: "cliente";
	const recommendedOption = quote.options.find(option => option.isRecommended);
	const selectedOption = quote.options.find(
		option => option.id === quote.selectedOptionId,
	);
	const depositAmount = quote.reservation
		? Number(quote.reservation.depositAmount)
		: Math.round((Number(quote.total) * Number(settings.depositPercent)) / 100);
	const quoteMessage =
		quote.options.length > 0
			? buildQuoteOptionsMessage({
					clientName,
					options: quote.options,
					recommendedLabel: recommendedOption?.label ?? null,
				})
			: "";
	const depositMessage = buildDepositMessage({
		clientName,
		eventName: event?.name ?? "la fiesta",
		eventDate: event?.eventDate ?? null,
		depositAmount,
	});

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Cotizaciones", href: "/cotizaciones" },
					{ label: quote.quoteNumber },
				]}
				title={quote.quoteNumber}
				badges={
					<StatusBadge
						value={quote.status}
						label={QUOTE_STATUS_LABELS[quote.status]}
					/>
				}
				actions={
					<TrashButton entityType='Quote' id={quote.id} returnTo='/cotizaciones' />
				}
			/>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-5'>
				<section className='surface-card min-w-0 p-5 md:p-7'>
					<div className='mb-6'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Datos de la cotización
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Documento comercial generado para un evento específico.
						</p>
					</div>
					<form action={updateQuoteDetailAction} className='grid gap-5 md:grid-cols-2'>
						<input type='hidden' name='id' value={quote.id} />
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Número</span>
							<input
								defaultValue={quote.quoteNumber}
								readOnly
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select name='status' defaultValue={quote.status} className='form-control'>
								<option value='DRAFT'>Borrador</option>
								<option value='SENT'>Enviada</option>
								<option value='ACCEPTED'>Aceptada</option>
								<option value='EXPIRED'>Vencida</option>
								<option value='REJECTED'>Rechazada</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Cliente</span>
							<input
								defaultValue={
									client ? `${client.firstName} ${client.lastName}` : "Sin cliente"
								}
								readOnly
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Evento</span>
							<input
								defaultValue={event?.name ?? "Sin evento"}
								readOnly
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Vigencia</span>
							<input
								type='date'
								name='validUntil'
								defaultValue={validUntilKey}
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Total</span>
							<input
								defaultValue={formatCrc(Number(quote.total))}
								readOnly
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Descripción de la cotización</span>
							<textarea
								name='description'
								defaultValue={quote.notes ?? ""}
								className='form-control min-h-28 resize-none py-3 leading-7'
							/>
							<span className='block text-sm font-semibold text-[var(--text-secondary)]'>
								Se usa como párrafo de apertura en el documento y la vista previa
								PDF.
							</span>
						</label>
						<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition md:col-span-2'>
							Guardar cambios
						</button>
					</form>
				</section>

				{quote.options.length > 0 ? (
					<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-4'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Opciones de paquete
							</h2>
							<p className='mt-1 text-lg text-[var(--text-secondary)]'>
								El cliente elige una. Al marcarla, el documento y el total se
								actualizan a ese paquete.
							</p>
						</div>
						<ul className='list-none space-y-3 p-0'>
							{quote.options.map(option => {
								const isChosen = quote.selectedOptionId === option.id;
								return (
									<li
										key={option.id}
										className={`rounded-lg border p-4 ${
											isChosen
												? "border-[var(--secondary-color)] bg-[color-mix(in_srgb,var(--secondary-color)_20%,transparent)]"
												: "border-[color:var(--border-color)] bg-[var(--surface-color)]"
										}`}
									>
										<div className='flex flex-wrap items-center justify-between gap-3'>
											<div className='min-w-0'>
												<div className='flex flex-wrap items-center gap-2'>
													<span className='text-lg font-black text-[var(--text-primary)]'>
														{option.label}
													</span>
													{option.isRecommended ? (
														<StatusBadge value='POPULAR' label='El popular' />
													) : null}
													{isChosen ? (
														<StatusBadge
															value='ACCEPTED'
															label='Elegida por el cliente'
														/>
													) : null}
												</div>
												<span className='mt-1 block text-lg font-black text-[var(--text-primary)]'>
													{formatCrc(Number(option.quotedPrice))}
												</span>
											</div>
											{isChosen ? null : (
												<form action={selectQuoteOptionAction}>
													<input
														type='hidden'
														name='quoteId'
														value={quote.id}
													/>
													<input
														type='hidden'
														name='optionId'
														value={option.id}
													/>
													<button
														type='submit'
														className='secondary-action min-h-11 rounded-full px-4 py-2 text-base font-black transition'
													>
														Marcar como elegida
													</button>
												</form>
											)}
										</div>
									</li>
								);
							})}
						</ul>
					</section>
				) : null}

				<section className='surface-card min-w-0 p-5 md:p-7'>
					<div className='mb-4'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Cierre por WhatsApp
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Usá el siguiente mensaje según el momento: elegir paquete,
							apartar fecha o registrar el anticipo.
						</p>
					</div>

					<div className='grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]'>
						<div className='min-w-0'>
							{!selectedOption && quote.options.length > 0 ? (
								<CopyableMessage
									label='Mensaje para elegir paquete'
									message={quoteMessage}
								/>
							) : (
								<CopyableMessage
									label='Mensaje para cerrar con anticipo'
									message={depositMessage}
								/>
							)}
						</div>

						<div className='rounded-lg border border-border bg-muted p-4'>
							<h3 className='text-xl font-black text-foreground'>
								Siguiente paso
							</h3>
							{quote.options.length > 0 && !selectedOption ? (
								<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
									Primero marcá cuál opción eligió el cliente. Después se activa
									la reservación con anticipo.
								</p>
							) : quote.reservation ? (
								<>
									<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
										Reservación {quote.reservation.reservationNumber}. Anticipo:{" "}
										<span className='font-black text-foreground'>
											{formatCrc(Number(quote.reservation.depositAmount))}
										</span>
									</p>
									{quote.reservation.depositPaidAt ? (
										<p className='mt-4 rounded-lg bg-[color-mix(in_srgb,var(--secondary-color)_20%,transparent)] p-3 text-base font-black text-[var(--secondary-color)]'>
											Anticipo registrado. La fecha quedó confirmada.
										</p>
									) : (
										<form action={confirmDepositAction} className='mt-4 space-y-3'>
											<input type='hidden' name='quoteId' value={quote.id} />
											<input
												type='hidden'
												name='reservationId'
												value={quote.reservation.id}
											/>
											<label className='block space-y-2 text-base font-bold text-foreground'>
												<span>Método del anticipo</span>
												<input
													name='depositMethod'
													className='form-control'
													placeholder='SINPE, transferencia, efectivo…'
												/>
											</label>
											<button
												type='submit'
												className='primary-action min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'
											>
												Registrar anticipo
											</button>
										</form>
									)}
								</>
							) : (
								<>
									<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
										Creá la reservación cuando el cliente diga que sí. Quedará
										pendiente de anticipo por{" "}
										<span className='font-black text-foreground'>
											{formatCrc(depositAmount)}
										</span>
										.
									</p>
									<form action={createReservationFromQuoteAction} className='mt-4'>
										<input type='hidden' name='quoteId' value={quote.id} />
										<button
											type='submit'
											className='primary-action min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition'
										>
											Crear reservación
										</button>
									</form>
								</>
							)}
						</div>
					</div>
				</section>

				{quote.documentPayload ? (
					<PdfPreview quoteId={quote.id} />
				) : (
					<section className='surface-card min-w-0 p-5 md:p-7'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Vista previa del documento
						</h2>
						<p className='mt-2 rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-5 text-center text-lg font-bold text-[var(--text-secondary)]'>
							Esta cotización se creó sin documento. Regenerala para producir el
							PDF y previsualizarlo.
						</p>
					</section>
				)}
				</div>

				<aside className='min-w-0 space-y-5'>
					<section className='rounded-lg bg-[var(--secondary-color)] p-5 text-secondary-foreground shadow-[var(--soft-shadow)]'>
						<h2 className='text-2xl font-black'>Resumen</h2>
						<dl className='mt-5 space-y-4 text-lg'>
							<div className='border-t border-current/25 pt-4'>
								<dt className='font-bold opacity-80'>Subtotal</dt>
								<dd className='mt-1 font-black'>
									{formatCrc(Number(quote.subtotal))}
								</dd>
							</div>
							<div className='border-t border-current/25 pt-4'>
								<dt className='font-bold opacity-80'>Transporte</dt>
								<dd className='mt-1 font-black'>
									{formatCrc(Number(quote.transportCost))}
								</dd>
							</div>
							{Number(quote.taxAmount) > 0 ? (
								<div className='border-t border-current/25 pt-4'>
									<dt className='font-bold opacity-80'>IVA</dt>
									<dd className='mt-1 font-black'>
										{formatCrc(Number(quote.taxAmount))}
									</dd>
								</div>
							) : null}
							<div className='border-t border-current/25 pt-4'>
								<dt className='font-bold opacity-80'>Total</dt>
								<dd className='mt-1 font-black'>
									{formatCrc(Number(quote.total))}
								</dd>
							</div>
							<div className='border-t border-current/25 pt-4'>
								<dt className='font-bold opacity-80'>Vigencia</dt>
								<dd className='mt-1 font-black'>
									{formatDateKey(quote.validUntil)}
								</dd>
							</div>
						</dl>
						{event ? (
							<Link
								href={`/eventos/${event.id}`}
								className='mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-card px-4 py-3 text-base font-black text-[var(--secondary-color)] transition hover:bg-[color-mix(in_srgb,var(--secondary-color)_16%,var(--card-color))]'
							>
								Ver evento
							</Link>
						) : null}
					</section>

					{event ? (
						<TaskPanel
							title='Tareas del evento'
							entityType='event'
							entityId={event.id}
							revalidatePath={`/cotizaciones/${quote.id}`}
							tasks={eventTasks}
						/>
					) : null}
				</aside>
			</div>
		</>
	);
}
