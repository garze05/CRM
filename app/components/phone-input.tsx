"use client";

import { useState } from "react";
import PhoneInputBase, {
	isValidPhoneNumber,
	parsePhoneNumber,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es";
import "react-phone-number-input/style.css";

function toE164(input?: string): string | undefined {
	if (!input) {
		return undefined;
	}
	// Acepta E.164 ("+50688881144"), con espacios ("+506 8888 1144")
	// o nacional de Costa Rica ("88881144").
	const parsed = parsePhoneNumber(input, "CR");
	return parsed?.number;
}

/**
 * Teléfono con selector de país (bandera), Costa Rica por defecto y formateo
 * automático mientras se escribe (ej. "8888 7777"). Emite E.164 en un input
 * oculto (`name`) para los server actions; la validación compartida vive en
 * app/lib/validation/phone.ts.
 */
export function PhoneInput({
	name,
	label,
	defaultValue,
	placeholder = "8888 7777",
	required,
}: {
	/** Nombre del campo oculto con el valor E.164 (ej. "+50688887777"). */
	name?: string;
	label: string;
	/** E.164 o formato nacional CR. */
	defaultValue?: string;
	placeholder?: string;
	required?: boolean;
}) {
	const [value, setValue] = useState<string | undefined>(() =>
		toE164(defaultValue),
	);
	const [touched, setTouched] = useState(false);

	const showError = touched && Boolean(value) && !isValidPhoneNumber(value ?? "");

	return (
		<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
			<span>{label}</span>
			<PhoneInputBase
				defaultCountry='CR'
				international={false}
				countryOptionsOrder={["CR", "NI", "PA", "US", "..."]}
				labels={es}
				flags={flags}
				value={value}
				onChange={setValue}
				onBlur={() => setTouched(true)}
				className='phone-input'
				numberInputProps={{
					className: "form-control",
					placeholder,
					required,
				}}
			/>
			{name ? <input type='hidden' name={name} value={value ?? ""} /> : null}
			{showError ? (
				<span className='block text-base font-bold text-[var(--error-color)]'>
					Número de teléfono inválido para el país seleccionado.
				</span>
			) : null}
		</label>
	);
}
