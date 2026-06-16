// Extensiones de tipos de Auth.js: id de usuario en la sesión e id_token de
// Google en el JWT (para reenviarlo a la Quotation API).
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		idToken?: string;
		idTokenExpires?: number;
	}
}
