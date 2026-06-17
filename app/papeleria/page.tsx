import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import { restoreFromTrashAction } from "../lib/actions/details";
import { formatDateKey } from "../lib/format";
import { listTrash, type TrashRow } from "../lib/server/trash";

const columns: ManagementColumn<TrashRow>[] = [
	{
		key: "name",
		header: "Recurso",
		render: row => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>{row.name}</p>
				<p className='mt-1 text-base'>{row.module}</p>
			</div>
		),
	},
	{
		key: "deletedAt",
		header: "Eliminado",
		render: row => formatDateKey(row.deletedAt),
	},
	{
		key: "status",
		header: "Estado previo",
		render: row => <StatusBadge value={row.status} />,
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: () => (
			<span />
		),
	},
];

export default async function PaperworkPage() {
	const deletedResources = await listTrash();
	const rows = deletedResources.map(row => ({
		...row,
		actionNode: (
			<form action={restoreFromTrashAction}>
				<input type='hidden' name='entityType' value={row.entityType} />
				<input type='hidden' name='id' value={row.id} />
				<button className='secondary-action flex min-h-11 items-center rounded-full px-4 py-2 text-base font-black transition'>
					Restaurar
				</button>
			</form>
		),
	}));
	const tableColumns: ManagementColumn<TrashRow & { actionNode: React.ReactNode }>[] =
		columns.map(column =>
			column.key === "action"
				? { ...column, render: row => row.actionNode }
				: column,
		);

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Papelería" }]}
				title='Papelería'
				description='Recuperación de registros enviados a papelera.'
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard
					title='Recursos eliminados'
				>
					{rows.length === 0 ? (
						<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-8 text-center text-lg font-bold text-[var(--text-secondary)]'>
							La papelera está vacía.
						</p>
					) : (
						<ManagementTable columns={tableColumns} rows={rows} />
					)}
				</SectionCard>
			</div>
		</>
	);
}
