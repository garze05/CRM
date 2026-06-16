// Configuración de Auth.js compartida entre el middleware (edge) y el runtime
// completo (Node). NO importa Prisma ni el adaptador: debe poder ejecutarse en
// el edge para que el middleware proteja rutas sin tocar la base de datos.
//
// Estrategia de sesión: JWT. Razones:
//   1. El middleware valida la sesión sin consultar Postgres (edge-safe).
//   2. Guardamos el `id_token` de Google en el JWT para reenviarlo a la
//      Quotation API (ver app/lib/integrations/quotation-api.ts). El id_token
//      es la credencial que la API verifica — misma audiencia (AUTH_GOOGLE_ID).
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Prefijos públicos: el catálogo es vista pública (sin login) y las rutas de
// auth deben ser accesibles para poder iniciar sesión.
const PUBLIC_PREFIXES = ["/catalogo", "/login", "/api/auth"];

function isPublicPath(pathname: string): boolean {
	return PUBLIC_PREFIXES.some(
		prefix => pathname === prefix || pathname.startsWith(`${prefix}/`),
	);
}

function getProfilePicture(profile: unknown): string | null {
	if (
		typeof profile === "object" &&
		profile !== null &&
		"picture" in profile &&
		typeof profile.picture === "string"
	) {
		return profile.picture;
	}

	return null;
}

async function getGoogleUserInfoPicture(
	accessToken: string | undefined,
): Promise<string | null> {
	if (!accessToken) {
		return null;
	}

	try {
		const response = await fetch(
			"https://openidconnect.googleapis.com/v1/userinfo",
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			},
		);

		if (!response.ok) {
			return null;
		}

		return getProfilePicture(await response.json());
	} catch {
		return null;
	}
}

export const authConfig = {
	trustHost: true,
	session: { strategy: "jwt" },
	pages: { signIn: "/login" },
	providers: [
		Google({
			// access_type=offline + prompt=consent para recibir refresh_token la
			// primera vez; el id_token llega por el scope openid por defecto.
			authorization: {
				params: {
					access_type: "offline",
					prompt: "consent",
					scope: "openid email profile",
				},
			},
		}),
	],
	callbacks: {
		// Usado por el middleware para autorizar cada request.
		authorized({ auth, request }) {
			const { pathname } = request.nextUrl;
			if (isPublicPath(pathname)) return true;
			return !!auth?.user;
		},
		// Solo cuentas verificadas del dominio autorizado entran (decisión de
		// negocio del MVP: sin roles, cualquiera del dominio tiene acceso total).
		signIn({ profile, user }) {
			const domain = process.env.ALLOWED_EMAIL_DOMAIN;
			if (!domain) return true;
			const email = (profile?.email ?? user?.email ?? "").toLowerCase();
			const verified = profile?.email_verified;
			return verified === true && email.endsWith(`@${domain.toLowerCase()}`);
		},
		// Persistimos el id_token de Google en el JWT al iniciar sesión.
		async jwt({ token, account, profile, user }) {
			const profilePicture = getProfilePicture(profile);
			const userInfoPicture = await getGoogleUserInfoPicture(
				account?.access_token,
			);
			if (account) {
				token.idToken = account.id_token;
				// Vencimiento del id_token (epoch segundos) para detectar expiración.
				token.idTokenExpires = account.expires_at;
			}
			token.picture =
				user?.image ??
				profilePicture ??
				userInfoPicture ??
				token.picture;
			return token;
		},
		session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			if (session.user && typeof token.picture === "string") {
				session.user.image = token.picture;
			}
			// id_token de Google para reenviar a la Quotation API. SOLO uso
			// server-side (no pasar la sesión completa a componentes cliente).
			session.idToken = token.idToken as string | undefined;
			session.idTokenExpires = token.idTokenExpires as number | undefined;
			return session;
		},
	},
} satisfies NextAuthConfig;
