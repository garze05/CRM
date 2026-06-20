import "server-only";
import { prisma } from "../db";
import { auth } from "../auth";
import { isAuthBypassEnabled } from "../auth-bypass";

export type EntityType =
	| "Client"
	| "Event"
	| "Quote"
	| "CatalogItem"
	| "Collaborator"
	| "Task";

export async function recordActivity({
	action,
	entityType,
	entityId,
	summary,
	changes,
}: {
	action: string;
	entityType: EntityType;
	entityId: string;
	summary: string;
	changes?: Record<string, unknown>;
}) {
	const session = await auth();
	const actorId = isAuthBypassEnabled() ? null : (session?.user?.id ?? null);
	await prisma.auditLog.create({
		data: {
			action,
			entityType,
			entityId,
			changes: (changes ?? undefined) as never,
			context: { summary } as never,
			actorId,
		},
	});

	const oldLogs = await prisma.auditLog.findMany({
		orderBy: { createdAt: "desc" },
		skip: 50,
		select: { id: true },
	});
	if (oldLogs.length > 0) {
		await prisma.auditLog.deleteMany({
			where: { id: { in: oldLogs.map(log => log.id) } },
		});
	}
}
