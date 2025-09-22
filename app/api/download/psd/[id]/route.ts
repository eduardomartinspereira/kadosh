import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  checkDownloadPermission,
  logDownload,
  checkProductAccess,
} from "../../../../../lib/download-permissions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    console.log("🔍 Debug PSD API - session:", session);
    console.log("🔍 Debug PSD API - session.user:", session.user);
    console.log(
      "🔍 Debug PSD API - session.user.id:",
      (session.user as any)?.id
    );

    if (!(session.user as any)?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    // Buscar o produto
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        plans: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem acesso ao produto
    console.log("🔍 Debug PSD API - Verificando acesso ao produto...");
    const hasAccess = await checkProductAccess(userId, id);
    console.log("🔍 Debug PSD API - hasAccess:", hasAccess);

    if (!hasAccess) {
      return NextResponse.json(
        {
          error:
            "Você não tem acesso a este produto. Verifique sua assinatura.",
        },
        { status: 403 }
      );
    }

    // Verificar permissões de download
    console.log("🔍 Debug PSD API - Verificando permissões de download...");
    const permission = await checkDownloadPermission(userId);
    console.log("🔍 Debug PSD API - permission:", permission);

    if (!permission.canDownload) {
      return NextResponse.json(
        {
          error:
            permission.reason ||
            "Limite de downloads atingido. Verifique sua assinatura.",
        },
        { status: 429 }
      );
    }

    // Verificar se há arquivo PSD
    console.log("🔍 Debug PSD API - product:", product);
    console.log("🔍 Debug PSD API - arquivoPdf:", product.arquivoPdf);

    if (!product.arquivoPdf) {
      return NextResponse.json(
        {
          error:
            "Arquivo PSD não encontrado para este produto. Entre em contato com o suporte.",
        },
        { status: 404 }
      );
    }

    // Registrar o download
    console.log("🔍 Debug PSD API - Registrando download...");
    try {
      await logDownload(
        userId,
        id,
        "PSD",
        undefined, // Não temos sizeBytes para arquivos PSD
        request.headers.get("x-forwarded-for") || undefined,
        request.headers.get("user-agent") || undefined
      );
      console.log("🔍 Debug PSD API - Download registrado com sucesso");
    } catch (logError) {
      console.error("🔍 Debug PSD API - Erro ao registrar download:", logError);
      // Não falha o download se o log falhar
    }

    // Retornar o arquivo para download
    return NextResponse.json({
      success: true,
      downloadUrl: product.arquivoPdf,
      fileName: `${product.name}.psd`,
      message: "Download autorizado",
      remainingDaily: permission.remainingDaily - 1,
      remainingMonthly: permission.remainingMonthly - 1,
    });
  } catch (error) {
    console.error("🔍 Debug PSD API - Erro geral:", error);
    console.error(
      "🔍 Debug PSD API - Stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
