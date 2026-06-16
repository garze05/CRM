import {
	addDays,
	addMonths,
	addWeeks,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	startOfMonth,
	startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { getSeasonsForDate } from "../../lib/domain/seasons";
import { EventCard, type CalendarEvent } from "./event-card";

export type CalendarRange = "mes" | "semana" | "dia";

function toDateKey(date: Date) {
	return format(date, "yyyy-MM-dd");
}

function buildHref(params: {
	rango: CalendarRange;
	fecha: string;
	etapa?: string;
}) {
	const query = new URLSearchParams({
		vista: "calendario",
		rango: params.rango,
		fecha: params.fecha,
	});
	if (params.etapa) {
		query.set("etapa", params.etapa);
	}
	return `/eventos?${query.toString()}`;
}

function getEventsForDay(events: CalendarEvent[], day: Date) {
	const key = toDateKey(day);
	return events
		.filter(event => event.date === key)
		.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function SeasonBand({ date }: { date: Date }) {
	const seasons = getSeasonsForDate(date);
	if (seasons.length === 0) {
		return null;
	}
	const season = seasons[0];

	return (
		<span
			className='block truncate rounded px-1 text-xs font-black uppercase text-[var(--text-secondary)]'
			style={{ backgroundColor: `var(${season.colorToken})` }}
			title={season.label}
		>
			{season.label}
		</span>
	);
}

const WEEKDAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function MonthView({
	events,
	reference,
	today,
	etapa,
}: {
	events: CalendarEvent[];
	reference: Date;
	today: Date;
	etapa?: string;
}) {
	const gridStart = startOfWeek(startOfMonth(reference), { weekStartsOn: 1 });
	const gridEnd = endOfWeek(endOfMonth(reference), { weekStartsOn: 1 });
	const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

	return (
		<div className='overflow-x-auto'>
			<div className='min-w-[760px]'>
				<div className='grid grid-cols-7 gap-1 pb-1 text-center text-sm font-black uppercase text-[var(--text-muted)]'>
					{WEEKDAY_HEADERS.map(weekday => (
						<span key={weekday}>{weekday}</span>
					))}
				</div>
				<div className='grid grid-cols-7 gap-1'>
					{days.map(day => {
						const dayEvents = getEventsForDay(events, day);
						const outside = !isSameMonth(day, reference);
						const isToday = isSameDay(day, today);

						return (
							<div
								key={day.toISOString()}
								className={`min-h-28 rounded-lg border p-1.5 ${
									isToday
										? "border-[color:var(--accent-color)] bg-[var(--surface-color)]"
										: "border-[color:var(--border-color)] bg-[var(--card-color)]"
								} ${outside ? "opacity-45" : ""}`}
							>
								<div className='flex items-center justify-between gap-1'>
									<span
										className={`text-base font-black ${
											isToday
												? "rounded-full bg-[var(--accent-color)] px-2 text-[var(--on-accent)]"
												: "text-[var(--text-secondary)]"
										}`}
									>
										{format(day, "d")}
									</span>
								</div>
								<SeasonBand date={day} />
								<div className='mt-1 space-y-1'>
									{dayEvents.slice(0, 3).map(event => (
										<Link
											key={event.id}
											href={`/eventos/${event.id}`}
											className='block truncate rounded bg-[#f0ebe4] px-1.5 py-1 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--accent-color)] hover:text-[var(--on-accent)]'
											title={`${event.startTime} · ${event.name} (${event.clientName})`}
										>
											{event.startTime} {event.clientName}
										</Link>
									))}
									{dayEvents.length > 3 ? (
										<Link
											href={buildHref({
												rango: "dia",
												fecha: toDateKey(day),
												etapa,
											})}
											className='block px-1.5 text-sm font-black text-[var(--secondary-color)] hover:underline'
										>
											+{dayEvents.length - 3} más
										</Link>
									) : null}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function WeekView({
	events,
	reference,
	today,
}: {
	events: CalendarEvent[];
	reference: Date;
	today: Date;
}) {
	const weekStart = startOfWeek(reference, { weekStartsOn: 1 });
	const days = eachDayOfInterval({
		start: weekStart,
		end: endOfWeek(reference, { weekStartsOn: 1 }),
	});

	return (
		<div className='overflow-x-auto'>
			<div className='grid min-w-[980px] grid-cols-7 gap-2'>
				{days.map(day => {
					const dayEvents = getEventsForDay(events, day);
					const isToday = isSameDay(day, today);

					return (
						<section
							key={day.toISOString()}
							aria-label={format(day, "EEEE d 'de' MMMM", { locale: es })}
							className={`rounded-lg border p-2 ${
								isToday
									? "border-[color:var(--accent-color)] bg-[var(--surface-color)]"
									: "border-[color:var(--border-color)] bg-[#faf7f1]"
							}`}
						>
							<p className='text-center text-sm font-black uppercase text-[var(--text-muted)]'>
								{format(day, "EEE", { locale: es })}
							</p>
							<p
								className={`text-center text-2xl font-black ${
									isToday
										? "text-[var(--accent-hover)]"
										: "text-[var(--text-primary)]"
								}`}
							>
								{format(day, "d")}
							</p>
							<SeasonBand date={day} />
							<div className='mt-2 space-y-2'>
								{dayEvents.length === 0 ? (
									<p className='py-3 text-center text-sm font-bold text-[var(--text-muted)]'>
										Libre
									</p>
								) : (
									dayEvents.map(event => (
										<EventCard key={event.id} event={event} compact />
									))
								)}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}

function DayView({
	events,
	reference,
}: {
	events: CalendarEvent[];
	reference: Date;
}) {
	const dayEvents = getEventsForDay(events, reference);
	const seasons = getSeasonsForDate(reference);

	return (
		<div className='space-y-3'>
			{seasons.map(season => (
				<p
					key={season.id}
					className='rounded-lg px-4 py-2 text-base font-black uppercase text-[var(--text-secondary)]'
					style={{ backgroundColor: `var(${season.colorToken})` }}
				>
					{season.label} — temporada alta: revisar disponibilidad de equipo.
				</p>
			))}
			{dayEvents.length === 0 ? (
				<p className='rounded-lg border border-dashed border-[color:var(--border-color)] bg-[#f7f2ec] p-8 text-center text-lg font-bold text-[var(--text-secondary)]'>
					Sin eventos este día.
				</p>
			) : (
				dayEvents.map(event => <EventCard key={event.id} event={event} />)
			)}
		</div>
	);
}

/**
 * Calendario de eventos con pestañas Mes / Semana / Día. Navegación por
 * enlaces (?vista=calendario&rango=&fecha=) — misma fuente de datos que la
 * tabla. Listo para mapear entradas externas (Google Calendar) al mismo tipo.
 */
export function EventsCalendar({
	events,
	rango,
	fecha,
	today,
	etapa,
}: {
	events: CalendarEvent[];
	rango: CalendarRange;
	/** Fecha de referencia YYYY-MM-DD. */
	fecha: string;
	/** Fecha actual YYYY-MM-DD (inyectada para render determinista). */
	today: string;
	etapa?: string;
}) {
	const reference = new Date(`${fecha}T12:00:00`);
	const todayDate = new Date(`${today}T12:00:00`);

	const rawPeriodLabel =
		rango === "mes"
			? format(reference, "MMMM 'de' yyyy", { locale: es })
			: rango === "semana"
				? `Semana del ${format(startOfWeek(reference, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}`
				: format(reference, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
	// Solo la primera letra en mayúscula ("junio de 2026" → "Junio de 2026").
	const periodLabel =
		rawPeriodLabel.charAt(0).toUpperCase() + rawPeriodLabel.slice(1);

	const previous =
		rango === "mes"
			? addMonths(reference, -1)
			: rango === "semana"
				? addWeeks(reference, -1)
				: addDays(reference, -1);
	const next =
		rango === "mes"
			? addMonths(reference, 1)
			: rango === "semana"
				? addWeeks(reference, 1)
				: addDays(reference, 1);

	const rangeTabs: { value: CalendarRange; label: string }[] = [
		{ value: "mes", label: "Mes" },
		{ value: "semana", label: "Semana" },
		{ value: "dia", label: "Día" },
	];

	return (
		<div className='space-y-4'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<nav
					aria-label='Rango del calendario'
					className='flex bg-[var(--surface-color)] p-1'
				>
					{rangeTabs.map(tab => (
						<Link
							key={tab.value}
							href={buildHref({ rango: tab.value, fecha, etapa })}
							aria-current={rango === tab.value ? "page" : undefined}
							className={`min-h-10 rounded-full px-4 py-2 text-base font-black transition ${
								rango === tab.value
									? "bg-[var(--accent-color)] text-[var(--on-accent)]"
									: "text-[var(--text-secondary)] hover:bg-[#f0ebe4]"
							}`}
						>
							{tab.label}
						</Link>
					))}
				</nav>

				<div className='flex items-center gap-2'>
					<Link
						href={buildHref({ rango, fecha: toDateKey(previous), etapa })}
						className='secondary-action flex min-h-10 items-center gap-1 rounded-full px-3 py-2 text-base font-black transition'
					>
						<span aria-hidden='true'>←</span>
						<span>Anterior</span>
					</Link>
					<Link
						href={buildHref({ rango, fecha: today, etapa })}
						className='secondary-action flex min-h-10 items-center rounded-full px-3 py-2 text-base font-black transition'
					>
						Hoy
					</Link>
					<Link
						href={buildHref({ rango, fecha: toDateKey(next), etapa })}
						className='secondary-action flex min-h-10 items-center gap-1 rounded-full px-3 py-2 text-base font-black transition'
					>
						<span>Siguiente</span>
						<span aria-hidden='true'>→</span>
					</Link>
				</div>
			</div>

			<h3 className='text-xl font-black text-[var(--primary-color)]'>
				{periodLabel}
			</h3>

			{rango === "mes" ? (
				<MonthView
					events={events}
					reference={reference}
					today={todayDate}
					etapa={etapa}
				/>
			) : rango === "semana" ? (
				<WeekView events={events} reference={reference} today={todayDate} />
			) : (
				<DayView events={events} reference={reference} />
			)}
		</div>
	);
}
