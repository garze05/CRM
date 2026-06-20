import type { ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";

export function SectionCard({
	action,
	children,
	description,
	title,
}: {
	action?: ReactNode;
	children: ReactNode;
	description?: string;
	title?: string;
}) {
	return (
		<Card className="min-w-0">
			{title ? (
				<CardHeader>
					<div className="min-w-0">
						<CardTitle>{title}</CardTitle>
						{description ? (
							<CardDescription>{description}</CardDescription>
						) : null}
					</div>
					{action ? <div className="shrink-0">{action}</div> : null}
				</CardHeader>
			) : null}
			<CardContent className={title ? undefined : "pt-4 md:pt-5"}>
				{children}
			</CardContent>
		</Card>
	);
}
