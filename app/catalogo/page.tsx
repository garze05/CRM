import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InventoryThumbnail } from "../components/entity-thumbnail";
import { StatusBadge } from "../components/status-badge";
import {
	CATALOG_CATEGORY_LABELS,
	CATALOG_CATEGORY_QUERY,
} from "../lib/domain/catalog";
import { listActiveCatalogItems } from "../lib/server/catalog";

export const metadata: Metadata = {
	title: "Catálogo OkiDoki — Personajes, inflables y animación",
	description:
		"Personajes botarga, inflables, decoración y animación para fiestas infantiles, eventos escolares y corporativos en Costa Rica.",
};

// Número de WhatsApp del negocio (PENDIENTE NEGOCIO: confirmar número oficial).
const WHATSAPP_NUMBER = "50688880000";

const CATEGORIES = [
	{ value: "", label: "Todo" },
	{ value: "PERSONAJE", label: "Personajes" },
	{ value: "INFLABLE", label: "Inflables" },
	{ value: "DECORACION", label: "Decoración" },
	{ value: "SERVICIO", label: "Servicios" },
	{ value: "OTRO", label: "Otros" },
] as const;

function whatsappHref(itemName?: string) {
	const message = itemName
		? `Hola OkiDoki, me interesa "${itemName}" para un evento. ¿Me pueden dar más información?`
		: "Hola OkiDoki, quiero información para un evento.";
	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Vista pública del catálogo (sin login): se comparte por WhatsApp como
 * material de ventas. Sin precios por decisión de negocio — la conversación
 * de precio ocurre en WhatsApp.
 */
export default async function PublicCatalogPage({
	searchParams,
}: {
	searchParams: Promise<{ categoria?: string }>;
}) {
	const { categoria } = await searchParams;
	const inventoryItems = await listActiveCatalogItems();
	const categoryFilter = categoria ? CATALOG_CATEGORY_QUERY[categoria] : "";

	const visibleItems = inventoryItems.filter(
		item => !categoryFilter || item.category === categoryFilter,
	);

	return (
		<div className='min-h-screen bg-[var(--background-color)] text-[var(--text-primary)]'>
			<header className='border-b border-[color:var(--border-color)] bg-[var(--surface-color)] px-5 py-4'>
				<div className='mx-auto flex max-w-5xl items-center justify-between gap-4'>
					<Image
						src='/okidokicrm_black_logo.png'
						alt='OkiDoki'
						width={160}
						height={60}
						priority
						className='h-auto max-h-16 w-auto object-contain'
					/>
					<a
						href={whatsappHref()}
						target='_blank'
						rel='noreferrer'
						className='primary-action flex min-h-12 items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						Escribinos por WhatsApp
					</a>
				</div>
			</header>

			<main className='mx-auto max-w-5xl px-5 pb-16'>
				<section className='py-8 text-center'>
					<h1 className='page-heading'>Nuestro catálogo</h1>
					<p className='mx-auto mt-3 max-w-2xl text-xl font-semibold text-[var(--text-secondary)]'>
						Personajes, inflables y animación para cumpleaños, eventos
						escolares y corporativos.
					</p>
				</section>

				<nav
					aria-label='Categorías'
					className='mb-6 flex flex-wrap justify-center gap-2'
				>
					{CATEGORIES.map(category => {
						const isActive = (categoria ?? "") === category.value;
						return (
							<Link
								key={category.value}
								href={
									category.value
										? `/catalogo?categoria=${category.value}`
										: "/catalogo"
								}
								aria-current={isActive ? "page" : undefined}
								className={`min-h-11 rounded-full border px-5 py-2.5 text-base font-black transition ${
									isActive
										? "border-transparent bg-[var(--accent-color)] text-[var(--on-accent)]"
										: "border-[color:var(--border-color)] bg-[var(--surface-color)] text-[var(--text-secondary)] hover:bg-muted"
								}`}
							>
								{category.label}
							</Link>
						);
					})}
				</nav>

				{visibleItems.length === 0 ? (
					<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-10 text-center text-xl font-bold text-[var(--text-secondary)]'>
						Pronto agregaremos opciones en esta categoría. ¡Escribinos y te
						contamos qué tenemos disponible!
					</p>
				) : (
					<ul className='grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3'>
						{visibleItems.map(item => (
							<li
								key={item.id}
								className='surface-card flex flex-col overflow-hidden'
							>
								<div className='p-4 pb-0'>
									<InventoryThumbnail category={item.category} size='lg' />
								</div>
								<div className='flex flex-1 flex-col p-4'>
									<div className='flex items-start justify-between gap-2'>
										<h2 className='text-xl font-black text-[var(--text-primary)]'>
											{item.name}
										</h2>
										<StatusBadge
											value={item.category}
											label={CATALOG_CATEGORY_LABELS[item.category]}
										/>
									</div>
									<p className='mt-2 flex-1 text-base font-semibold text-[var(--text-secondary)]'>
										{item.description}
									</p>
									<a
										href={whatsappHref(item.name)}
										target='_blank'
										rel='noreferrer'
										className='secondary-action mt-4 flex min-h-12 items-center justify-center rounded-full px-4 py-3 text-base font-black transition'
									>
										Consultar por WhatsApp
									</a>
								</div>
							</li>
						))}
					</ul>
				)}
			</main>

			<footer className='border-t border-[color:var(--border-color)] bg-[var(--surface-color)] px-5 py-8 text-center'>
				<p className='text-lg font-bold text-[var(--text-secondary)]'>
					OkiDoki · Eventos infantiles y corporativos en Costa Rica
				</p>
				<a
					href={whatsappHref()}
					target='_blank'
					rel='noreferrer'
					className='mt-3 inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--secondary-color)] px-6 py-3 text-base font-black text-secondary-foreground transition hover:bg-[var(--secondary-hover)]'
				>
					Cotizá tu evento por WhatsApp
				</a>
			</footer>
		</div>
	);
}
