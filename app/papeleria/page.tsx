import { Breadcrumb } from "../components/breadcrumb";

export default function PaperworkPage() {
	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div>
					<Breadcrumb
						items={[
							{ label: "Inicio", href: "/" },
							{ label: "Papelería" },
						]}
					/>
					<h1 className='page-heading'>Papelería</h1>
					<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
						Espacio para recuperación o definitiva eliminación de todos los
						recursos de Gestión.
					</p>
				</div>
			</header>
		</>
	);
}
