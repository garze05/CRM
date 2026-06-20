import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				// Primary (paleta de marca) — DESIGN.md §4.3
				default:
					"bg-primary text-primary-foreground shadow-[var(--crisp-shadow)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]",
				// Secondary (teal de marca)
				secondary:
					"bg-secondary text-secondary-foreground shadow-[var(--crisp-shadow)] hover:bg-[var(--secondary-hover)]",
				// Inverted — alto contraste sobre superficies claras
				inverted:
					"bg-foreground text-background hover:opacity-90",
				// Outlined
				outline:
					"border border-border bg-popover text-primary hover:border-primary",
				ghost:
					"text-foreground hover:bg-muted hover:text-primary",
				destructive:
					"bg-destructive text-destructive-foreground shadow-[var(--crisp-shadow)] hover:opacity-90",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				// Targets táctiles ≥44px — DESIGN.md §6.2
				default: "min-h-11 px-5 py-2.5",
				sm: "min-h-10 px-4 py-2 text-sm",
				lg: "min-h-12 px-6 py-3 text-base",
				icon: "h-11 w-11",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";
	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
