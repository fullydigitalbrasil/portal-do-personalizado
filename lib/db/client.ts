import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Prisma 7 + Neon: a conexão é feita via driver adapter, não mais por uma
// `url` dentro do schema.prisma. Usa a conexão via pooler (DATABASE_URL) —
// a conexão direta (DATABASE_URL_UNPOOLED) é usada só pelo CLI, configurada
// em prisma.config.ts.
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

// Evita múltiplas instâncias do Prisma Client em hot-reload durante o
// desenvolvimento (padrão recomendado pela própria Prisma para Next.js).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}