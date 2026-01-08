const { PrismaClient } = require('@prisma/client');

// Prisma 7 - use direct instantiation if global is tricky in restricted environments
// But for standard serverless logic:
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = { prisma };
