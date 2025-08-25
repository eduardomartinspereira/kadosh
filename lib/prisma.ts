// app/lib/prisma.ts (ajuste o caminho conforme seu projeto)
import { PrismaClient } from '@prisma/client';

// Configuração global do Prisma
declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton do Prisma para evitar múltiplas conexões
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;

// ---- Atalhos/Services -------------------------------------------------------
// Alias direto para o modelo Payment
export const prismaPayment = prisma.payment;

// (Opcional) manter compatibilidade se você usava "paymentService"
export const paymentService = prismaPayment;
