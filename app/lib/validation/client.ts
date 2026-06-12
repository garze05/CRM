// Esquema de cliente — usado por los formularios y, en la fase 5, por los
// server actions. Los valores de enums son los de Prisma (código en inglés);
// los mensajes y etiquetas, en español.
import { z } from "zod";
import { phoneSchema } from "./phone";

export const CLIENT_TYPES = ["FAMILY", "EDUCATIONAL", "CORPORATE"] as const;

export const CLIENT_TYPE_LABELS: Record<(typeof CLIENT_TYPES)[number], string> =
	{
		FAMILY: "Familiar",
		EDUCATIONAL: "Educativo",
		CORPORATE: "Corporativo",
	};

export const clientSchema = z.object({
	firstName: z.string().trim().min(1, "El nombre es obligatorio"),
	lastName: z.string().trim().min(1, "Los apellidos son obligatorios"),
	phone: phoneSchema,
	type: z.enum(CLIENT_TYPES, {
		message: "Seleccioná un tipo de cliente válido",
	}),
	notes: z.string().trim().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;
