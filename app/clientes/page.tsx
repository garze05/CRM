import { CrmShell } from "../components/crm-shell";
import { Breadcrumb } from "../components/breadcrumb";
import { DeleteAction } from "../components/delete-action";
import { IconLabel } from "../components/icon-label";
import {
	ManagementTable,
	type ManagementColumn,
} from "../components/management-table";
import { StatusBadge } from "../components/status-badge";
import {
	clients,
	formatDate,
	getClientEvents,
	getClientFullName,
	type Client,
} from "../lib/mock-data";

const columns: ManagementColumn<Client>[] = [
	{
		key: "name",
		header: "Cliente",
		render: client => (
			<div>
				<p className='font-black text-[var(--text-primary)]'>
					{getClientFullName(client)}
				</p>
				<p className='mt-1 text-base'>{client.phone}</p>
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
		<CrmShell>
			<header className='px-5 pb-6 pt-8 md:px-8 md:pt-10'>
				<div className='flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
					<div>
						<Breadcrumb
							items={[{ label: "Inicio", href: "/" }, { label: "Clientes" }]}
						/>
						<h1 className='page-heading'>Clientes</h1>
						<p className='mt-2 max-w-3xl text-lg text-[var(--text-secondary)]'>
							Repositorio central de contactos para WhatsApp, seguimiento y
							cotizaciones.
						</p>
					</div>
					<button
						type='button'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-blacktransition'
					>
						<IconLabel label='Nuevo cliente' />
					</button>
				</div>
			</header>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<section className='surface-card p-5 md:p-7'>
					<div className='mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]'>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Buscar cliente</span>
							<input
								placeholder='Nombre, teléfono o tipo de cliente'
								className='form-control'
							/>
						</label>
						<label className='space-y-2 text-lg font-bold text-[var(--text-primary)]'>
							<span>Estado</span>
							<select className='form-control'>
								<option>Todos</option>
								<option>Cotizado</option>
								<option>Reservado</option>
								<option>Recurrente</option>
							</select>
						</label>
					</div>

					<ManagementTable
						columns={columns}
						rows={clients}
						rowHref={client => `/clientes/${client.id}`}
					/>
				</section>
			</div>
		</CrmShell>
	);
}
