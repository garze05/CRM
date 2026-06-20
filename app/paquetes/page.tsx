import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import { formatCrc } from "../lib/format";
import { listPackages, listServices } from "../lib/server/packages";
import { getSettings } from "../lib/server/settings";
import { packagePriceBreakdown } from "../lib/domain/pricing";

export default async function PackagesPage({
	searchParams,
}: {
	searchParams: Promise<{ tab?: string }>;
}) {
	const { tab } = await searchParams;
	const activeTab = tab === "servicios" ? "servicios" : "paquetes";
	const [packages, services, settings] = await Promise.all([
		listPackages(),
		listServices(),
		getSettings(),
	]);
	const pricingSettings = {
		surchargeEducationalPercent: Number(settings.surchargeEducationalPercent),
		surchargeCorporatePercent: Number(settings.surchargeCorporatePercent),
		surchargeShoppingCenterPercent: Number(
			settings.surchargeShoppingCenterPercent,
		),
		surchargeAgencyPercent: Number(settings.surchargeAgencyPercent),
		priceRoundingTo: settings.priceRoundingTo,
	};

	return (
		<>
			<PageHeader
				breadcrumb={[
					{ label: "Inicio", href: "/" },
					{ label: "Paquetes y servicios" },
				]}
				title='Paquetes y servicios'
				description='Oferta comercial y precios base.'
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
						className='mb-5 flex w-fit bg-[var(--surface-color)] p-1'
					>
						<Link
							href='/paquetes'
							aria-current={activeTab === "paquetes" ? "page" : undefined}
							className={`min-h-10 rounded-full px-5 py-2 text-base font-black transition ${
								activeTab === "paquetes"
									? "bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "text-[var(--text-secondary)] hover:bg-muted"
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
									: "text-[var(--text-secondary)] hover:bg-muted"
							}`}
						>
							Servicios adicionales
						</Link>
					</nav>

					{activeTab === "paquetes" ? (
						packages.length === 0 ? (
							<div className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-10 text-center'>
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
						) : (
							<ul className='grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3'>
								{packages.map(item => (
									<li
										key={item.id}
										className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
									>
										<div className='flex items-start justify-between gap-3'>
											<div>
												<p className='text-lg font-black text-[var(--text-primary)]'>
													{item.name}
												</p>
												<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
													{item.durationHours} h · {item.itemCount} ítems
												</p>
											</div>
											<StatusBadge value={item.active ? "ACTIVO" : "PAUSADO"} />
										</div>
										<div className='mt-4 space-y-2 text-base'>
											<p className='font-black text-[var(--text-primary)]'>
												Precio base: {formatCrc(item.basePrice)}
											</p>
											<dl className='grid gap-1 text-sm font-semibold text-[var(--text-secondary)]'>
												{packagePriceBreakdown(
													item.basePrice,
													pricingSettings,
												).map(row => (
													<div
														key={row.clientType}
														className='flex items-center justify-between gap-2'
													>
														<dt>{row.label}</dt>
														<dd className='font-black text-[var(--text-primary)]'>
															{formatCrc(row.price)}
														</dd>
													</div>
												))}
											</dl>
										</div>
									</li>
								))}
							</ul>
						)
					) : services.length === 0 ? (
						<div className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-10 text-center'>
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
					) : (
						<ul className='grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3'>
							{services.map(service => (
								<li
									key={service.id}
									className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-4'
								>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<p className='text-lg font-black text-[var(--text-primary)]'>
												{service.name}
											</p>
											<p className='mt-1 text-base font-semibold text-[var(--text-secondary)]'>
												{service.category ?? "General"} · {service.priceType}
											</p>
										</div>
										<StatusBadge
											value={service.active ? "ACTIVO" : "PAUSADO"}
										/>
									</div>
									<p className='mt-4 text-xl font-black text-[var(--primary-color)]'>
										{formatCrc(service.unitPrice)}
									</p>
								</li>
							))}
						</ul>
					)}
				</SectionCard>
			</div>
		</>
	);
}
