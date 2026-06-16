// Cliente Prisma único para toda la app (singleton).
//
// Prisma 7 + driver adapter: la conexión se establece con @prisma/adapter-pg
// (Pool de `pg`) en lugar del binario nativo. La URL vive en DATABASE_URL.
// El generador `prisma-client` emite el cliente en app/generated/prisma.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "";

// En desarrollo, Next.js recarga módulos en cada cambio (HMR). Sin el singleton
// global se crearían múltiples pools y se agotarían las conexiones de Postgres.
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
	const adapter = new PrismaPg({ connectionString });
	return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
