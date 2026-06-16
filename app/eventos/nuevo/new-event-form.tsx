"use client";

import { useActionState } from "react";
import { SectionCard } from "../../components/section-card";
import {
	ClientCombobox,
	type ComboOption,
} from "../../components/client-combobox";
import { createEventAction, type NewEventState } from "../actions";

const initialState: NewEventState = {};

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<span className='block text-base font-bold text-[var(--error-color)]'>
			{message}
		</span>
	);
}

export function NewEventForm({
	clients,
	selectedClientId,
}: {
	clients: ComboOption[];
	selectedClientId?: string;
}) {
	const [state, formAction, pending] = useActionState(
		createEventAction,
		initialState,
	);
	const values = state.values;
	const errors = state.fieldErrors;

	return (
		<form action={formAction} className='contents'>
			<div className='space-y-5'>
				<SectionCard
					title='Cliente y oportunidad'
					description='El cliente conserva la relación comercial; este evento lleva su propio embudo.'
				>
					<div className='grid gap-5 md:grid-cols-2'>
						<div className='space-y-2 md:col-span-2'>
							<ClientCombobox
								name='clientId'
								label='Cliente'
								options={clients}
								defaultId={values?.clientId ?? selectedClientId}
								placeholder='Buscar por nombre o teléfono…'
							/>
							<span className='block text-base font-semibold text-[var(--text-secondary)]'>
								El tipo comercial pertenece al cliente y se usará como base de
								precio.
							</span>
							<FieldError message={errors?.clientId} />
						</div>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Etapa inicial del evento</span>
							<select
								name='funnelStage'
								defaultValue={values?.funnelStage ?? "PROSPECT"}
								className='form-control'
							>
								<option value='PROSPECT'>Prospecto</option>
								<option value='CONTACTED'>Contactado</option>
								<option value='QUOTED'>Cotizado</option>
							</select>
							<span className='block text-base font-semibold text-[var(--text-secondary)]'>
								No cambia el estado de eventos anteriores del mismo cliente.
							</span>
							<FieldError message={errors?.funnelStage} />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Tipo de evento</span>
							<select
								name='eventType'
								defaultValue={values?.eventType ?? "CHILDREN"}
								className='form-control'
							>
								<option value='CHILDREN'>Infantil</option>
								<option value='CORPORATE'>Corporativo</option>
								<option value='INSTITUTIONAL'>Institucional</option>
							</select>
							<span className='block text-base font-semibold text-[var(--text-secondary)]'>
								Describe la ocasión; no reemplaza el tipo comercial del cliente.
							</span>
							<FieldError message={errors?.eventType} />
						</label>
					</div>
				</SectionCard>

				<SectionCard
					title='Fecha y lugar'
					description='La fecha será obligatoria antes de reservar o confirmar.'
				>
					<div className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Nombre del evento</span>
							<input
								name='name'
								defaultValue={values?.name}
								className='form-control'
								placeholder='Cumpleaños de Emma'
							/>
							<FieldError message={errors?.name} />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Fecha</span>
							<input
								type='date'
								name='eventDate'
								defaultValue={values?.eventDate}
								className='form-control'
							/>
							<FieldError message={errors?.eventDate} />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Hora inicio</span>
							<input
								type='time'
								name='startTime'
								defaultValue={values?.startTime}
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Duración (horas)</span>
							<input
								type='number'
								step='0.5'
								name='durationHours'
								defaultValue={values?.durationHours}
								className='form-control'
								placeholder='3'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Tipo de lugar</span>
							<select
								name='venueType'
								defaultValue={values?.venueType ?? "OUTDOOR"}
								className='form-control'
							>
								<option value='INDOOR'>Interior</option>
								<option value='OUTDOOR'>Exterior</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Dirección</span>
							<input
								name='venueAddress'
								defaultValue={values?.venueAddress}
								className='form-control'
								placeholder='Dirección exacta del lugar'
							/>
						</label>
					</div>
				</SectionCard>
			</div>

			<aside className='space-y-5'>
				<section className='surface-card p-5'>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						Listo para cotizar
					</h2>
					<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
						Al guardar, el evento queda disponible para asignar paquete,
						servicios y transporte.
					</p>
					{state.error ? (
						<p className='mt-4 rounded-lg bg-[#ffe0e3] px-4 py-3 text-sm font-black text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}
					<button
						type='submit'
						disabled={pending || clients.length === 0}
						className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Guardando…" : "Guardar evento"}
					</button>
				</section>
			</aside>
		</form>
	);
}
