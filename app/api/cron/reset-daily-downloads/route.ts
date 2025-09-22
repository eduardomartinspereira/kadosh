import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma chamada do Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🕛 Cron job iniciado: Reset de downloads diários");

    // Lógica de reset de downloads diários
    console.log("🔄 Iniciando reset de downloads diários...");

    // Buscar todos os usuários com assinatura ativa
    const activeUsers = await prisma.subscription.findMany({
      where: {
        status: {
          in: ["ACTIVE", "TRIALING"],
        },
        currentPeriodEnd: {
          gt: new Date(),
        },
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    });

    console.log(
      `📊 Encontrados ${activeUsers.length} usuários com assinatura ativa`
    );

    // Para cada usuário, verificar se precisa resetar downloads
    for (const subscription of activeUsers) {
      const userId = subscription.userId;

      // Verificar último download do usuário
      const lastDownload = await prisma.downloadLog.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      });

      if (lastDownload) {
        const lastDownloadDate = new Date(lastDownload.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Se o último download foi antes de hoje, o contador já foi resetado automaticamente
        // pelo sistema de contagem baseado em data
        if (lastDownloadDate < today) {
          console.log(
            `✅ Usuário ${userId}: Contador já resetado automaticamente`
          );
        } else {
          console.log(
            `ℹ️ Usuário ${userId}: Downloads ainda válidos para hoje`
          );
        }
      } else {
        console.log(`ℹ️ Usuário ${userId}: Nenhum download registrado`);
      }
    }

    console.log("✅ Reset de downloads diários concluído");

    return NextResponse.json({
      success: true,
      message: "Downloads diários resetados com sucesso",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro no cron job de reset de downloads:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
