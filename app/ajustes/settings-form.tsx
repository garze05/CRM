"use client";

import { useActionState } from "react";
import { AddressPicker } from "../components/address-picker";
import { SectionCard } from "../components/section-card";
import { updateSettingsAction, type SettingsState } from "./actions";

export type SettingsFormValues = {
	currency: string;
	timezone: string;
	quoteValidityDays: number;
	depositPercent: number;
	depositLeadTimeDays: number;
	taxRatePercent: number;
	transportOriginAddress: string;
	transportBasePrice: number;
	transportRatePerKm: number;
	transportFreeKm: number;
	transportOriginLat: number | null;
	transportOriginLng: number | null;
	quantityDiscountPercent: number;
	hoursDiscountPercent: number;
	hoursDiscountMinHours: number;
	maxDiscountPercent: number;
	surchargeEducationalPercent: number;
	surchargeCorporatePercent: number;
	surchargeShoppingCenterPercent: number;
	surchargeAgencyPercent: number;
};

function NumberField({
	name,
	label,
	defaultValue,
	step = "1",
	hint,
}: {
	name: string;
	label: string;
	defaultValue: number;
	step?: string;
	hint?: string;
}) {
	return (
		<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
			<span>{label}</span>
			<input
				type='number'
				name={name}
				defaultValue={defaultValue}
				step={step}
				min='0'
				className='form-control'
			/>
			{hint ? (
				<span className='block text-base font-semibold text-[var(--text-secondary)]'>
					{hint}
				</span>
			) : null}
		</label>
	);
}

const initialState: SettingsState = {};

export function SettingsForm({ values }: { values: SettingsFormValues }) {
	const [state, formAction, pending] = useActionState(
		updateSettingsAction,
		initialState,
	);

	return (
		<form
			action={formAction}
			className='grid min-w-0 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'
		>
			<div className='space-y-5'>
				<SectionCard
					title='Negocio'
					description='Valores base para cotizaciones, documentos y pagos.'
				>
					<div className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Moneda principal</span>
							<select
								name='currency'
								defaultValue={values.currency}
								className='form-control'
							>
								<option value='CRC'>Colones costarricenses</option>
								<option value='USD'>Dólares estadounidenses</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Zona horaria</span>
							<input
								name='timezone'
								defaultValue={values.timezone}
								className='form-control'
							/>
						</label>
						<NumberField
							name='quoteValidityDays'
							label='Vigencia de cotización (días)'
							defaultValue={values.quoteValidityDays}
						/>
						<NumberField
							name='depositPercent'
							label='Porcentaje de anticipo (%)'
							defaultValue={values.depositPercent}
							step='0.01'
						/>
						<NumberField
							name='depositLeadTimeDays'
							label='Anticipo: días antes del evento'
							defaultValue={values.depositLeadTimeDays}
						/>
						<NumberField
							name='taxRatePercent'
							label='IVA (%)'
							defaultValue={values.taxRatePercent}
							step='0.01'
							hint='Se aplica solo cuando la cotización requiere factura.'
						/>
					</div>
				</SectionCard>

				<SectionCard
					title='Transporte'
					description='Base del cálculo de transporte (Google Maps suma la distancia).'
				>
					<div className='grid gap-5 md:grid-cols-2'>
						<AddressPicker
							label='Dirección de origen'
							addressName='transportOriginAddress'
							latName='transportOriginLat'
							lngName='transportOriginLng'
							defaultAddress={values.transportOriginAddress}
							defaultLat={values.transportOriginLat}
							defaultLng={values.transportOriginLng}
							placeholder='Dirección de salida para transporte'
							hint='Esta ubicación es el punto base para calcular transporte.'
							className='md:col-span-2'
						/>
						<NumberField
							name='transportBasePrice'
							label='Tarifa base'
							defaultValue={values.transportBasePrice}
						/>
						<NumberField
							name='transportRatePerKm'
							label='Tarifa por km'
							defaultValue={values.transportRatePerKm}
						/>
						<NumberField
							name='transportFreeKm'
							label='Km sin costo'
							defaultValue={values.transportFreeKm}
						/>
					</div>
				</SectionCard>

				<SectionCard
					title='Reglas de descuento'
					description='Heredadas de las reglas del catálogo; ahora editables aquí.'
				>
					<div className='grid gap-5 md:grid-cols-2'>
						<NumberField
							name='quantityDiscountPercent'
							label='Descuento por cantidad (%)'
							defaultValue={values.quantityDiscountPercent}
							step='0.01'
							hint='Se aplica al 2.º ítem o más del mismo tipo.'
						/>
						<NumberField
							name='hoursDiscountPercent'
							label='Descuento por horas (%)'
							defaultValue={values.hoursDiscountPercent}
							step='0.01'
						/>
						<NumberField
							name='hoursDiscountMinHours'
							label='Horas mínimas para descuento'
							defaultValue={values.hoursDiscountMinHours}
							step='0.5'
						/>
						<NumberField
							name='maxDiscountPercent'
							label='Tope de descuento acumulado (%)'
							defaultValue={values.maxDiscountPercent}
							step='0.01'
						/>
					</div>
				</SectionCard>

				<SectionCard
					title='Recargos por tipo de cliente'
					description='Familiar no tiene recargo (0%). El resto ajusta el precio base.'
				>
					<div className='grid gap-5 md:grid-cols-2'>
						<NumberField
							name='surchargeEducationalPercent'
							label='Educativo / Escuela (%)'
							defaultValue={values.surchargeEducationalPercent}
							step='0.01'
						/>
						<NumberField
							name='surchargeCorporatePercent'
							label='Corporativo / Empresa (%)'
							defaultValue={values.surchargeCorporatePercent}
							step='0.01'
						/>
						<NumberField
							name='surchargeShoppingCenterPercent'
							label='Centro Comercial (%)'
							defaultValue={values.surchargeShoppingCenterPercent}
							step='0.01'
						/>
						<NumberField
							name='surchargeAgencyPercent'
							label='Agencia de Publicidad (%)'
							defaultValue={values.surchargeAgencyPercent}
							step='0.01'
						/>
					</div>
				</SectionCard>
			</div>

			<aside className='space-y-5'>
				<section className='surface-card p-5'>
					<h2 className='text-2xl font-black text-[var(--text-primary)]'>
						Guardar configuración
					</h2>
					<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
						Estos valores se usan al generar cotizaciones y reservaciones.
					</p>
					{state.ok ? (
						<p className='mt-4 rounded-lg bg-[color-mix(in_srgb,var(--success-color)_18%,transparent)] px-4 py-3 text-base font-black text-[var(--success-color)]'>
							Ajustes guardados.
						</p>
					) : null}
					{state.error ? (
						<p className='mt-4 rounded-lg bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] px-4 py-3 text-base font-black text-[var(--error-color)]'>
							{state.error}
						</p>
					) : null}
					<button
						type='submit'
						disabled={pending}
						className='primary-action mt-5 min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:opacity-60'
					>
						{pending ? "Guardando…" : "Guardar ajustes"}
					</button>
				</section>
			</aside>
		</form>
	);
}
