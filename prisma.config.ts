// Configuración de Prisma 7 — la CLI (migrate/studio/seed) lee la conexión aquí.
// El runtime usa el driver adapter @prisma/adapter-pg en app/lib/db.ts.
// Nota: este archivo NO carga .env automáticamente; usamos loadEnvFile de Node (≥20.12).
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

try {
  loadEnvFile();
} catch {
  // Sin .env (ej. CI con variables ya exportadas) — continuar.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
