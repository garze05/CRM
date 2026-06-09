import Link from "next/link";

export type BreadcrumbItem = {
	label: string;
	href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
	return (
		<nav className='mb-2 text-base font-black' aria-label='Ruta de navegación'>
			<ol className='flex flex-wrap items-center gap-2 text-[var(--text-muted)]'>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li key={`${item.label}-${index}`} className='flex items-center gap-2'>
							{index > 0 ? (
								<span className='text-[var(--border-color)]' aria-hidden='true'>
									/
								</span>
							) : null}
							{item.href && !isLast ? (
								<Link
									href={item.href}
									className='text-[var(--secondary-color)] transition hover:text-[var(--primary-color)]'
								>
									{item.label}
								</Link>
							) : (
								<span aria-current={isLast ? "page" : undefined}>{item.label}</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
