// Pantalla de inicio de sesión. Fuera del shell autenticado.
import Image from "next/image";
import { redirect } from "next/navigation";
import { Icon } from "@iconify/react";
import { auth, signIn } from "@/app/lib/auth";

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const session = await auth();
	if (session?.user) {
		redirect("/");
	}

	const { error } = await searchParams;

	return (
		<main className='grid min-h-screen place-items-center bg-[var(--background-color)] px-5'>
			<div className='surface-card w-full max-w-md p-8 text-center'>
				<Image
					src='/okidokicrm_black_logo.png'
					alt='OkiDoki CRM'
					width={220}
					height={80}
					priority
					className='mx-auto mb-6 h-auto max-h-24 w-auto object-contain'
				/>
				<h1 className='text-2xl font-black text-[var(--text-primary)]'>
					Ingresá al CRM
				</h1>
				<p className='mt-2 text-lg font-semibold text-[var(--text-secondary)]'>
					Acceso exclusivo para el equipo de OkiDoki con su cuenta de Google.
				</p>

				{error ? (
					<p className='mt-5 rounded-lg bg-[#ffe0e3] px-4 py-3 text-sm font-black text-[var(--error-color)]'>
						No se pudo iniciar sesión. Verificá que usás una cuenta autorizada
						del equipo.
					</p>
				) : null}

				<form
					action={async () => {
						"use server";
						await signIn("google", { redirectTo: "/" });
					}}
				>
					<button
						type='submit'
						className='primary-action mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-base font-black transition'
					>
						<Icon
							icon='material-symbols:login-rounded'
							className='h-5 w-5 shrink-0'
							aria-hidden='true'
						/>
						<span>Continuar con Google</span>
					</button>
				</form>
			</div>
		</main>
	);
}
