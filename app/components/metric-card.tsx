import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { Card } from "./ui/card";

export function MetricCard({
	accentColor = "var(--accent-color)",
	icon,
	label,
	value,
	helper,
}: {
	accentColor?: string;
	icon?: string;
	label: string;
	value: ReactNode;
	helper?: string;
}) {
	return (
		<Card className="gap-0 p-4">
			<div className="mb-3 flex items-center gap-2">
				{icon ? (
					<span
						className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
						style={{
							backgroundColor: `color-mix(in srgb, ${accentColor} 16%, transparent)`,
							color: accentColor,
						}}
					>
						<Icon icon={icon} className="h-5 w-5" aria-hidden="true" />
					</span>
				) : (
					<span
						className="h-1.5 w-16 rounded-full"
						style={{ backgroundColor: accentColor }}
					/>
				)}
				<p className="text-sm font-black uppercase tracking-wide text-muted-foreground">
					{label}
				</p>
			</div>
			<p className="text-3xl font-black text-foreground">{value}</p>
			{helper ? (
				<p className="mt-2 text-base font-semibold text-[var(--text-secondary)]">
					{helper}
				</p>
			) : null}
		</Card>
	);
}
