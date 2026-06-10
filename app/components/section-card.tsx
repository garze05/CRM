import type { ReactNode } from "react";

export function SectionCard({
	action,
	children,
	description,
	title,
}: {
	action?: ReactNode;
	children: ReactNode;
	description?: string;
	title?: string;
}) {
	return (
		<section className='surface-card min-w-0 p-5 md:p-7'>
			{title ? (
				<div className='mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
					<div>
						<h2 className='text-2xl font-black text-[var(--text-primary)]'>
							{title}
						</h2>
						{description ? (
							<p className='mt-1 text-lg text-[var(--text-secondary)]'>
								{description}
							</p>
						) : null}
					</div>
					{action}
				</div>
			) : null}
			{children}
		</section>
	);
}
