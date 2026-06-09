import { CrmShell } from "../components/crm-shell";

export default function SettingsPage() {
	return (
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div>
					<p className='page-kicker mb-2'>Sistema</p>
					<h1 className='page-heading'>Ajustes</h1>
					<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
						Configuración general del CRM y preferencias del equipo.
					</p>
				</div>
			</header>
		</CrmShell>
	);
}
