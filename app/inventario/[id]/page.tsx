import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/breadcrumb";
import { PhotoThumbnailControl } from "../../components/photo-thumbnail-control";
import { StatusBadge } from "../../components/status-badge";
import {
	CATALOG_AVAILABILITY_LABELS,
	CATALOG_CATEGORY_LABELS,
} from "../../lib/domain/catalog";
import { getCatalogItem } from "../../lib/server/catalog";

export default async function InventoryDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const item = await getCatalogItem(id);

	if (!item) {
		notFound();
	}

	const availabilityBadge =
		item.availabilityStatus === "RESERVED"
			? "RESERVED_INVENTORY"
			: item.availabilityStatus;

	return (
		<>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[
								{ label: "Inicio", href: "/" },
								{ label: "Catálogo", href: "/inventario" },
								{ label: item.name },
							]}
						/>
						<div className='flex flex-wrap items-center gap-3'>
							<h1 className='page-heading'>{item.name}</h1>
							<StatusBadge value={item.active ? "ACTIVO" : "PAUSADO"} />
						</div>
					</div>
					<button className='primary-action min-h-12 rounded-full px-5 py-3 text-base font-black transition'>
						Guardar cambios
					</button>
				</div>
			</header>

			<div className='grid min-w-0 flex-1 gap-5 px-5 pb-28 md:px-8 md:pb-8 xl:grid-cols-[minmax(0,1fr)_360px]'>
				<section className='surface-card min-w-0 p-5 md:p-7'>
						<div className='mb-6'>
							<h2 className='text-2xl font-black text-[var(--text-primary)]'>
								Datos del inventario
							</h2>
					</div>
					<form className='grid gap-5 md:grid-cols-2'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Nombre</span>
							<input defaultValue={item.name} className='form-control' />
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Categoría</span>
							<select defaultValue={item.category} className='form-control'>
								<option value='CHARACTER'>Personaje</option>
								<option value='INFLATABLE'>Inflable</option>
								<option value='DECORATION'>Decoración</option>
								<option value='SERVICE'>Servicio</option>
								<option value='OTHER'>Otro</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select defaultValue={item.active ? "ACTIVO" : "PAUSADO"} className='form-control'>
								<option value='ACTIVO'>Activo</option>
								<option value='PAUSADO'>Pausado</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Disponibilidad</span>
							<select
								defaultValue={item.availabilityStatus}
								className='form-control'
							>
								<option value='AVAILABLE'>Disponible</option>
								<option value='RESERVED'>Reservado</option>
								<option value='MAINTENANCE_PENDING'>Mantenimiento</option>
							</select>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Descripción</span>
							<textarea
								defaultValue={item.description}
								className='form-control min-h-28 resize-none py-3 leading-7'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)] md:col-span-2'>
							<span>Etiquetas</span>
							<input defaultValue={item.tags.join(", ")} className='form-control' />
						</label>
					</form>
				</section>

				<aside className='min-w-0 space-y-5'>
					<section className='surface-card p-5'>
						<div className='mb-5'>
							<PhotoThumbnailControl
								kind='inventory'
								name={item.name}
								category={item.category}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<StatusBadge
								value={item.category}
								label={CATALOG_CATEGORY_LABELS[item.category]}
							/>
							<StatusBadge
								value={availabilityBadge}
								label={CATALOG_AVAILABILITY_LABELS[item.availabilityStatus]}
							/>
						</div>
					</section>
				</aside>
			</div>
		</>
	);
}
