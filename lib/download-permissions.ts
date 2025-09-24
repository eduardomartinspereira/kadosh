import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DownloadPermission {
  canDownload: boolean;
  reason?: string;
  dailyDownloads: number;
  monthlyDownloads: number;
  dailyLimit: number;
  monthlyLimit: number;
  remainingDaily: number;
  remainingMonthly: number;
}

/**
 * Verifica se um usuário pode fazer download baseado em sua assinatura ativa
 * Regra simples: usuários com assinatura ativa podem fazer até 5 downloads por dia
 */
export async function checkDownloadPermission(
  userId: string
): Promise<DownloadPermission> {
  try {
    // Buscar assinatura ativa do usuário
    console.log("🔍 Debug - Verificando assinatura para usuário:", userId);

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ["ACTIVE", "TRIALING"], // Incluir TRIALING também
        },
        currentPeriodEnd: {
          gte: new Date(), // Assinatura ainda válida
        },
      },
      include: {
        plan: true,
      },
    });

    console.log("🔍 Debug - Assinatura encontrada:", activeSubscription);

    // Se não tem assinatura ativa, não pode baixar
    if (!activeSubscription) {
      return {
        canDownload: false,
        reason: "Usuário não possui assinatura ativa",
        dailyDownloads: 0,
        monthlyDownloads: 0,
        dailyLimit: 0,
        monthlyLimit: 0,
        remainingDaily: 0,
        remainingMonthly: 0,
      };
    }

    // Todos os planos têm 5 downloads por dia
    const dailyLimit = 5;
    const monthlyLimit = 150; // 5 * 30 dias

    // Calcular downloads do dia atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyDownloads = await prisma.downloadLog.count({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    // Calcular downloads do mês atual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyDownloads = await prisma.downloadLog.count({
      where: {
        userId,
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const remainingDaily = Math.max(0, dailyLimit - dailyDownloads);
    const remainingMonthly = Math.max(0, monthlyLimit - monthlyDownloads);

    // Verificar se pode baixar
    const canDownload =
      dailyDownloads < dailyLimit && monthlyDownloads < monthlyLimit;

    return {
      canDownload,
      reason: canDownload ? undefined : "Limite de downloads atingido",
      dailyDownloads,
      monthlyDownloads,
      dailyLimit,
      monthlyLimit,
      remainingDaily,
      remainingMonthly,
    };
  } catch (error) {
    console.error("Erro ao verificar permissão de download:", error);
    return {
      canDownload: false,
      reason: "Erro ao verificar permissões",
      dailyDownloads: 0,
      monthlyDownloads: 0,
      dailyLimit: 0,
      monthlyLimit: 0,
      remainingDaily: 0,
      remainingMonthly: 0,
    };
  }
}

/**
 * Registra um download no log
 */
export async function logDownload(
  userId: string,
  productId: string,
  assetType: string,
  fileSize?: bigint,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    console.log("🔍 Debug - Tentando registrar download:", {
      userId,
      productId,
      assetType,
      fileSize,
      ipAddress,
      userAgent,
    });

    await prisma.downloadLog.create({
      data: {
        userId,
        productId,
        assetType: assetType as any, // AssetType enum
        fileSize,
        ipAddress,
        userAgent,
      },
    });
    console.log(
      `✅ Download registrado para usuário ${userId}, produto ${productId}`
    );
  } catch (error) {
    console.error("🔍 Debug - Erro ao registrar download:", error);
    console.error(
      "🔍 Debug - Stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    throw error;
  }
}

/**
 * Verifica se o usuário já baixou um produto específico
 */
export async function hasUserDownloadedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    console.log(
      "🔍 Debug - Verificando se usuário já baixou produto:",
      productId,
      "para usuário:",
      userId
    );

    const existingDownload = await prisma.downloadLog.findFirst({
      where: {
        userId,
        productId,
      },
    });

    const hasDownloaded = !!existingDownload;
    console.log("🔍 Debug - Usuário já baixou o produto:", hasDownloaded);

    return hasDownloaded;
  } catch (error) {
    console.error("Erro ao verificar download existente:", error);
    return false;
  }
}

/**
 * Verifica se o usuário tem acesso ao produto
 */
export async function checkProductAccess(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    console.log(
      "🔍 Debug - Verificando acesso ao produto:",
      productId,
      "para usuário:",
      userId
    );

    // Verificar se o produto é público
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { isPublic: true },
    });

    console.log("🔍 Debug - Produto encontrado:", product);

    if (!product) {
      console.log("🔍 Debug - Produto não encontrado");
      return false;
    }

    // Se o produto é público, qualquer usuário com assinatura pode acessar
    if (product.isPublic) {
      console.log("🔍 Debug - Produto é público, acesso permitido");
      return true;
    }

    // Se não é público, verificar se o usuário tem entitlements
    const entitlement = await prisma.userEntitlement.findFirst({
      where: {
        userId,
        productId,
        expiresAt: {
          gte: new Date(), // Não expirado
        },
      },
    });

    return !!entitlement;
  } catch (error) {
    console.error("Erro ao verificar acesso ao produto:", error);
    return false;
  }
}
