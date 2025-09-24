import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  checkDownloadPermission,
  logDownload,
  checkProductAccess,
  hasUserDownloadedProduct,
} from "@/lib/download-permissions";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    console.log("🔍 Debug PDF API - session:", session);
    console.log("🔍 Debug PDF API - session.user:", session.user);
    console.log(
      "🔍 Debug PDF API - session.user.id:",
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
    const hasAccess = await checkProductAccess(userId, id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Você não tem acesso a este produto" },
        { status: 403 }
      );
    }

    // Verificar se o usuário já baixou este produto
    const hasDownloaded = await hasUserDownloadedProduct(userId, id);
    if (hasDownloaded) {
      // Se já baixou, permitir download sem contabilizar novamente
      return NextResponse.json({
        success: true,
        downloadUrl: product.arquivoPdf,
        fileName: `${product.name}.pdf`,
        message: "Download autorizado (já contabilizado anteriormente)",
        alreadyDownloaded: true,
      });
    }

    // Verificar permissões de download apenas se não baixou antes
    const permission = await checkDownloadPermission(userId);
    if (!permission.canDownload) {
      return NextResponse.json(
        { error: permission.reason || "Limite de downloads atingido" },
        { status: 429 }
      );
    }

    // Verificar se há arquivo PDF
    if (!product.arquivoPdf) {
      return NextResponse.json(
        { error: "Arquivo PDF não encontrado para este produto" },
        { status: 404 }
      );
    }

    // Registrar o download
    await logDownload(
      userId,
      id,
      "PDF",
      undefined, // Não temos sizeBytes para arquivos PDF
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined
    );

    // Retornar o arquivo para download
    return NextResponse.json({
      success: true,
      downloadUrl: product.arquivoPdf,
      fileName: `${product.name}.pdf`,
      message: "Download autorizado",
      remainingDaily: permission.remainingDaily - 1,
      remainingMonthly: permission.remainingMonthly - 1,
    });
  } catch (error) {
    console.error("Erro no download PDF:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
