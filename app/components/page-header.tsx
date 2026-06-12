import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
import { DecorativePageIcon } from "./decorative-page-icon";

const moduleIcons: Record<string, string> = {
	Ajustes: "material-symbols:settings-rounded",
	Catálogo: "material-symbols:photo-library-rounded",
	Clientes: "material-symbols:groups-rounded",
	Colaboradores: "material-symbols:family-star",
	Cotizaciones: "material-symbols:request-quote-rounded",
	Eventos: "material-symbols:event-rounded",
	Inicio: "material-symbols:dashboard-rounded",
	"Paquetes y servicios": "material-symbols:package-rounded",
	Papelería: "material-symbols:restore-from-trash-rounded",
	Reservaciones: "material-symbols:payments-rounded",
	Tareas: "material-symbols:checklist-rounded",
};

function getDecorativeIcon(items: BreadcrumbItem[], title: string) {
	const moduleItem =
		items.find(item => item.label !== "Inicio" && moduleIcons[item.label]) ??
		items.find(item => moduleIcons[item.label]);

	return (
		moduleIcons[moduleItem?.label ?? title] ??
		"material-symbols:dashboard-rounded"
	);
}

export function PageHeader({
	actions,
	badges,
	breadcrumb,
	description,
	title,
}: {
	actions?: ReactNode;
	badges?: ReactNode;
	breadcrumb: BreadcrumbItem[];
	description?: string;
	title: string;
}) {
	const decorativeIcon = getDecorativeIcon(breadcrumb, title);

	return (
		<header className='relative isolate overflow-hidden px-5 pb-5 pt-7 md:px-6 md:pt-8'>
			<DecorativePageIcon icon={decorativeIcon} />
			<div className='relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
				<div className='min-w-0'>
					<Breadcrumb items={breadcrumb} />
					<div className='flex flex-wrap items-center gap-3'>
						<h1 className='page-heading'>{title}</h1>
						{badges}
					</div>
					{description ? (
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							{description}
						</p>
					) : null}
				</div>
				{actions ? <div className='shrink-0'>{actions}</div> : null}
			</div>
		</header>
	);
}
