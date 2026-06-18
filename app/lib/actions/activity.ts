"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";

export async function dismissActivityEntry(
	id: string,
	source: "audit" | "interaction",
): Promise<void> {
	if (source === "interaction") {
		await prisma.interaction.delete({ where: { id } }).catch(() => null);
	} else {
		await prisma.auditLog.delete({ where: { id } }).catch(() => null);
	}
	revalidatePath("/");
}
