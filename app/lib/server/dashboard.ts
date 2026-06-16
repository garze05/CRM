import "server-only";
import { FUNNEL_STAGES } from "../domain/funnel";
import { listEvents } from "./events";
import { listAllTasks } from "./tasks";
import { prisma } from "../db";
import type { ActivityEntry } from "@/app/components/activity-feed";

const ACTIVE_STAGES = ["QUOTED", "RESERVED", "CONFIRMED"] as const;
const CONFIRMED_INCOME_STAGES = ["CONFIRMED", "COMPLETED"] as const;

function daysAgoLabel(date: Date) {
	const diffMs = Date.now() - date.getTime();
	const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));
	if (diffDays === 0) return "Hoy";
	if (diffDays === 1) return "Ayer";
	return `Hace ${diffDays} días`;
}

export async function getDashboardData() {
	const [events, tasks, interactions] = await Promise.all([
		listEvents(),
		listAllTasks(),
		prisma.interaction.findMany({
			orderBy: { occurredAt: "desc" },
			take: 6,
			include: {
				client: { select: { firstName: true, lastName: true } },
				event: { select: { name: true } },
			},
		}),
	]);

	const today = new Date().toISOString().slice(0, 10);
	const activeEvents = events.filter(event =>
		ACTIVE_STAGES.includes(event.pipelineStatus as (typeof ACTIVE_STAGES)[number]),
	);
	const confirmedIncome = events
		.filter(event =>
			CONFIRMED_INCOME_STAGES.includes(
				event.pipelineStatus as (typeof CONFIRMED_INCOME_STAGES)[number],
			),
		)
		.reduce((total, event) => total + (event.estimatedTotal ?? 0), 0);
	const projectedIncome = activeEvents.reduce(
		(total, event) => total + (event.estimatedTotal ?? 0),
		0,
	);
	const completed = events.filter(event => event.pipelineStatus === "COMPLETED").length;
	const closeRate =
		events.length > 0 ? `${Math.round((completed / events.length) * 100)}%` : "0%";

	const nextEvents = activeEvents
		.filter(event => !event.date || event.date >= today)
		.sort((a, b) => (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31"))
		.slice(0, 4);

	const recentActivity: ActivityEntry[] = interactions.map(interaction => {
		const clientName = `${interaction.client.firstName} ${interaction.client.lastName}`;
		const channel = interaction.channel === "PHONE_CALL" ? "llamada" : "WhatsApp";
		return {
			id: interaction.id,
			actor: clientName,
			description: interaction.event
				? `registró ${channel} en ${interaction.event.name}`
				: `registró ${channel}`,
			timeAgo: daysAgoLabel(interaction.occurredAt),
		};
	});

	return {
		funnelStages: FUNNEL_STAGES.map(stage => ({
			label: stage,
			total: events.filter(event => event.pipelineStatus === stage).length,
		})),
		nextEvents,
		openTasks: tasks.filter(task =>
			["PENDING", "IN_PROGRESS"].includes(task.status),
		),
		confirmedIncome,
		projectedIncome,
		closeRate,
		recentActivity,
	};
}
