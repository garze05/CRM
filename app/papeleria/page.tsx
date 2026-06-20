import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { InlineIconText } from "../components/inline-icon-text";
import { PageHeader } from "../components/page-header";
import { PermanentDeleteAction } from "../components/permanent-delete-action";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import { RestoreButton } from "../components/restore-button";
import {
	CLIENT_TYPE_LABELS,
	FUNNEL_STAGE_LABELS,
	QUOTE_STATUS_LABELS,
} from "../lib/domain/labels";
import { formatDateKey } from "../lib/format";
import { listTrash, type TrashRow } from "../lib/server/trash";

function retentionText(row: TrashRow) {
	if (row.daysUntilPermanentDelete === 0) {
		return "Se elimina hoy";
	}
	if (row.daysUntilPermanentDelete === 1) {
		return "Queda 1 día";
	}
	return `Quedan ${row.daysUntilPermanentDelete} días`;
}

function previousStatusLabel(status: string) {
	const labels: Record<string, string> = {
		...CLIENT_TYPE_LABELS,
		...FUNNEL_STAGE_LABELS,
		...QUOTE_STATUS_LABELS,
		ACTIVO: "Activo",
		PAUSADO: "Pausado",
		INACTIVO: "Inactivo",
	};
	return labels[status] ?? status.replaceAll("_", " ");
}

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
		key: "expiresAt",
		header: "Eliminación automática",
		width: "minmax(190px, 1fr)",
		render: row => (
			<div>
				<p
					className={`font-black ${
						row.isExpiringSoon
							? "text-[var(--error-color)]"
							: "text-[var(--text-primary)]"
					}`}
				>
					{retentionText(row)}
				</p>
				<p className='mt-1 text-sm font-bold text-[var(--text-muted)]'>
					<InlineIconText
						icon='material-symbols:event-busy-outline-rounded'
						text={formatDateKey(row.expiresAt)}
					/>
				</p>
			</div>
		),
	},
	{
		key: "status",
		header: "Estado previo",
		render: row => (
			<StatusBadge value={row.status} label={previousStatusLabel(row.status)} />
		),
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(330px, 1.45fr)",
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
			<div className='flex flex-wrap gap-2'>
				<RestoreButton entityType={row.entityType} id={row.id} />
				<PermanentDeleteAction
					entityType={row.entityType}
					id={row.id}
					name={row.name}
				/>
			</div>
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
				description='Recuperación de registros eliminados.'
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard
					title='Recursos eliminados'
				>
					<p className='mb-4 rounded-lg border border-[color:var(--border-color)] bg-[color-mix(in_srgb,var(--accent-color)_12%,transparent)] px-4 py-3 text-sm font-bold text-[var(--text-secondary)]'>
						Los registros permanecen 30 días en Papelería. Después se eliminan
						definitivamente de forma automática.
					</p>
					{rows.length === 0 ? (
						<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-muted p-8 text-center text-lg font-bold text-[var(--text-secondary)]'>
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
