// Proxy (antes "middleware") de protección de rutas — Next 16 renombró la
// convención. Usa solo la config edge-safe (sin Prisma): el callback
// `authorized` de authConfig decide qué pasa. /catalogo, /login y /api/auth
// quedan públicos; todo lo demás exige sesión.
import NextAuth from "next-auth";
import { authConfig } from "@/app/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
	// Corre en todo excepto assets estáticos y el optimizador de imágenes.
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
