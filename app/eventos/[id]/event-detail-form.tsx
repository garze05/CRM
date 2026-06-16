"use client";

import { useActionState } from "react";
import { ClientCombobox, type ComboOption } from "../../components/client-combobox";
import { updateEventAction, type UpdateEventState } from "../actions";

const initialState: UpdateEventState = {};

export type EventFormData = {
	id: string;
	name: string;
	clientId: string;
	eventType: string;
	funnelStage: string;
	eventDate: string;
	startTime: string;
	guestCount: number | null;
	venueAddress: string;
	internalNotes: string;
};

export function EventDetailForm({
	event,
	clientOptions,
}: {
	event: EventFormData;
	clientOptions: ComboOption[];
}) {
	const [state, formAction, pending] = useActionState(
		updateEventAction,
		initialState,
	);

	return (
		<form action={formAction} className='surface-card min-w-0 p-5 md:p-7'>
			<input type='hidden' name='id' value={event.id} />
			<div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						Datos del evento
					</h2>
					<p className='mt-1 text-lg text-[var(--text-secondary)]'>
						Información operativa y comercial vinculada al cliente.
					</p>
				</div>
				<button
					type='submit'
					disabled={pending}
					className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition disabled:opacity-60'
				>
					{pending ? "Guardando…" : "Guardar cambios"}
				</button>
			</div>

			{state.error ? (
				<p className='mb-4 rounded-lg bg-[#ffe0e3] px-4 py-3 text-sm font-black text-[var(--error-color)]'>
					{state.error}
				</p>
			) : null}
			{state.ok ? (
				<p className='mb-4 rounded-lg bg-[#d8f5f2] px-4 py-3 text-sm font-black text-[var(--secondary-color)]'>
					Cambios guardados.
				</p>
			) : null}

			<div className='grid gap-5 md:grid-cols-2'>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Nombre del evento</span>
					<input name='name' defaultValue={event.name} className='form-control' />
				</label>
				<div className='md:row-span-2'>
					<ClientCombobox
						name='clientId'
						label='Cliente'
						options={clientOptions}
						defaultId={event.clientId}
						placeholder='Buscar por nombre o teléfono…'
					/>
				</div>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Tipo de evento</span>
					<select
						name='eventType'
						defaultValue={event.eventType}
						className='form-control'
					>
						<option value='CHILDREN'>Infantil</option>
						<option value='CORPORATE'>Corporativo</option>
						<option value='INSTITUTIONAL'>Institucional</option>
					</select>
				</label>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Estado del embudo</span>
					<select
						name='funnelStage'
						defaultValue={event.funnelStage}
						className='form-control'
					>
						<option value='PROSPECT'>Prospecto</option>
						<option value='CONTACTED'>Contactado</option>
						<option value='QUOTED'>Cotizado</option>
						<option value='RESERVED'>Reservado</option>
						<option value='CONFIRMED'>Confirmado</option>
						<option value='COMPLETED'>Realizado</option>
						<option value='CANCELED'>Cancelado</option>
					</select>
				</label>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Fecha</span>
					<input
						type='date'
						name='eventDate'
						defaultValue={event.eventDate}
						className='form-control'
					/>
				</label>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Hora inicio</span>
					<input
						type='time'
						name='startTime'
						defaultValue={event.startTime}
						className='form-control'
					/>
				</label>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
					<span>Invitados</span>
					<input
						type='number'
						name='guestCount'
						defaultValue={event.guestCount ?? undefined}
						className='form-control'
					/>
				</label>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
					<span>Dirección</span>
					<input
						name='venueAddress'
						defaultValue={event.venueAddress}
						className='form-control'
						placeholder='Dirección exacta del lugar'
					/>
				</label>
				<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
					<span>Notas internas</span>
					<textarea
						name='internalNotes'
						defaultValue={event.internalNotes}
						className='form-control min-h-28 resize-none py-3 leading-7'
						placeholder='Detalles del lugar, trato del cliente, logística y aprendizajes para futuros eventos.'
					/>
				</label>
			</div>
		</form>
	);
}
