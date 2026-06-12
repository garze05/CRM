import type { ActivityEntry } from "../lib/mock-data";

/** Actividad reciente del equipo (vista previa de la bitácora de auditoría). */
export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
	if (entries.length === 0) {
		return (
			<p className='text-lg font-semibold text-[var(--text-secondary)]'>
				Sin actividad registrada todavía.
			</p>
		);
	}

	return (
		<ol className='list-none space-y-4 p-0'>
			{entries.map(entry => (
				<li
					key={entry.id}
					className='border-l-4 border-[color:var(--border-color)] pl-3'
				>
					<p className='text-base font-semibold text-[var(--text-secondary)]'>
						<span className='font-black text-[var(--text-primary)]'>
							{entry.actor}
						</span>{" "}
						{entry.description}
					</p>
					<p className='mt-1 text-sm font-bold uppercase text-[var(--text-muted)]'>
						{entry.timeAgo}
					</p>
				</li>
			))}
		</ol>
	);
}
