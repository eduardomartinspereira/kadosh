// app/lib/prisma.ts (ajuste o caminho conforme seu projeto)
import { PrismaClient } from '@prisma/client';

// Permite reaproveitar a instância em dev/hmr (Next.js)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ---- Atalhos/Services -------------------------------------------------------
// Alias direto para o modelo Payment
export const prismaPayment = prisma.payment;

// (Opcional) manter compatibilidade se você usava "paymentService"
export const paymentService = prismaPayment;
