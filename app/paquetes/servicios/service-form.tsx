"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import { useActionState, useState } from "react";
import { formatCrc } from "../../lib/format";
import { SERVICE_PRICE_TYPE_LABELS } from "../../lib/domain/package-builder";
import {
	createServiceAction,
	updateServiceAction,
	type ServiceFormState,
} from "./actions";

addCollection(materialSymbolsIcons);

const initialState: ServiceFormState = {};

const PRICE_TYPE_OPTIONS = ["FIXED", "PER_HOUR", "PER_UNIT"] as const;

type ServiceFormProps = {
	categories: string[];
	mode?: "create" | "edit";
	serviceId?: string;
	initialValues?: {
		name: string;
		category: string;
		unitPrice: string;
		priceType: string;
		active: boolean;
		standaloneSellable: boolean;
	};
};

/** Formulario de creación/edición de un servicio adicional. */
export function ServiceForm({
	categories,
	mode = "create",
	serviceId,
	initialValues,
}: ServiceFormProps) {
	const isEdit = mode === "edit";
	const [state, formAction, pending] = useActionState(
		isEdit ? updateServiceAction : createServiceAction,
		initialState,
	);
	const [name, setName] = useState(initialValues?.name ?? "");
	const [category, setCategory] = useState(initialValues?.category ?? "");
	const [unitPrice, setUnitPrice] = useState(initialValues?.unitPrice ?? "");
	const [priceType, setPriceType] = useState(
		initialValues?.priceType ?? "FIXED",
	);
	const [active, setActive] = useState(initialValues?.active ?? true);
	const [standaloneSellable, setStandaloneSellable] = useState(
		initialValues?.standaloneSellable ?? false,
	);

	const priceValue = Number(unitPrice);
	const validationIssues: string[] = [];
	if (name.trim() === "") validationIssues.push("El servicio necesita un nombre.");
	if (unitPrice.trim() === "" || !Number.isFinite(priceValue) || priceValue < 0) {
		validationIssues.push("Definí un precio válido.");
	}

	return (
		<form action={formAction} className='surface-card mx-auto max-w-2xl p-5'>
			{isEdit && serviceId ? (
				<input type='hidden' name='serviceId' value={serviceId} />
			) : null}

			<div className='grid gap-4'>
				<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
					<span>Nombre del servicio</span>
					<input
						name='name'
						value={name}
						onChange={event => setName(event.target.value)}
						placeholder='Ej. Hora adicional de animación'
						className='form-control'
					/>
				</label>

				<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
					<span>Categoría</span>
					<input
						name='categoryNew'
						list='service-categories'
						value={category}
						onChange={event => setCategory(event.target.value)}
						placeholder='Elegí una existente o escribí una nueva'
						className='form-control'
					/>
					<datalist id='service-categories'>
						{categories.map(option => (
							<option key={option} value={option} />
						))}
					</datalist>
					<span className='block text-sm font-semibold text-[var(--text-secondary)]'>
						Las categorías agrupan los servicios al armar paquetes (Sonido,
						Botargas, Animación…).
					</span>
				</label>

				<div className='grid gap-4 sm:grid-cols-2'>
					<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
						<span>Precio (₡)</span>
						<input
							type='number'
							name='unitPrice'
							min='0'
							value={unitPrice}
							onChange={event => setUnitPrice(event.target.value)}
							placeholder='15000'
							className='form-control'
						/>
					</label>

					<label className='space-y-2 text-base font-bold text-[var(--text-primary)]'>
						<span>Tipo de precio</span>
						<select
							name='priceType'
							value={priceType}
							onChange={event => setPriceType(event.target.value)}
							className='form-control'
						>
							{PRICE_TYPE_OPTIONS.map(option => (
								<option key={option} value={option}>
									{`Precio ${SERVICE_PRICE_TYPE_LABELS[option]}`}
								</option>
							))}
						</select>
					</label>
				</div>

				{priceValue > 0 ? (
					<p className='rounded-lg bg-muted px-3 py-2 text-sm font-semibold text-[var(--text-secondary)]'>
						Se mostrará como{" "}
						<span className='font-black text-[var(--primary-color)]'>
							{formatCrc(priceValue)}
							{priceType === "PER_HOUR" ? "/h" : ""}
						</span>
					</p>
				) : null}

				<label className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 text-base font-bold text-[var(--text-primary)]'>
					<input
						type='checkbox'
						name='standaloneSellable'
						checked={standaloneSellable}
						onChange={event => setStandaloneSellable(event.target.checked)}
						className='h-5 w-5 shrink-0 accent-[var(--accent-color)]'
					/>
					<span>
						Se puede vender suelto
						<span className='block text-sm font-semibold text-[var(--text-secondary)]'>
							Permití ofrecerlo como extra sobre el paquete (ej. hora adicional,
							transporte). Si no, solo sirve para armar paquetes.
						</span>
					</span>
				</label>

				<label className='flex items-center gap-3 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4 text-base font-bold text-[var(--text-primary)]'>
					<input
						type='checkbox'
						name='active'
						checked={active}
						onChange={event => setActive(event.target.checked)}
						className='h-5 w-5 shrink-0 accent-[var(--accent-color)]'
					/>
					<span>
						Servicio activo
						<span className='block text-sm font-semibold text-[var(--text-secondary)]'>
							Los servicios pausados no aparecen al armar paquetes.
						</span>
					</span>
				</label>

				{validationIssues.length > 0 ? (
					<ul
						className='list-none space-y-1 rounded-lg bg-[color-mix(in_srgb,var(--tertiary-color)_30%,transparent)] p-4 text-base font-bold text-[var(--warning-color)]'
						aria-label='Pendientes para completar el servicio'
					>
						{validationIssues.map(issue => (
							<li key={issue} className='flex items-center gap-2'>
								<Icon
									icon='material-symbols:info-rounded'
									className='h-5 w-5 shrink-0'
									aria-hidden='true'
								/>
								<span>{issue}</span>
							</li>
						))}
					</ul>
				) : null}

				{state.error ? (
					<p className='rounded-lg bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] p-4 text-base font-bold text-[var(--error-color)]'>
						{state.error}
					</p>
				) : null}

				<button
					type='submit'
					disabled={pending || validationIssues.length > 0}
					className='primary-action min-h-12 w-full rounded-full px-5 py-3 text-base font-black transition disabled:cursor-not-allowed disabled:opacity-50'
				>
					{pending
						? "Guardando…"
						: isEdit
							? "Guardar cambios"
							: "Crear servicio"}
				</button>
			</div>
		</form>
	);
}
