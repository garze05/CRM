"use client";

import { useActionState } from "react";
import { PhoneInput } from "../../components/phone-input";
import { SectionCard } from "../../components/section-card";
import { ClientTypeFields } from "../client-type-fields";
import { createClientAction, type NewClientState } from "../actions";

const initialState: NewClientState = {};

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<span className='block text-base font-bold text-[var(--error-color)]'>
			{message}
		</span>
	);
}

export function NewClientForm() {
	const [state, formAction, pending] = useActionState(
		createClientAction,
		initialState,
	);
	const values = state.values;
	const errors = state.fieldErrors;

	return (
		<form action={formAction} className='contents'>
			<SectionCard
				title='Datos de contacto'
				description='El teléfono será el identificador natural para evitar duplicados.'
			>
				<div className='grid gap-5 md:grid-cols-2'>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Nombre</span>
						<input
							name='firstName'
							defaultValue={values?.firstName}
							className='form-control'
							placeholder='María'
						/>
						<FieldError message={errors?.firstName} />
					</label>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Apellidos</span>
						<input
							name='lastName'
							defaultValue={values?.lastName}
							className='form-control'
							placeholder='Rodríguez'
						/>
						<FieldError message={errors?.lastName} />
					</label>
					<div>
						<PhoneInput
							name='phone'
							label='Teléfono WhatsApp'
							placeholder='8888 0000'
							defaultValue={values?.phone}
							required
						/>
						<FieldError message={errors?.phone} />
					</div>
					<div className='contents'>
						<ClientTypeFields
							defaultType={values?.type ?? "FAMILY"}
							companyName={values?.companyName}
							companyPhone={values?.companyPhone}
							typeHint='Define la lógica de precios por defecto para sus cotizaciones.'
						/>
						<FieldError message={errors?.type} />
					</div>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
						<span>Notas</span>
						<textarea
							name='notes'
							defaultValue={values?.notes}
							className='form-control min-h-32 resize-none py-3 leading-7'
							placeholder='Contexto del primer contacto, preferencias y próxima acción.'
						/>
					</label>
				</div>
			</SectionCard>

			<aside className='space-y-5'>
				<section className='surface-card p-5'>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						Contacto guardado
					</h2>
					<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
						El cliente queda como contacto del negocio. El embudo comienza al
						crear su primer evento u oportunidad.
					</p>
					{state.error ? (
						<p className='mt-4 rounded-lg bg-[#ffe0e3] px-4 py-3 text-sm font-black text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}
					<button
						type='submit'
						disabled={pending}
						className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Guardando…" : "Guardar cliente"}
					</button>
				</section>
			</aside>
		</form>
	);
}
