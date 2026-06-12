// Esquema de colaborador — formularios hoy, server actions en fase 5.
import { z } from "zod";
import { phoneSchema } from "./phone";

export const COLLABORATOR_ROLES = [
	"MASCOT_COSTUME",
	"ENTERTAINER",
	"LOGISTICS",
	"OTHER",
] as const;

export const COLLABORATOR_ROLE_LABELS: Record<
	(typeof COLLABORATOR_ROLES)[number],
	string
> = {
	MASCOT_COSTUME: "Botarga",
	ENTERTAINER: "Animador",
	LOGISTICS: "Logística",
	OTHER: "Otro",
};

export const collaboratorSchema = z.object({
	firstName: z.string().trim().min(1, "El nombre es obligatorio"),
	lastName: z.string().trim().min(1, "Los apellidos son obligatorios"),
	phone: phoneSchema.optional(),
	role: z.enum(COLLABORATOR_ROLES, {
		message: "Seleccioná un rol válido",
	}),
	characterIds: z.array(z.string().uuid()).optional(),
	notes: z.string().trim().optional(),
});

export type CollaboratorInput = z.infer<typeof collaboratorSchema>;
