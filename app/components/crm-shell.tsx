"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

addCollection(materialSymbolsIcons);

type NavigationItem = {
	label: string;
	href: string;
	icon: string;
	activeMatch?: string;
};

const homeItem: NavigationItem = {
	label: "Inicio",
	href: "/",
	icon: "material-symbols:home-rounded",
	activeMatch: "/",
};

const navigationGroups = [
	{
		label: "Gestión",
		items: [
			{
				label: "Clientes",
				href: "/clientes",
				icon: "material-symbols:groups-rounded",
				activeMatch: "/clientes",
			},
			{
				label: "Eventos",
				href: "/eventos",
				icon: "material-symbols:event-rounded",
				activeMatch: "/eventos",
			},
			{
				label: "Colaboradores",
				href: "/colaboradores",
				icon: "material-symbols:family-star",
				activeMatch: "/colaboradores",
			},
			{
				label: "Inventario",
				href: "/inventario",
				icon: "material-symbols:inventory-2-rounded",
				activeMatch: "/inventario",
			},
			{
				label: "Cotizaciones",
				href: "/cotizaciones",
				icon: "material-symbols:request-quote-rounded",
				activeMatch: "/cotizaciones",
			},
		],
	},
	{
		label: "Métricas",
		items: [
			{
				label: "General",
				href: "/",
				icon: "material-symbols:dashboard-rounded",
			},
			{
				label: "Ventas",
				href: "/",
				icon: "material-symbols:monitoring-rounded",
			},
		],
	},
];

const mockUser = {
	name: "Huberth Rodríguez",
	role: "Administrador",
	initials: "HR",
};

const accountItems = [
	{
		label: "Ajustes",
		href: "/ajustes",
		icon: "material-symbols:settings-rounded",
	},
	{
		label: "Cerrar sesión",
		href: "/",
		icon: "material-symbols:logout-rounded",
	},
];

const paperworkItem: NavigationItem = {
	label: "Papelería",
	href: "/papeleria",
	icon: "material-symbols:delete-outline-rounded",
	activeMatch: "/papeleria",
};

function isNavigationItemActive(pathname: string, item: NavigationItem) {
	if (!item.activeMatch) {
		return false;
	}

	if (item.activeMatch === "/") {
		return pathname === "/";
	}

	return (
		pathname === item.activeMatch || pathname.startsWith(`${item.activeMatch}/`)
	);
}

function NavigationLink({
	item,
	onClick,
}: {
	item: NavigationItem;
	onClick?: () => void;
}) {
	const pathname = usePathname();
	const isActive = isNavigationItemActive(pathname, item);

	return (
		<Link
			href={item.href}
			onClick={onClick}
			className={`flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 font-extrabold transition ${
				isActive
					? "bg-[var(--accent-color)] text-[var(--on-accent)] shadow-sm"
					: "text-[var(--text-secondary)] hover:bg-[#f0ebe4] hover:text-[var(--primary-color)]"
			}`}
		>
			<Icon icon={item.icon} className='h-6 w-6 shrink-0' aria-hidden='true' />
			<span>{item.label}</span>
		</Link>
	);
}

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<>
			<nav className='space-y-7 text-lg'>
				<section aria-labelledby='inicio'>
					<h2
						id='inicio'
						className='mb-3 text-sm font-black uppercase text-[var(--text-muted)]'
					>
						Inicio
					</h2>
					<NavigationLink item={homeItem} onClick={onNavigate} />
				</section>

				{navigationGroups.map(group => (
					<section key={group.label} aria-labelledby={group.label}>
						<h2
							id={group.label}
							className='mb-3 text-sm font-black uppercase text-[var(--text-muted)]'
						>
							{group.label}
						</h2>
						<div className='space-y-2'>
							{group.items.map(item => (
								<NavigationLink
									key={item.label}
									item={item}
									onClick={onNavigate}
								/>
							))}
						</div>
					</section>
				))}
			</nav>
		</>
	);
}

function SidebarUser() {
	return (
		<div className='mb-6 flex items-center gap-4'>
			<div className='grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[var(--accent-color)] text-sm font-black text-[var(--on-accent)] shadow-[inset_0_-4px_0_rgba(132,52,0,0.2),var(--crisp-shadow)]'>
				{mockUser.initials}
			</div>
			<div className='min-w-0'>
				<p className='truncate text-lg font-black text-[var(--primary-color)]'>
					{mockUser.name}
				</p>
				<p className='text-base font-semibold text-[var(--text-secondary)]'>
					{mockUser.role}
				</p>
			</div>
		</div>
	);
}

function AccountActions({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className='border-t border-[color:var(--border-color)] pt-5'>
			<div className='space-y-2 text-lg'>
				{accountItems.map(item => (
					<Link
						key={item.label}
						href={item.href}
						onClick={onNavigate}
						className='flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 font-extrabold text-[var(--text-secondary)] transition hover:bg-[#f0ebe4] hover:text-[var(--primary-color)]'
					>
						<Icon
							icon={item.icon}
							className='h-6 w-6 shrink-0'
							aria-hidden='true'
						/>
						<span>{item.label}</span>
					</Link>
				))}
			</div>
		</div>
	);
}

function SidebarPaperworkLink({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className='mt-auto pb-5 text-lg'>
			<NavigationLink item={paperworkItem} onClick={onNavigate} />
		</div>
	);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<>
			<SidebarUser />
			<NavigationContent onNavigate={onNavigate} />
			<SidebarPaperworkLink onNavigate={onNavigate} />
			<AccountActions onNavigate={onNavigate} />
		</>
	);
}

function GlobalSearch() {
	return (
		<header className='sticky top-0 z-30 border-b border-[color:var(--border-color)] bg-[var(--surface-color)]/95 px-4 py-4 backdrop-blur md:px-8'>
			<div className='mx-auto flex w-full max-w-2xl items-center justify-center gap-3'>
				<label className='relative min-w-0 flex-1'>
					<span className='sr-only'>Buscar cliente o evento</span>
					<Icon
						icon='material-symbols:search-rounded'
						className='pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[var(--text-muted)]'
						aria-hidden='true'
					/>
					<input
						type='search'
						placeholder='Buscar cliente o evento'
						className='h-14 w-full rounded-lg border border-[color:var(--border-color)] bg-[#efede8] pl-12 pr-4 text-base font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[color:var(--accent-color)] focus:bg-[var(--surface-color)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent-color)_20%,transparent)]'
					/>
				</label>
				<button
					type='button'
					className='flex h-14 shrink-0 items-center gap-2 rounded-full bg-[var(--secondary-color)] px-4 text-base font-black text-white shadow-[var(--crisp-shadow)] transition hover:bg-[var(--secondary-hover)]'
				>
					<Icon
						icon='material-symbols:mic-rounded'
						className='h-6 w-6 shrink-0'
						aria-hidden='true'
					/>
					<span>Voz</span>
				</button>
			</div>
		</header>
	);
}

const mobileNavigationItems = [
	homeItem,
	navigationGroups[0].items[0],
	navigationGroups[0].items[1],
	{
		label: "Cotizaciones",
		href: "/cotizaciones",
		icon: "material-symbols:request-quote-rounded",
		activeMatch: "/cotizaciones",
	},
];

function MobileNavigation() {
	const pathname = usePathname();

	return (
		<nav className='fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-2 shadow-[var(--soft-shadow)] lg:hidden'>
			{mobileNavigationItems.map(item => {
				const isActive = isNavigationItemActive(pathname, item);

				return (
					<Link
						key={item.label}
						href={item.href}
						className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-black transition ${
							isActive
								? "bg-[var(--accent-color)] text-[var(--on-accent)]"
								: "text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
						}`}
					>
						<Icon
							icon={item.icon}
							className='h-5 w-5 shrink-0'
							aria-hidden='true'
						/>
						<span>{item.label}</span>
					</Link>
				);
			})}
		</nav>
	);
}

export function CrmShell({ children }: { children: ReactNode }) {
	return (
		<main className='min-h-screen bg-[var(--background-color)] text-[var(--text-primary)]'>
			<div className='flex min-h-screen'>
				<aside className='sticky top-0 hidden h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-[color:var(--border-color)] bg-[var(--surface-color)] px-5 py-6 text-[var(--text-primary)] lg:flex'>
					<Link href='/' className='mb-5 block'>
						<Image
							src='/okidokicrm_black_logo.png'
							alt='OkiDoki CRM'
							width={220}
							height={80}
							priority
							className='h-auto max-h-36 w-full object-contain'
						/>
					</Link>
					<SidebarContent />
				</aside>

				<section className='flex min-w-0 flex-1 flex-col'>
					<GlobalSearch />

					{children}
					<MobileNavigation />
				</section>
			</div>
		</main>
	);
}
