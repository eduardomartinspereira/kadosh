import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🕛 Cron job iniciado: Reset de downloads diários");
    console.log("🕛 Timestamp:", new Date().toISOString());
    console.log(
      "🕛 Fuso horário:",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    // Verificar se é uma chamada do Vercel Cron (opcional para debug)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    console.log("🔐 CRON_SECRET configurado:", !!cronSecret);
    console.log("🔐 Auth header recebido:", !!authHeader);

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log("❌ Unauthorized - CRON_SECRET não confere");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    let processedUsers = 0;

    // Para cada usuário, verificar downloads de hoje
    for (const subscription of activeUsers) {
      const userId = subscription.userId;

      // Verificar downloads de hoje do usuário
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayDownloads = await prisma.downloadLog.count({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      console.log(`👤 Usuário ${userId}: ${todayDownloads} downloads hoje`);

      processedUsers++;
    }

    console.log(
      `✅ Reset de downloads diários concluído - ${processedUsers} usuários processados`
    );
    console.log(
      "ℹ️ Nota: O sistema de contagem já é baseado em data, então os downloads são automaticamente resetados à meia-noite"
    );

    return NextResponse.json({
      success: true,
      message: "Downloads diários resetados com sucesso",
      timestamp: new Date().toISOString(),
      processedUsers,
      note: "O sistema de contagem é baseado em data, então os downloads são automaticamente resetados à meia-noite",
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
