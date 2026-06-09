import { CrmShell } from "../components/crm-shell";

export default function PaperworkPage() {
	return (
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div>
					<p className='page-kicker mb-2'>Sistema</p>
					<h1 className='page-heading'>Papelería</h1>
					<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
						Espacio para documentos, registros descartados y material operativo.
					</p>
				</div>
			</header>
		</CrmShell>
	);
}
