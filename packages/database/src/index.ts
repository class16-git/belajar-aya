import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

const g = globalThis as unknown as { __atlasPrisma?: PrismaClient };
export const prisma: PrismaClient = g.__atlasPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.__atlasPrisma = prisma;
