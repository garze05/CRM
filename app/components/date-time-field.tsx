"use client";

import { useId, useRef, useState } from "react";
import { CalendarIcon, Clock, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

/** YYYY-MM-DD desde una fecha local (sin corrimiento de zona horaria). */
function toISODate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function fromISODate(value?: string) {
	if (!value) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) return undefined;
	return new Date(year, month - 1, day);
}

function formatLong(date: Date) {
	return new Intl.DateTimeFormat("es-CR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
	}).format(date);
}

/**
 * Campo compuesto de fecha + hora con componentes shadcn (Popover + Calendar
 * para la fecha, Input time para la hora). Escribe a inputs nombrados para que
 * los server actions reciban `dateName` (YYYY-MM-DD) y `timeName` (HH:mm).
 */
export function DateTimeField({
	dateName,
	timeName,
	dateLabel = "Fecha",
	timeLabel = "Hora",
	defaultDate,
	defaultTime,
	optional = false,
}: {
	dateName: string;
	timeName: string;
	dateLabel?: string;
	timeLabel?: string;
	defaultDate?: string;
	defaultTime?: string;
	optional?: boolean;
}) {
	const dateId = useId();
	const timeId = useId();
	const timeRef = useRef<HTMLInputElement>(null);
	const [date, setDate] = useState<Date | undefined>(fromISODate(defaultDate));
	const [openPicker, setOpenPicker] = useState(false);
	const optionalHint = optional ? (
		<span className='font-semibold text-[var(--text-muted)]'> (opcional)</span>
	) : null;

	return (
		<div className='grid gap-3'>
			{/* Fecha */}
			<div className='space-y-2'>
				<label
					htmlFor={dateId}
					className='block text-base font-bold text-[var(--text-primary)]'
				>
					{dateLabel}
					{optionalHint}
				</label>
				<input
					type='hidden'
					name={dateName}
					value={date ? toISODate(date) : ""}
				/>
				<Popover open={openPicker} onOpenChange={setOpenPicker}>
					<PopoverTrigger asChild>
						<Button
							id={dateId}
							type='button'
							variant='outline'
							className='w-full justify-between bg-[var(--input-bg)] px-4 font-bold'
						>
							<span className={date ? "" : "text-muted-foreground"}>
								{date ? formatLong(date) : "Seleccionar fecha"}
							</span>
							<CalendarIcon className='h-5 w-5 shrink-0 opacity-70' />
						</Button>
					</PopoverTrigger>
					<PopoverContent>
						<Calendar
							mode='single'
							selected={date}
							defaultMonth={date}
							onSelect={value => {
								setDate(value);
								setOpenPicker(false);
							}}
							autoFocus
						/>
						{optional && date ? (
							<Button
								type='button'
								variant='ghost'
								size='sm'
								onClick={() => {
									setDate(undefined);
									setOpenPicker(false);
								}}
								className='mt-1 w-full text-[var(--text-secondary)]'
							>
								<X className='h-4 w-4' />
								Quitar fecha
							</Button>
						) : null}
					</PopoverContent>
				</Popover>
			</div>

			{/* Hora */}
			<div className='space-y-2'>
				<label
					htmlFor={timeId}
					className='block text-base font-bold text-[var(--text-primary)]'
				>
					{timeLabel}
					{optionalHint}
				</label>
				<div className='relative'>
					<Input
						ref={timeRef}
						id={timeId}
						type='time'
						name={timeName}
						defaultValue={defaultTime}
						className='pr-11 text-[var(--primary-color)] [&::-webkit-calendar-picker-indicator]:hidden'
					/>
					<button
						type='button'
						aria-label='Abrir selector de hora'
						onClick={() => {
							try {
								timeRef.current?.showPicker();
							} catch {
								timeRef.current?.focus();
							}
						}}
						className='absolute inset-y-0 right-0 grid w-11 place-items-center text-[var(--primary-color)] opacity-70'
					>
						<Clock className='h-5 w-5' />
					</button>
				</div>
			</div>
		</div>
	);
}
