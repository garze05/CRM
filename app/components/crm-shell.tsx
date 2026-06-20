"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { logout } from "../lib/actions/auth";
import { ThemeToggle } from "./theme-toggle";

addCollection(materialSymbolsIcons);

export type ShellUser = {
	name: string;
	email: string;
	initials: string;
	image?: string | null;
};

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
				label: "Cotizaciones",
				href: "/cotizaciones",
				icon: "material-symbols:request-quote-rounded",
				activeMatch: "/cotizaciones",
			},
			{
				label: "Reservaciones",
				href: "/reservaciones",
				icon: "material-symbols:payments-rounded",
				activeMatch: "/reservaciones",
			},
			{
				label: "Colaboradores",
				href: "/colaboradores",
				icon: "material-symbols:family-star",
				activeMatch: "/colaboradores",
			},
			{
				label: "Tareas",
				href: "/tareas",
				icon: "material-symbols:checklist-rounded",
				activeMatch: "/tareas",
			},
		],
	},
	{
		label: "Oferta",
		items: [
			{
				label: "Paquetes y servicios",
				href: "/paquetes",
				icon: "material-symbols:package-rounded",
				activeMatch: "/paquetes",
			},
			{
				label: "Catálogo",
				href: "/inventario",
				icon: "material-symbols:photo-library-rounded",
				activeMatch: "/inventario",
			},
		],
	},
];

const accountItems = [
	{
		label: "Papelería",
		href: "/papeleria",
		icon: "material-symbols:delete-outline-rounded",
		activeMatch: "/papeleria",
	},
	{
		label: "Ajustes",
		href: "/ajustes",
		icon: "material-symbols:settings-rounded",
		activeMatch: "/ajustes",
	},
];

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
			aria-current={isActive ? "page" : undefined}
			className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[0.95rem] font-extrabold transition ${
				isActive
					? "bg-[var(--accent-color)] text-[var(--on-accent)] shadow-sm"
					: "text-[var(--text-secondary)] hover:bg-muted hover:text-[var(--primary-color)]"
			}`}
		>
			<Icon icon={item.icon} className='h-5 w-5 shrink-0' aria-hidden='true' />
			<span>{item.label}</span>
		</Link>
	);
}

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<>
			<nav className='space-y-5'>
				<section aria-labelledby='inicio'>
					<h2
						id='inicio'
						className='mb-2 text-xs font-black uppercase text-[var(--text-muted)]'
					>
						Inicio
					</h2>
					<NavigationLink item={homeItem} onClick={onNavigate} />
				</section>

				{navigationGroups.map(group => (
					<section key={group.label} aria-labelledby={group.label}>
						<h2
							id={group.label}
							className='mb-2 text-xs font-black uppercase text-[var(--text-muted)]'
						>
							{group.label}
						</h2>
						<div className='space-y-1.5'>
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

function SidebarUser({ user }: { user: ShellUser }) {
	return (
		<div className='mb-5 flex items-center gap-3'>
			{user.image ? (
				<Image
					src={user.image}
					alt={`Foto de perfil de ${user.name}`}
					width={44}
					height={44}
					className='h-11 w-11 shrink-0 rounded-full object-cover'
				/>
			) : (
				<div className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--accent-color)] text-sm font-black text-[var(--on-accent)]'>
					{user.initials}
				</div>
			)}
			<div className='min-w-0'>
				<p className='truncate text-[0.95rem] font-black text-[var(--primary-color)]'>
					{user.name}
				</p>
				<p className='truncate text-xs font-semibold text-[var(--text-secondary)]'>
					{user.email}
				</p>
			</div>
		</div>
	);
}

function AccountActions({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<div className='border-t border-[color:var(--border-color)] mt-4 pt-4'>
			<div className='space-y-1.5'>
				{accountItems.map(item => (
					<NavigationLink key={item.label} item={item} onClick={onNavigate} />
				))}
			</div>
		</div>
	);
}

function SidebarContent({
	user,
	onNavigate,
}: {
	user: ShellUser;
	onNavigate?: () => void;
}) {
	return (
		<>
			<SidebarUser user={user} />
			<NavigationContent onNavigate={onNavigate} />
			<AccountActions onNavigate={onNavigate} />
		</>
	);
}

function GlobalSearch() {
	return (
		<header className='sticky top-0 z-30 border-b border-[color:var(--border-color)] bg-[var(--surface-color)]/95 px-4 py-3 backdrop-blur md:px-6'>
			<div className='flex w-full items-center justify-between gap-4'>
				<div className='flex w-full max-w-xl items-center justify-start gap-3'>
					<label className='relative min-w-0 flex-1'>
						<span className='sr-only'>Buscar cliente o evento</span>
						<Icon
							icon='material-symbols:search-rounded'
							className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]'
							aria-hidden='true'
						/>
						<input
							type='search'
							placeholder='Buscar cliente o evento'
							className='search-control h-11 min-h-11 bg-[var(--input-bg)] text-sm'
						/>
					</label>
					<button
						type='button'
						className='flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[var(--secondary-color)] px-4 text-sm font-black text-secondary-foreground shadow-[var(--crisp-shadow)] transition hover:bg-[var(--secondary-hover)]'
					>
						<Icon
							icon='material-symbols:mic-rounded'
							className='h-5 w-5 shrink-0'
							aria-hidden='true'
						/>
						<span>Voz</span>
					</button>
				</div>
				<div className='flex shrink-0 items-center gap-2'>
					<ThemeToggle />
					<form action={logout}>
						<button
							type='submit'
							className='flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-black text-[var(--text-secondary)] transition hover:bg-[var(--muted)] hover:text-[var(--primary-color)]'
						>
							<Icon
								icon='material-symbols:logout-rounded'
								className='h-5 w-5 shrink-0'
								aria-hidden='true'
							/>
							<span>Cerrar sesión</span>
						</button>
					</form>
				</div>
			</div>
		</header>
	);
}

// Inicio · Eventos · Tareas · Clientes: lo que se consulta en campo.
const mobileNavigationItems = [
	homeItem,
	navigationGroups[0].items[1],
	navigationGroups[0].items[5],
	navigationGroups[0].items[0],
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
						aria-current={isActive ? "page" : undefined}
						className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-black transition ${
							isActive
								? "bg-[var(--accent-color)] text-[var(--on-accent)]"
								: "text-[var(--text-secondary)] hover:bg-muted"
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

export function CrmShell({
	user,
	children,
}: {
	user: ShellUser | null;
	children: ReactNode;
}) {
	const pathname = usePathname();

	// La vista pública del catálogo y el login viven fuera del shell autenticado.
	// El middleware ya garantiza que el resto de rutas tengan sesión, pero si por
	// alguna razón no hay usuario, renderizamos el contenido sin shell.
	if (
		pathname.startsWith("/catalogo") ||
		pathname.startsWith("/login") ||
		!user
	) {
		return <main id='contenido-principal'>{children}</main>;
	}

	return (
		<main className='min-h-screen bg-[var(--background-color)] text-[var(--text-primary)]'>
			<a
				href='#contenido-principal'
				className='sr-only z-50 rounded-lg bg-[var(--primary-color)] px-4 py-3 text-base font-black text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4'
			>
				Saltar al contenido principal
			</a>
			<div className='flex min-h-screen'>
				<aside className='sticky top-0 hidden h-screen w-70 shrink-0 flex-col overflow-y-auto border-r border-[color:var(--border-color)] bg-[var(--surface-color)] px-4 py-5 text-[var(--text-primary)] lg:flex'>
					<Link href='/' className='mb-4 block'>
						<Image
							src='/okidokicrm_black_logo.png'
							alt='OkiDoki CRM'
							width={220}
							height={80}
							priority
							className='h-auto max-h-24 w-full object-contain'
						/>
					</Link>
					<SidebarContent user={user} />
				</aside>

				<section
					id='contenido-principal'
					className='flex min-w-0 flex-1 flex-col'
				>
					<GlobalSearch />

					{children}
					<MobileNavigation />
				</section>
			</div>
		</main>
	);
}
