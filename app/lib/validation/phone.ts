// Validación y normalización de teléfonos — compartida entre PhoneInput
// (cliente) y los server actions (fase 5). El identificador natural del
// negocio es el teléfono de WhatsApp; siempre se persiste en E.164.
import {
	isValidPhoneNumber,
	parsePhoneNumberFromString,
	type CountryCode,
} from "libphonenumber-js";
import { z } from "zod";

export const phoneSchema = z
	.string()
	.min(1, "El teléfono es obligatorio")
	.refine(value => isValidPhoneNumber(value), {
		message: "Número de teléfono inválido",
	});

export type NormalizedPhone = {
	/** E.164, ej. "+50688887777" — valor único en BD. */
	e164: string;
	/** Código ISO del país, ej. "CR". */
	country: string;
	/** Formato nacional para mostrar, ej. "8888 7777". */
	formatted: string;
};

/**
 * Normaliza una entrada (E.164, con espacios o nacional) a los tres campos
 * que persiste el modelo Client/Collaborator. Devuelve null si es inválida.
 */
export function normalizePhone(
	input: string,
	defaultCountry: CountryCode = "CR",
): NormalizedPhone | null {
	const parsed = parsePhoneNumberFromString(input, defaultCountry);

	if (!parsed || !parsed.isValid()) {
		return null;
	}

	return {
		e164: parsed.number,
		country: parsed.country ?? defaultCountry,
		formatted: parsed.formatNational().replace(/-/g, " "),
	};
}
