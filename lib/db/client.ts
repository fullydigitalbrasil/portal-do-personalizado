import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do Prisma Client em hot-reload durante o
// desenvolvimento (padrão recomendado pela própria Prisma para Next.js).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
