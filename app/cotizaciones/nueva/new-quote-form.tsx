"use client";

import { useActionState, useState } from "react";
import {
	DEFAULT_QUOTE_AI_MODEL,
	QUOTE_AI_MODELS,
	estimateQuoteAiCostUsd,
	formatUsdEstimate,
	type QuoteAiModelId,
} from "../../lib/domain/ai-models";
import { generateQuoteAction, type NewQuoteState } from "../actions";

const initialState: NewQuoteState = {};

const ITEM_ROWS = 6;

export function NewQuoteForm({
	events,
	selectedEventId,
}: {
	events: { id: string; label: string }[];
	selectedEventId?: string;
}) {
	const [state, formAction, pending] = useActionState(
		generateQuoteAction,
		initialState,
	);

	const defaultEvent =
		selectedEventId && events.some(e => e.id === selectedEventId)
			? selectedEventId
			: events[0]?.id ?? "";
	const [aiModel, setAiModel] = useState<QuoteAiModelId>(
		DEFAULT_QUOTE_AI_MODEL,
	);

	return (
		<form action={formAction} className='contents'>
			<div className='min-w-0 space-y-5'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-6'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Evento a cotizar
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							El motor de cotización toma cliente, tipo y dirección del evento.
						</p>
					</div>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Evento</span>
						<select
							name='eventId'
							defaultValue={defaultEvent}
							className='form-control'
						>
							{events.length === 0 ? (
								<option value=''>No hay eventos — creá uno primero</option>
							) : (
								events.map(event => (
									<option key={event.id} value={event.id}>
										{event.label}
									</option>
								))
							)}
						</select>
					</label>
				</section>

				<section className='surface-card p-5 md:p-7'>
					<div className='mb-4'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Servicios y personajes
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Los nombres deben coincidir con el catálogo (Google Sheets); el
							motor calcula precios y descuentos.
						</p>
					</div>
					<div className='space-y-3'>
						{Array.from({ length: ITEM_ROWS }).map((_, i) => (
							<div
								key={i}
								className='grid gap-2 rounded-lg border border-[color:var(--border-color)] bg-muted p-3 md:grid-cols-[150px_1fr_90px_90px]'
							>
								<select
									name={`item-${i}-tipo`}
									defaultValue='servicio'
									aria-label={`Tipo del ítem ${i + 1}`}
									className='form-control'
								>
									<option value='personaje'>Personaje</option>
									<option value='servicio'>Servicio</option>
								</select>
								<input
									name={`item-${i}-nombre`}
									placeholder='Nombre (ej. Mario Bros, pintacaritas)'
									aria-label={`Nombre del ítem ${i + 1}`}
									className='form-control'
								/>
								<input
									type='number'
									step='0.5'
									min='0.5'
									name={`item-${i}-horas`}
									defaultValue='1'
									aria-label={`Horas del ítem ${i + 1}`}
									className='form-control'
								/>
								<input
									type='number'
									min='1'
									name={`item-${i}-cantidad`}
									defaultValue='1'
									aria-label={`Cantidad del ítem ${i + 1}`}
									className='form-control'
								/>
							</div>
						))}
					</div>
				</section>

				<section className='surface-card p-5 md:p-7'>
					<div className='mb-4'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Descripción de la cotización
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Este texto abre el documento. Si activás IA, se genera de una vez
							con el modelo elegido.
						</p>
					</div>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Descripción</span>
						<textarea
							name='description'
							className='form-control min-h-32 resize-none py-3 leading-7'
							placeholder='Ej. Preparamos una experiencia alegre y puntual para que la celebración fluya sin estrés.'
						/>
					</label>
					<div className='mt-4 grid gap-3 rounded-lg border border-[color:var(--border-color)] bg-muted p-4'>
						<label className='flex min-h-11 items-center gap-3 text-lg font-bold text-[var(--text-primary)]'>
							<input
								type='checkbox'
								name='useAiDescription'
								className='h-5 w-5 accent-[var(--accent-color)]'
							/>
							<span>Generar descripción con IA al crear</span>
						</label>
						<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
							<span>Modelo IA</span>
							<select
								name='aiModel'
								value={aiModel}
								onChange={event =>
									setAiModel(event.target.value as QuoteAiModelId)
								}
								className='form-control'
							>
								{QUOTE_AI_MODELS.map(model => (
									<option key={model.id} value={model.id}>
										{model.label} · aprox.{" "}
										{formatUsdEstimate(estimateQuoteAiCostUsd(model.id))}
									</option>
								))}
							</select>
						</label>
						<p className='text-sm font-semibold text-[var(--text-secondary)]'>
							Estimación por una descripción corta; el costo real depende de
							tokens usados por OpenRouter.
						</p>
					</div>
				</section>
			</div>

			<aside className='min-w-0 space-y-5'>
				<section className='surface-card p-5'>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						Opciones
					</h2>
					<div className='mt-4 space-y-3'>
						<p className='rounded-lg bg-muted p-4 text-base font-bold text-[var(--text-secondary)]'>
							Transporte incluido automáticamente por Google Maps.
						</p>
						<label className='flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]'>
							<input
								type='checkbox'
								name='invoice'
								className='h-5 w-5 accent-[var(--accent-color)]'
							/>
							<span>Aplicar IVA (factura, 13%)</span>
						</label>
					</div>

					{state.error ? (
						<div
							className={`mt-5 rounded-lg px-4 py-3 text-sm font-black ${
								state.unavailable
									? "bg-[color-mix(in_srgb,var(--tertiary-color)_30%,transparent)] text-[var(--warning-color)]"
									: "bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] text-[var(--error-color)]"
							}`}
							role='alert'
						>
							{state.error}
						</div>
					) : null}

					<button
						type='submit'
						disabled={pending || events.length === 0}
						className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Generando…" : "Generar cotización"}
					</button>
					<p className='mt-3 text-sm font-semibold text-[var(--text-secondary)]'>
						Se crea como borrador. El consecutivo y el código los asigna el motor
						de cotización.
					</p>
				</section>
			</aside>
		</form>
	);
}
