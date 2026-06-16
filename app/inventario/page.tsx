import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { InventoryTable } from "./inventory-table";
import { listCatalogItems } from "../lib/server/catalog";

export default async function InventoryPage() {
	const inventoryItems = await listCatalogItems();

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Catálogo" }]}
				title='Catálogo'
				description='Personajes, inflables y decoración para cotizaciones y vista pública.'
				actions={
					<Link
						href='/inventario/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo ítem' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<div className='mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f0ebe4] p-4 text-lg text-[var(--text-secondary)]'>
						<span>
							Este catálogo se comparte con clientes mediante la vista pública
							(sin precios).
						</span>
						<Link
							href='/catalogo'
							target='_blank'
							className='secondary-action flex min-h-11 w-fit items-center gap-2 rounded-full px-4 py-2 text-base font-black transition'
						>
							<IconLabel
								icon='material-symbols:open-in-new-rounded'
								label='Abrir vista pública'
							/>
						</Link>
					</div>

					<InventoryTable rows={inventoryItems} />
				</SectionCard>
			</div>
		</>
	);
}
