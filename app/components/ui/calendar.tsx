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
			className={cn("p-1", className)}
			classNames={{
				months: "flex flex-col",
				month: "space-y-3",
				month_caption: "flex items-center justify-center h-9 relative",
				caption_label: "text-sm font-black capitalize text-foreground",
				nav: "flex items-center gap-1 absolute inset-x-0 top-0 justify-between px-1",
				button_previous: cn(
					buttonVariants({ variant: "ghost", size: "icon" }),
					"h-8 w-8 p-0",
				),
				button_next: cn(
					buttonVariants({ variant: "ghost", size: "icon" }),
					"h-8 w-8 p-0",
				),
				month_grid: "w-full border-collapse",
				weekdays: "flex",
				weekday:
					"text-muted-foreground w-9 text-xs font-bold capitalize",
				week: "flex w-full mt-1",
				day: "h-9 w-9 p-0 text-center text-sm",
				day_button: cn(
					buttonVariants({ variant: "ghost", size: "icon" }),
					"h-9 w-9 p-0 font-bold aria-selected:opacity-100",
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
