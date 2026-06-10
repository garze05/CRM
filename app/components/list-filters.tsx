export type ListFilterOption = {
	label: string;
	value?: string;
};

export function ListFilters({
	searchLabel,
	searchPlaceholder,
	selectLabel,
	selectOptions,
}: {
	searchLabel: string;
	searchPlaceholder: string;
	selectLabel: string;
	selectOptions: ListFilterOption[];
}) {
	return (
		<div className='mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]'>
			<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
				<span>{searchLabel}</span>
				<input placeholder={searchPlaceholder} className='form-control' />
			</label>
			<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
				<span>{selectLabel}</span>
				<select className='form-control'>
					{selectOptions.map(option => (
						<option key={option.value ?? option.label} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}
