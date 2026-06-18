// Esquema de cliente — usado por los formularios y, en la fase 5, por los
// server actions. Los valores de enums son los de Prisma (código en inglés);
// los mensajes y etiquetas, en español.
import { z } from "zod";
import { phoneSchema } from "./phone";

export const CLIENT_TYPES = [
	"FAMILY",
	"EDUCATIONAL",
	"CORPORATE",
	"SHOPPING_CENTER",
	"ADVERTISING_AGENCY",
] as const;

export const CLIENT_TYPE_LABELS: Record<(typeof CLIENT_TYPES)[number], string> =
	{
		FAMILY: "Familiar",
		EDUCATIONAL: "Educativo",
		CORPORATE: "Corporativo",
		SHOPPING_CENTER: "Centro Comercial",
		ADVERTISING_AGENCY: "Agencia de Publicidad",
	};

/** Tipos con datos de empresa (todos menos Familiar). La UI muestra los campos
 * de empresa solo para estos tipos. */
export const COMPANY_CLIENT_TYPES = CLIENT_TYPES.filter(
	t => t !== "FAMILY",
) as Exclude<(typeof CLIENT_TYPES)[number], "FAMILY">[];

export const clientSchema = z.object({
	firstName: z.string().trim().min(1, "El nombre es obligatorio"),
	lastName: z.string().trim().min(1, "Los apellidos son obligatorios"),
	phone: phoneSchema,
	type: z.enum(CLIENT_TYPES, {
		message: "Seleccioná un tipo de cliente válido",
	}),
	companyName: z.string().trim().optional(),
	companyPhone: z.string().trim().optional(),
	notes: z.string().trim().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
