import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    console.log("🔍 Debug API - session:", session);

    if (!session) {
      console.log("🔍 Debug API - Sem session");
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    console.log("🔍 Debug API - session:", JSON.stringify(session, null, 2));
    console.log(
      "🔍 Debug API - session.user:",
      JSON.stringify(session.user, null, 2)
    );
    console.log("🔍 Debug API - session.user.id:", (session.user as any)?.id);
    console.log("🔍 Debug API - session.user.email:", session.user?.email);

    // Obter userId da sessão
    const userId = (session.user as any)?.id;

    if (!userId) {
      console.log("🔍 Debug API - Sem userId na sessão");
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    console.log("🔍 Debug API - userId:", userId);

    // Buscar informações da assinatura ativa do usuário
    console.log("🔍 Debug - userId:", userId);
    console.log("🔍 Debug - Data atual:", new Date());

    // Buscar assinatura ativa - sem incluir plan
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
        currentPeriodEnd: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc", // Pegar a mais recente
      },
    });

    console.log("🔍 Debug - Subscription encontrada:", !!activeSubscription);
    if (activeSubscription) {
      console.log("🔍 Debug - Status:", activeSubscription.status);
      console.log(
        "🔍 Debug - currentPeriodEnd:",
        activeSubscription.currentPeriodEnd
      );
    } else {
      console.log("🔍 Debug - Nenhuma assinatura ativa encontrada!");

      // Debug: verificar se há assinaturas para este usuário (mesmo expiradas)
      const allSubscriptions = await prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      console.log(
        "🔍 Debug - Todas as assinaturas do usuário:",
        allSubscriptions.length
      );
      allSubscriptions.forEach((sub, index) => {
        console.log(
          `  ${index + 1}. Status: ${
            sub.status
          }, Válida até: ${sub.currentPeriodEnd.toISOString()}, Agora: ${new Date().toISOString()}, Válida: ${
            sub.currentPeriodEnd > new Date()
          }`
        );
      });

      // Debug: verificar se há usuários com downloads recentes
      console.log("🔍 Debug - Verificando usuários com downloads recentes...");
      const usersWithDownloads = await prisma.user.findMany({
        where: {
          downloadLogs: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 dias
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
        take: 5,
      });

      console.log("🔍 Debug - Usuários com downloads recentes:");
      usersWithDownloads.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} - ID: ${user.id}`);
        console.log(`     ID da sessão: ${userId}`);
        console.log(`     IDs iguais: ${user.id === userId}`);
      });
    }

    // Calcular downloads do dia
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const downloadsToday = await prisma.downloadLog.count({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Calcular downloads do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const downloadsThisMonth = await prisma.downloadLog.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Buscar histórico recente de downloads
    const recentDownloads = await prisma.downloadLog.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Calcular estatísticas por tipo de arquivo
    const downloadsByType = await prisma.downloadLog.groupBy({
      by: ["assetType"],
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _count: {
        assetType: true,
      },
    });

    // Valores padrão para downloads (já que não usa plan)
    const maxDaily = 5; // 5 downloads por dia
    const maxMonthly = 150; // 150 downloads por mês

    const response = {
      success: true,
      data: {
        subscription: activeSubscription
          ? {
              planName: "Plano Ativo",
              planSlug: "active",
              status: activeSubscription.status,
              currentPeriodEnd: activeSubscription.currentPeriodEnd,
              billingPeriod: "MONTHLY",
            }
          : null,
        limits: {
          daily: {
            current: downloadsToday,
            max: maxDaily,
            remaining: Math.max(0, maxDaily - downloadsToday),
          },
          monthly: {
            current: downloadsThisMonth,
            max: maxMonthly,
            remaining: Math.max(0, maxMonthly - downloadsThisMonth),
          },
        },
        recentDownloads: recentDownloads.map((dl) => ({
          id: dl.id,
          productName: dl.product.name,
          productSlug: dl.product.slug,
          assetType: dl.assetType,
          fileSize: dl.fileSize,
          createdAt: dl.createdAt,
        })),
        downloadsByType: downloadsByType.map((dt) => ({
          assetType: dt.assetType,
          count: dt._count.assetType,
        })),
      },
    };

    console.log(
      "🔍 Debug - Resposta da API:",
      JSON.stringify(response, null, 2)
    );

    // Debug adicional para verificar se a assinatura está sendo retornada
    console.log(
      "🔍 Debug - Assinatura na resposta:",
      response.data.subscription
    );
    console.log(
      "🔍 Debug - Status da assinatura:",
      response.data.subscription?.status
    );
    console.log(
      "🔍 Debug - Plano da assinatura:",
      response.data.subscription?.planName
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar status dos downloads:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
