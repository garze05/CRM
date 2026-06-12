import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";

// Regla del MVP: la aplicación NO asume paquetes ni servicios iniciales.
// Estas listas se llenan desde el creador de paquetes y la migración de
// precios del Sheets (fase 2); mientras tanto los estados vacíos guían.
const packages: never[] = [];
const services: never[] = [];

export default async function PackagesPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const { tab } = await searchParams;
	const activeTab = tab === "servicios" ? "servicios" : "paquetes";

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Paquetes y servicios" },
				]}
				title='Paquetes y servicios'
				description='La oferta comercial: paquetes por tipo de cliente y servicios adicionales.'
				actions={
					<Link
						href='/paquetes/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Crear paquete' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<nav
						aria-label='Sección de oferta'
						className='mb-5 flex w-fit rounded-full border border-[color:var(--border-color)] bg-[var(--surface-color)] p-1'
					>
						<Link
							href='/paquetes'
							aria-current={activeTab === "paquetes" ? "page" : undefined}
							className={`min-h-10 rounded-full px-5 py-2 text-base font-black transition ${
								activeTab === "paquetes"
									? "bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
							}`}
						>
							Paquetes
						</Link>
						<Link
							href='/paquetes?tab=servicios'
							aria-current={activeTab === "servicios" ? "page" : undefined}
							className={`min-h-10 rounded-full px-5 py-2 text-base font-black transition ${
								activeTab === "servicios"
									? "bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
							}`}
						>
							Servicios adicionales
						</Link>
					</nav>

					{activeTab === "paquetes" ? (
						packages.length === 0 ? (
							<div className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-10 text-center'>
								<p className='text-2xl font-black text-[var(--text-primary)]'>
									Sin paquetes todavía
								</p>
								<p className='mx-auto mt-2 max-w-xl text-lg font-semibold text-[var(--text-secondary)]'>
									Creá el primer paquete combinando personajes y servicios del
									catálogo, con precio por tipo de cliente (familiar, educativo
									y corporativo).
								</p>
								<Link
									href='/paquetes/nuevo'
									className='primary-action mx-auto mt-5 flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
								>
									<IconLabel label='Crear el primer paquete' />
								</Link>
							</div>
						) : null
					) : services.length === 0 ? (
						<div className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-10 text-center'>
							<p className='text-2xl font-black text-[var(--text-primary)]'>
								Sin servicios adicionales todavía
							</p>
							<p className='mx-auto mt-2 max-w-xl text-lg font-semibold text-[var(--text-secondary)]'>
								Los servicios à la carte (hora adicional, pintacaritas,
								transporte especial…) se importarán desde el catálogo de precios
								actual durante la migración de datos, y podrán administrarse
								aquí.
							</p>
						</div>
					) : null}
				</SectionCard>
			</div>
		</>
	);
}
