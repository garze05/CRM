// Runtime completo de Auth.js (Node). Combina la config compartida con el
// PrismaAdapter para persistir User/Account. Con estrategia JWT, la tabla
// Session no se usa, pero el adaptador sigue guardando usuarios y cuentas
// (incluido el id_token de Google) al iniciar sesión.
//
// Este módulo importa Prisma → NO debe usarse en el middleware (edge). El
// middleware usa solo auth.config.ts.
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { authConfig } from "./auth.config";
import { bypassUser, isAuthBypassEnabled } from "./auth-bypass";

const nextAuth = NextAuth({
	...authConfig,
	// El cliente generado por el provider `prisma-client` no coincide nominalmente
	// con el tipo que espera el adaptador; el contrato de delegados es el mismo.
	adapter: PrismaAdapter(prisma as never),
});

export const { handlers, signIn, signOut } = nextAuth;

export async function auth() {
	if (isAuthBypassEnabled()) {
		return {
			user: bypassUser,
			expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
		};
	}

	return nextAuth.auth();
}
