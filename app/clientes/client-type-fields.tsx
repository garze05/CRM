"use client";

import { useState } from "react";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS } from "../lib/validation/client";

/**
 * Selector de tipo comercial + datos de empresa. Los campos de empresa
 * (nombre y teléfono) solo se muestran cuando el tipo es distinto de Familiar,
 * según la regla de negocio del alta/edición de clientes.
 */
export function ClientTypeFields({
	defaultType = "FAMILY",
	companyName,
	companyPhone,
	typeHint,
}: {
	defaultType?: string;
	companyName?: string | null;
	companyPhone?: string | null;
	typeHint?: string;
}) {
	const [type, setType] = useState(defaultType);
	const showCompany = type !== "FAMILY";

	return (
		<>
			<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
				<span>Tipo comercial</span>
				<select
					name='type'
					value={type}
					onChange={e => setType(e.target.value)}
					className='form-control'
				>
					{CLIENT_TYPES.map(value => (
						<option key={value} value={value}>
							{CLIENT_TYPE_LABELS[value]}
						</option>
					))}
				</select>
				{typeHint ? (
					<span className='block text-base font-semibold text-[var(--text-secondary)]'>
						{typeHint}
					</span>
				) : null}
			</label>

			{showCompany ? (
				<>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Empresa / Institución</span>
						<input
							name='companyName'
							defaultValue={companyName ?? ""}
							className='form-control'
							placeholder='Nombre de la empresa o institución'
						/>
					</label>
					<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
						<span>Teléfono de empresa</span>
						<input
							name='companyPhone'
							defaultValue={companyPhone ?? ""}
							className='form-control'
							placeholder='2222 2222'
						/>
					</label>
				</>
			) : null}
		</>
	);
}
