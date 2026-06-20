"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { formatCrc } from "../../lib/format";
import {
	DEFAULT_QUOTE_AI_MODEL,
	QUOTE_AI_MODELS,
	estimateQuoteAiCostUsd,
	formatUsdEstimate,
	type QuoteAiModelId,
} from "../../lib/domain/ai-models";
import {
	createPackageQuoteAction,
	type PackageQuoteState,
} from "../actions";

const initialState: PackageQuoteState = {};

export type PackageOption = {
	id: string;
	name: string;
	description: string | null;
	durationHours: number;
	basePrice: number;
	itemCount: number;
};

const MAX_OPTIONS = 3;

/**
 * Flujo por defecto de cotización: el vendedor ofrece 1–3 PAQUETES como opciones
 * y marca uno como "el popular". Los precios efectivos los calcula el motor al
 * crear (precio base + recargo del tipo de cliente). Sin ítems sueltos: para eso
 * está la ruta Custom, deliberadamente apartada.
 */
export function PackageQuoteForm({
	events,
	packages,
	selectedEventId,
	transportBasePrice,
}: {
	events: { id: string; label: string }[];
	packages: PackageOption[];
	selectedEventId?: string;
	transportBasePrice: number;
}) {
	const [state, formAction, pending] = useActionState(
		createPackageQuoteAction,
		initialState,
	);

	const defaultEvent =
		selectedEventId && events.some(e => e.id === selectedEventId)
			? selectedEventId
			: events[0]?.id ?? "";

	const [eventId, setEventId] = useState<string>(defaultEvent);
	const [selected, setSelected] = useState<string[]>([]);
	const [recommended, setRecommended] = useState<string>("");
	const [aiModel, setAiModel] = useState<QuoteAiModelId>(
		DEFAULT_QUOTE_AI_MODEL,
	);

	function toggle(id: string) {
		setSelected(current => {
			if (current.includes(id)) {
				const next = current.filter(x => x !== id);
				if (recommended === id) setRecommended(next[0] ?? "");
				return next;
			}
			if (current.length >= MAX_OPTIONS) return current;
			const next = [...current, id];
			if (recommended === "") setRecommended(id);
			return next;
		});
	}

	const issues = useMemo(() => {
		const list: string[] = [];
		if (selected.length === 0) list.push("Elegí al menos un paquete.");
		if (selected.length > 0 && !recommended) {
			list.push("Marcá cuál paquete es el recomendado (el popular).");
		}
		return list;
	}, [selected, recommended]);

	return (
		<form action={formAction} className='contents'>
			<input type='hidden' name='eventId' value={eventId} />
			{selected.map(id => (
				<input key={id} type='hidden' name='packageId' value={id} />
			))}
			<input type='hidden' name='recommendedPackageId' value={recommended} />

			<div className='min-w-0 space-y-5'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-6'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Evento a cotizar
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							El recargo por tipo de cliente se aplica automáticamente sobre el
							precio base de cada paquete.
						</p>
					</div>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Evento</span>
						<select
							value={eventId}
							onChange={e => setEventId(e.target.value)}
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
					<p className='mt-4 rounded-lg bg-muted p-4 text-base font-bold text-[var(--text-secondary)]'>
						Transporte incluido automáticamente desde{" "}
						<span className='text-[var(--text-primary)]'>
							{formatCrc(transportBasePrice)}
						</span>{" "}
						en cada opción.
					</p>
				</section>

				<section className='surface-card p-5 md:p-7'>
					<div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
						<div>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Paquetes a ofrecer
							</h2>
							<p className='mt-1 text-lg text-[var(--text-secondary)]'>
								Elegí de 1 a 3 paquetes. Marcá uno como el popular.
							</p>
						</div>
						<span className='rounded-full bg-muted px-4 py-2 text-base font-black text-[var(--text-secondary)]'>
							{selected.length}/{MAX_OPTIONS} elegidos
						</span>
					</div>

					{packages.length === 0 ? (
						<div className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-8 text-center'>
							<p className='text-lg font-black text-[var(--text-primary)]'>
								No hay paquetes activos todavía.
							</p>
							<Link
								href='/paquetes/nuevo'
								className='secondary-action mx-auto mt-4 flex min-h-12 w-fit items-center rounded-full px-5 py-3 text-base font-black transition'
							>
								Crear un paquete
							</Link>
						</div>
					) : (
						<ul className='grid list-none gap-3 p-0'>
							{packages.map(pkg => {
								const isSelected = selected.includes(pkg.id);
								const isRecommended = recommended === pkg.id;
								const atLimit = !isSelected && selected.length >= MAX_OPTIONS;
								return (
									<li
										key={pkg.id}
										className={`rounded-lg border p-4 transition ${
											isSelected
												? "border-[var(--accent-color)] bg-[color-mix(in_srgb,var(--accent-color)_14%,transparent)]"
												: "border-[color:var(--border-color)] bg-[var(--surface-color)]"
										}`}
									>
										<div className='flex flex-wrap items-start justify-between gap-3'>
											<label className='flex flex-1 cursor-pointer items-start gap-3'>
												<input
													type='checkbox'
													checked={isSelected}
													disabled={atLimit}
													onChange={() => toggle(pkg.id)}
													className='mt-1 h-6 w-6 shrink-0 accent-[var(--accent-color)]'
													aria-label={`Ofrecer ${pkg.name}`}
												/>
												<span className='min-w-0'>
													<span className='block text-lg font-black text-[var(--text-primary)]'>
														{pkg.name}
													</span>
													{pkg.description ? (
														<span className='mt-1 block text-base font-semibold text-[var(--text-secondary)]'>
															{pkg.description}
														</span>
													) : null}
													<span className='mt-1 block text-base font-bold text-[var(--text-secondary)]'>
														{pkg.durationHours} h · {pkg.itemCount} ítems ·
														base {formatCrc(pkg.basePrice)}
													</span>
												</span>
											</label>
											{isSelected ? (
												<label className='flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--tertiary-color)_30%,transparent)] px-3 py-2 text-base font-black text-[var(--warning-color)]'>
													<input
														type='radio'
														name='recommendedRadio'
														checked={isRecommended}
														onChange={() => setRecommended(pkg.id)}
														className='h-5 w-5 accent-[var(--accent-color)]'
													/>
													<span>El popular</span>
												</label>
											) : null}
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</section>

				<section className='surface-card p-5 md:p-7'>
					<div className='mb-4'>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							Descripción de la cotización
						</h2>
						<p className='mt-1 text-lg text-[var(--text-secondary)]'>
							Este texto abre el documento. Podés escribirlo manualmente o dejar
							que la IA lo genere al crear la cotización.
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
						Resumen
					</h2>
					<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
						Se crea como borrador con código local. El cliente elige una opción
						más adelante desde el detalle.
					</p>

					{issues.length > 0 ? (
						<ul className='mt-4 list-none space-y-1 rounded-lg bg-[color-mix(in_srgb,var(--tertiary-color)_30%,transparent)] p-4 text-base font-bold text-[var(--warning-color)]'>
							{issues.map(issue => (
								<li key={issue}>{issue}</li>
							))}
						</ul>
					) : null}

					{state.error ? (
						<div
							className='mt-4 rounded-lg bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] px-4 py-3 text-sm font-black text-[var(--error-color)]'
							role='alert'
						>
							{state.error}
						</div>
					) : null}

					<button
						type='submit'
						disabled={
							pending || events.length === 0 || issues.length > 0
						}
						className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Creando…" : "Crear cotización"}
					</button>

					<Link
						href={`/cotizaciones/nueva/custom${
							eventId ? `?evento=${eventId}` : ""
						}`}
						className='mt-3 block text-center text-sm font-bold text-[var(--text-muted)] underline'
					>
						Cotización personalizada (ítems sueltos)
					</Link>
				</section>
			</aside>
		</form>
	);
}
