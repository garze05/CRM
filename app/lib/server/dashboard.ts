import "server-only";
import { FUNNEL_STAGES } from "../domain/funnel";
import { listEvents } from "./events";
import { listGeneralTasks } from "./tasks";
import { prisma } from "../db";
import type { ActivityEntry } from "@/app/components/activity-feed";

const ACTIVE_STAGES = ["QUOTED", "RESERVED", "CONFIRMED"] as const;
const CONFIRMED_INCOME_STAGES = ["CONFIRMED", "COMPLETED"] as const;

function activityKind(action: string): ActivityEntry["kind"] {
	if (action.includes("task")) return "Tareas";
	if (action.includes("trashed") || action.includes("restored")) return "Papelera";
	return "Cambios";
}

export async function getDashboardData() {
	const [
		events,
		tasks,
		interactions,
		auditLogs,
		quotesAwaitingDecision,
		pendingDeposits,
	] = await Promise.all([
		listEvents(),
		listGeneralTasks(),
		prisma.interaction.findMany({
			orderBy: { occurredAt: "desc" },
			take: 50,
			include: {
				client: { select: { firstName: true, lastName: true } },
				event: { select: { id: true, name: true } },
			},
		}),
		prisma.auditLog.findMany({
			orderBy: { createdAt: "desc" },
			take: 50,
			include: { actor: { select: { name: true, email: true } } },
		}),
		prisma.quote.count({
			where: {
				deletedAt: null,
				status: { in: ["DRAFT", "SENT"] },
				selectedOptionId: null,
			},
		}),
		prisma.reservation.count({
			where: { deletedAt: null, paymentStatus: "PENDING_DEPOSIT" },
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

	const interactionActivity: ActivityEntry[] = interactions.map(interaction => {
		const clientName = `${interaction.client.firstName} ${interaction.client.lastName}`;
		const channel = interaction.channel === "PHONE_CALL" ? "llamada" : "WhatsApp";
		return {
			id: interaction.id,
			actor: clientName,
			description: interaction.event
				? `registró ${channel} en ${interaction.event.name}`
				: `registró ${channel}`,
			occurredAt: interaction.occurredAt.toISOString(),
			kind: "Interacciones" as const,
			source: "interaction" as const,
		};
	});
	const auditActivity: ActivityEntry[] = auditLogs.map(log => ({
		id: log.id,
		actor: log.actor?.name ?? log.actor?.email ?? "Sistema",
		description:
			typeof log.context === "object" &&
			log.context !== null &&
			"summary" in log.context &&
			typeof log.context.summary === "string"
				? log.context.summary
				: log.action,
		occurredAt: log.createdAt.toISOString(),
		kind: activityKind(log.action),
		source: "audit" as const,
	}));
	const recentActivity = [...auditActivity, ...interactionActivity]
		.sort(
			(a, b) =>
				new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
		)
		.slice(0, 50);

	return {
		funnelStages: FUNNEL_STAGES.map(stage => ({
			label: stage,
			total: events.filter(event => event.pipelineStatus === stage).length,
		})),
		nextEvents,
		openTasks: tasks,
		confirmedIncome,
		projectedIncome,
		closeRate,
		quotesAwaitingDecision,
		pendingDeposits,
		recentActivity,
	};
}
