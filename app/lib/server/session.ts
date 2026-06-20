// Helpers de sesión server-side. Resuelven el usuario autenticado actual a su
// fila en la BD (User), p. ej. para fijar el responsable de un cliente.
import "server-only";
import { auth } from "../auth";
import { prisma } from "../db";

/**
 * Id del usuario de la sesión actual, resuelto por email contra la tabla User.
 * Devuelve null si no hay sesión o el usuario no está persistido todavía.
 */
export async function currentUserId(): Promise<string | null> {
	const session = await auth();
	const email = session?.user?.email;
	if (!email) return null;
	const user = await prisma.user.findUnique({
		where: { email },
		select: { id: true },
	});
	return user?.id ?? null;
}
