import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  checkDownloadPermission,
  logDownload,
  checkProductAccess,
  hasUserDownloadedProduct,
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

    console.log("🔍 Debug Canva API - session:", session);
    console.log("🔍 Debug Canva API - session.user:", session.user);
    console.log(
      "🔍 Debug Canva API - session.user.id:",
      (session.user as any)?.id
    );

    if (!(session.user as any)?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id as string;

    // Buscar o produto (somente campos necessários para Canva)
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        linkCanvas: true,
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
      // Se já baixou, permitir acesso ao link do Canva sem contabilizar novamente
      if (!product.linkCanvas) {
        return NextResponse.json(
          { error: "Link do Canva não disponível para este produto" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        downloadUrl: product.linkCanvas,
        fileName: `${product.name}-canva.link`,
        message: "Acesso autorizado (já contabilizado anteriormente)",
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

    // Verificar se há link do Canva no produto
    if (!product.linkCanvas) {
      return NextResponse.json(
        { error: "Link do Canva não disponível para este produto" },
        { status: 404 }
      );
    }

    // Registrar o download
    await logDownload(
      userId,
      id,
      "OTHER", // usamos OTHER para representar acesso ao Canva
      undefined,
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined
    );

    // Retornar sucesso e o link do Canva (frontend abre o link em nova aba)
    return NextResponse.json({
      success: true,
      downloadUrl: product.linkCanvas,
      fileName: `${product.name}-canva.link`,
      message: "Acesso autorizado",
      remainingDaily: permission.remainingDaily - 1,
      remainingMonthly: permission.remainingMonthly - 1,
    });
  } catch (error) {
    console.error("Erro no download Canva:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
