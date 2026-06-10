import Link from "next/link";
import { DeleteAction } from "../components/delete-action";
import { InitialsThumbnail } from "../components/entity-thumbnail";
import { IconLabel } from "../components/icon-label";
import { ListFilters } from "../components/list-filters";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import {
	clients,
	formatDate,
	getClientEvents,
	getClientFullName,
	type Client,
} from "../lib/mock-data";

function getClientInitials(client: Client) {
	return `${client.firstName[0]}${client.lastName[0]}`;
}

const columns: ManagementColumn<Client>[] = [
	{
		key: "name",
		header: "Cliente",
		render: client => (
			<div className='flex items-center gap-3'>
				<InitialsThumbnail initials={getClientInitials(client)} />
				<div>
					<p className='font-black text-[var(--text-primary)]'>
						{getClientFullName(client)}
					</p>
					<p className='mt-1 text-base'>{client.phone}</p>
				</div>
			</div>
		),
	},
	{
		key: "type",
		header: "Tipo",
		render: client => <StatusBadge value={client.type} />,
	},
	{
		key: "status",
		header: "Estado",
		render: client => <StatusBadge value={client.pipelineStatus} />,
	},
	{
		key: "lastContact",
		header: "Último contacto",
		render: client => formatDate(client.lastContactDate),
	},
	{
		key: "events",
		header: "# Eventos",
		render: client => (
			<span className='font-black text-[var(--text-primary)]'>
				{getClientEvents(client.id).length}
			</span>
		),
	},
	{
		key: "action",
		header: "Acción",
		width: "minmax(130px, 0.75fr)",
		render: () => <DeleteAction />,
	},
];

export default function ClientsPage() {
	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
				title='Clientes'
				description='Repositorio central de contactos para WhatsApp, seguimiento y cotizaciones.'
				actions={
					<Link
						href='/clientes/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo cliente' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<ListFilters
						searchLabel='Buscar cliente'
						searchPlaceholder='Nombre, teléfono o tipo de cliente'
						selectLabel='Estado'
						selectOptions={[
							{ label: "Todos" },
							{ label: "Cotizado" },
							{ label: "Reservado" },
							{ label: "Recurrente" },
						]}
					/>

					<ManagementTable
						columns={columns}
						rows={clients}
						rowHref={client => `/clientes/${client.id}`}
					/>
				</SectionCard>
			</div>
		</>
	);
}
