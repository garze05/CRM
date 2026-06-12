import Link from "next/link";
import { IconLabel } from "../components/icon-label";
import { PageHeader } from "../components/page-header";
import { SectionCard } from "../components/section-card";
import {
	EventsCalendar,
	type CalendarRange,
} from "./calendar/events-calendar";
import type { CalendarEvent } from "./calendar/event-card";
import { EventsTable, type EventRow } from "./events-table";
import {
	collaborators,
	events,
	getEventAssignments,
	getEventClient,
} from "../lib/mock-data";

function buildAlerts(event: EventRow, collaboratorNames: string[]): string[] {
	const alerts: string[] = [];

	if (
		["RESERVADO", "CONFIRMADO"].includes(event.pipelineStatus) &&
		event.paymentStatus === "PENDIENTE_ANTICIPO"
	) {
		alerts.push("Anticipo pendiente");
	}
	if (event.pipelineStatus === "CONFIRMADO" && collaboratorNames.length === 0) {
		alerts.push("Sin colaboradores asignados");
	}

	return alerts;
}

export default async function EventsPage({
	searchParams,
}: {
	searchParams: Promise<{
		etapa?: string;
		vista?: string;
		rango?: string;
		fecha?: string;
	}>;
}) {
	const { etapa, vista, rango, fecha } = await searchParams;

	const isCalendar = vista === "calendario";
	const calendarRange: CalendarRange = ["mes", "semana", "dia"].includes(
		rango ?? "",
	)
		? (rango as CalendarRange)
		: "mes";
	const today = new Date().toISOString().slice(0, 10);
	const referenceDate = /^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "")
		? (fecha as string)
		: today;

	const rows: CalendarEvent[] = events.map(event => {
		const client = getEventClient(event);
		const collaboratorNames = getEventAssignments(event.id)
			.map(assignment => {
				const collaborator = collaborators.find(
					person => person.id === assignment.collaboratorId,
				);
				return collaborator
					? `${collaborator.firstName} ${collaborator.lastName}`
					: null;
			})
			.filter((name): name is string => name !== null);

		const base: EventRow = {
			...event,
			clientName: client
				? `${client.firstName} ${client.lastName}`
				: "Sin cliente",
			clientPhone: client?.phone ?? "",
		};

		return {
			...base,
			collaboratorNames,
			alerts: buildAlerts(base, collaboratorNames),
		};
	});

	const calendarRows = etapa
		? rows.filter(event => event.pipelineStatus === etapa)
		: rows;

	const tableHref = etapa ? `/eventos?etapa=${etapa}` : "/eventos";
	const calendarHref = `/eventos?vista=calendario${etapa ? `&etapa=${etapa}` : ""}`;

	return (
		<>
			<PageHeader
				breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Eventos" }]}
				title='Eventos'
				description='Tabla y calendario operativo: dos formas de trabajar la misma información.'
				actions={
					<Link
						href='/eventos/nuevo'
						className='primary-action flex min-h-12 w-fit items-center gap-2 rounded-full px-5 py-3 text-base font-black transition'
					>
						<IconLabel label='Nuevo evento' />
					</Link>
				}
			/>

			<div className='space-y-5 px-5 pb-28 md:px-8 md:pb-8'>
				<SectionCard>
					<nav
						aria-label='Modo de vista'
						className='mb-5 flex w-fit rounded-full border border-[color:var(--border-color)] bg-[var(--surface-color)] p-1'
					>
						<Link
							href={tableHref}
							aria-current={!isCalendar ? "page" : undefined}
							className={`flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition ${
								!isCalendar
									? "bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
							}`}
						>
							<IconLabel icon='material-symbols:table-rows-rounded' label='Tabla' />
						</Link>
						<Link
							href={calendarHref}
							aria-current={isCalendar ? "page" : undefined}
							className={`flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-base font-black transition ${
								isCalendar
									? "bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
							}`}
						>
							<IconLabel
								icon='material-symbols:calendar-month-rounded'
								label='Calendario'
							/>
						</Link>
					</nav>

					{isCalendar ? (
						<EventsCalendar
							events={calendarRows}
							rango={calendarRange}
							fecha={referenceDate}
							today={today}
							etapa={etapa}
						/>
					) : (
						<EventsTable rows={rows} initialStage={etapa} />
					)}
				</SectionCard>
			</div>
		</>
	);
}
