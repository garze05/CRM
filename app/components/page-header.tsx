import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

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
	return (
		<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
			<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
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
