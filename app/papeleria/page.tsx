import { DeleteAction } from "../components/delete-action";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";

type DeletedResource = {
	id: string;
	name: string;
	module: string;
	deletedAt: string;
	status: string;
};

const deletedResources: DeletedResource[] = [
	{
		id: "trash-1",
		name: "Decoración Arco Fiesta",
		module: "Inventario",
		deletedAt: "09 jun 2026",
		status: "PAUSADO",
	},
	{
		id: "trash-2",
		name: "Cliente duplicado sin teléfono",
		module: "Clientes",
		deletedAt: "08 jun 2026",
		status: "CANCELADO",
	},
];

const columns: ManagementColumn<DeletedResource>[] = [
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
		render: row => row.deletedAt,
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
			<DeleteAction
				icon='material-symbols:restore-from-trash-rounded'
				label='Restaurar'
			/>
		),
	},
];

export default function PaperworkPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Papelería" }]}
				title='Papelería'
				description='Recuperación de recursos removidos por soft delete antes de una limpieza definitiva.'
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard
					title='Recursos eliminados'
					description='Todas las entidades principales usan soft delete; nada se borra físicamente desde el MVP.'
				>
					<ManagementTable columns={columns} rows={deletedResources} />
				</SectionCard>
			</div>
		</>
	);
}
