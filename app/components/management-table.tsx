import Link from "next/link";
import type { ReactNode } from "react";

export type ManagementColumn<Row> = {
	key: string;
	header: string;
	className?: string;
	width?: string;
	render: (row: Row) => ReactNode;
};

export function ManagementTable<Row extends { id: string }>({
	columns,
	rows,
	rowHref,
}: {
	columns: ManagementColumn<Row>[];
	rows: Row[];
	rowHref?: (row: Row) => string;
}) {
	const gridTemplateColumns = columns
		.map(column => column.width ?? "minmax(0, 1fr)")
		.join(" ");

	return (
		<div className='max-w-full overflow-x-auto rounded-lg border border-[color:var(--border-color)] bg-[var(--card-color)] shadow-[var(--crisp-shadow)]'>
			<div
				className='grid min-w-[860px] bg-[#f0ebe4] px-5 py-4 text-base font-black text-[var(--text-secondary)]'
				style={{ gridTemplateColumns }}
			>
				{columns.map(column => (
					<span key={column.key} className={column.className}>
						{column.header}
					</span>
				))}
			</div>

			{rows.map(row => {
				const content = (
					<div
						className='grid min-w-[860px] items-center border-t border-[color:var(--border-color)] px-5 py-5 text-lg text-[var(--text-secondary)] transition hover:bg-[#f7f2ec]'
						style={{ gridTemplateColumns }}
					>
						{columns.map(column => (
							<div key={column.key} className={column.className}>
								{column.render(row)}
							</div>
						))}
					</div>
				);

				if (!rowHref) {
					return <div key={row.id}>{content}</div>;
				}

				return (
					<Link key={row.id} href={rowHref(row)} className='block'>
						{content}
					</Link>
				);
			})}
		</div>
	);
}
