import * as React from "react";

import { cn } from "@/app/lib/utils";

function Input({ className, type, ref, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			ref={ref}
			type={type}
			data-slot="input"
			className={cn(
				"flex min-h-11 w-full rounded-lg border border-input bg-[var(--input-bg)] px-4 py-2.5 text-base font-bold text-foreground transition-colors placeholder:font-semibold placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
