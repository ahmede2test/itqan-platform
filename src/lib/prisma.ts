import { PrismaClient } from '@prisma/client';
import { config } from '../../prisma.config';

// Add prisma to the global type
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  datasources: config.datasources,
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
