import type { ReactNode } from "react";

export function MetricCard({
	accentColor = "var(--accent-color)",
	label,
	value,
	helper,
}: {
	accentColor?: string;
	label: string;
	value: ReactNode;
	helper?: string;
}) {
	return (
		<div className='rounded-lg border border-[color:var(--border-color)] bg-[var(--surface-color)] p-5'>
			<div
				className='mb-4 h-2 w-20 rounded-full'
				style={{ backgroundColor: accentColor }}
			/>
			<p className='text-base font-black uppercase text-[var(--text-muted)]'>
				{label}
			</p>
			<p className='mt-2 text-3xl font-black text-[var(--text-primary)]'>
				{value}
			</p>
			{helper ? (
				<p className='mt-2 text-base font-semibold text-[var(--text-secondary)]'>
					{helper}
				</p>
			) : null}
		</div>
	);
}
