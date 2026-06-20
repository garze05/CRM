export const AUTH_BYPASS_ENV = "OKIDOKI_AUTH_BYPASS";

export function isAuthBypassEnabled(): boolean {
	return process.env[AUTH_BYPASS_ENV] === "true";
}

export const bypassUser = {
	id: "auth-bypass",
	name: "Modo prueba",
	email: "pruebas@okidokicr.local",
	image: null,
};
