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

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	// El cliente generado por el provider `prisma-client` no coincide nominalmente
	// con el tipo que espera el adaptador; el contrato de delegados es el mismo.
	adapter: PrismaAdapter(prisma as never),
});
