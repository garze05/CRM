"use client";

import { addCollection, Icon } from "@iconify/react";
import { icons as materialSymbolsIcons } from "@iconify-json/material-symbols";
import Link from "next/link";

addCollection(materialSymbolsIcons);
import { StatusBadge } from "../../components/status-badge";
import {
	EVENT_TYPE_LABELS,
	FUNNEL_STAGE_LABELS,
	PAYMENT_STATUS_LABELS,
} from "../../lib/domain/labels";
import type { EventListItem } from "../../lib/server/events";

export type CalendarEvent = EventListItem;

function formatDuration(hours: number) {
	return Number.isInteger(hours) ? `${hours} h` : `${hours} h`.replace(".", ",");
}

function toWhatsappHref(phone: string) {
	return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

/**
 * Tarjeta operativa de evento para el calendario: prioriza la información
 * necesaria para EJECUTAR el evento (hora, contacto, lugar, equipo, pagos).
 */
export function EventCard({
	event,
	compact = false,
}: {
	event: CalendarEvent;
	compact?: boolean;
}) {
	if (compact) {
		return (
			<Link
				href={`/eventos/${event.id}`}
				className='block rounded-lg border border-[color:var(--border-color)] bg-[var(--card-color)] p-3 transition hover:border-[color:var(--accent-color)] hover:shadow-[var(--crisp-shadow)]'
			>
				<p className='text-base font-black text-[var(--text-primary)]'>
					{event.startTime} · {event.name}
				</p>
				<p className='mt-1 text-sm font-semibold text-[var(--text-secondary)]'>
					{event.clientName}
				</p>
				<div className='mt-2 flex flex-wrap gap-1'>
					<StatusBadge
						value={event.pipelineStatus}
						label={FUNNEL_STAGE_LABELS[event.pipelineStatus]}
					/>
					{event.alerts.length > 0 ? (
						<span className='inline-flex min-h-8 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] px-2 py-1 text-sm font-black text-[var(--error-color)]'>
							<Icon
								icon='material-symbols:warning-rounded'
								className='h-4 w-4'
								aria-hidden='true'
							/>
							<span>{event.alerts.length}</span>
							<span className='sr-only'>alertas</span>
						</span>
					) : null}
				</div>
			</Link>
		);
	}

	return (
		<article className='rounded-lg border border-[color:var(--border-color)] bg-[var(--card-color)] p-5 shadow-[var(--crisp-shadow)]'>
			<div className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<p className='text-base font-black uppercase text-[var(--secondary-color)]'>
						{event.startTime} · {formatDuration(event.durationHours)}
					</p>
					<Link
						href={`/eventos/${event.id}`}
						className='mt-1 block text-2xl font-black text-[var(--text-primary)] underline-offset-4 hover:text-[var(--primary-color)] hover:underline'
					>
						{event.name}
					</Link>
				</div>
				<div className='flex flex-wrap gap-2'>
					<StatusBadge
						value={event.type}
						label={EVENT_TYPE_LABELS[event.type]}
					/>
					<StatusBadge
						value={event.pipelineStatus}
						label={FUNNEL_STAGE_LABELS[event.pipelineStatus]}
					/>
					{event.paymentStatus ? (
						<StatusBadge
							value={event.paymentStatus}
							label={PAYMENT_STATUS_LABELS[event.paymentStatus]}
						/>
					) : null}
				</div>
			</div>

			{event.alerts.length > 0 ? (
				<ul className='mt-3 list-none space-y-1 p-0'>
					{event.alerts.map(alert => (
						<li
							key={alert}
							className='flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--error-color)_16%,transparent)] px-3 py-2 text-base font-black text-[var(--error-color)]'
						>
							<Icon
								icon='material-symbols:warning-rounded'
								className='h-5 w-5 shrink-0'
								aria-hidden='true'
							/>
							<span>{alert}</span>
						</li>
					))}
				</ul>
			) : null}

			<dl className='mt-4 grid gap-x-6 gap-y-3 text-lg sm:grid-cols-2'>
				<div>
					<dt className='text-sm font-black uppercase text-[var(--text-muted)]'>
						Cliente
					</dt>
					<dd className='font-bold text-[var(--text-primary)]'>
						{event.clientName}
						{event.clientPhone ? (
							<a
								href={toWhatsappHref(event.clientPhone)}
								target='_blank'
								rel='noreferrer'
								className='mt-1 flex w-fit items-center gap-1 text-base font-black text-[var(--secondary-color)] underline-offset-2 hover:underline'
							>
								<Icon
									icon='material-symbols:chat-rounded'
									className='h-5 w-5 shrink-0'
									aria-hidden='true'
								/>
								<span>{event.clientPhone}</span>
							</a>
						) : null}
					</dd>
				</div>
				<div>
					<dt className='text-sm font-black uppercase text-[var(--text-muted)]'>
						Lugar
					</dt>
					<dd className='font-bold text-[var(--text-primary)]'>
						{event.venueName}
						<span className='block text-base font-semibold text-[var(--text-secondary)]'>
							{event.venueAddress}
						</span>
					</dd>
				</div>
				<div>
					<dt className='text-sm font-black uppercase text-[var(--text-muted)]'>
						Personajes y servicios
					</dt>
					<dd className='font-bold text-[var(--text-primary)]'>
						{event.characters.length > 0
							? event.characters.join(", ")
							: "Por definir"}
					</dd>
				</div>
				<div>
					<dt className='text-sm font-black uppercase text-[var(--text-muted)]'>
						Colaboradores
					</dt>
					<dd className='font-bold text-[var(--text-primary)]'>
						{event.collaboratorNames.length > 0
							? event.collaboratorNames.join(", ")
							: "Sin asignar"}
					</dd>
				</div>
			</dl>
		</article>
	);
}
