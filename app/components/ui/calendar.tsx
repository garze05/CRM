"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";

import { cn } from "@/app/lib/utils";
import { buttonVariants } from "./button";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			locale={es}
			showOutsideDays={showOutsideDays}
			// Siempre 6 semanas: el popover no cambia de alto entre meses, así las
			// flechas no se mueven al navegar (UX consistente para el clic).
			fixedWeeks
			className={cn("p-1", className)}
			classNames={{
				months: "relative flex flex-col",
				month: "space-y-2",
				month_caption: "flex h-11 w-full items-center justify-center px-11",
				caption_label: "text-sm font-black capitalize text-foreground",
				nav: "absolute inset-x-0 top-0 flex h-11 items-center justify-between",
				button_previous: buttonVariants({ variant: "ghost", size: "icon" }),
				button_next: buttonVariants({ variant: "ghost", size: "icon" }),
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday: "text-muted-foreground w-11 text-xs font-bold capitalize",
				week: "flex w-full mt-1",
				day: "h-11 w-11 p-0 text-center text-sm",
				day_button: cn(
					buttonVariants({ variant: "ghost", size: "icon" }),
					"h-11 w-11 p-0 font-bold aria-selected:opacity-100",
				),
				selected:
					"[&>button]:bg-primary [&>button]:text-primary-foreground [&>button:hover]:bg-[var(--primary-hover)]",
				today: "[&>button]:border [&>button]:border-primary",
				outside: "text-muted-foreground opacity-50",
				disabled: "text-muted-foreground opacity-50",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ orientation, ...chevronProps }) =>
					orientation === "left" ? (
						<ChevronLeft className='h-4 w-4' {...chevronProps} />
					) : (
						<ChevronRight className='h-4 w-4' {...chevronProps} />
					),
			}}
			{...props}
		/>
	);
}

export { Calendar };
