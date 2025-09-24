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

    // Buscar o produto
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        assets: {
          where: {
            OR: [
              { type: "ZIP" },
              { type: "OTHER" }, // Para arquivos Canva específicos
            ],
          },
        },
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
      const canvaAsset = product.assets.find(
        (asset) => asset.type === "ZIP" || asset.type === "OTHER"
      );
      if (!canvaAsset) {
        return NextResponse.json(
          { error: "Arquivo Canva não encontrado para este produto" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        downloadUrl: canvaAsset.uri,
        fileName: `${product.name}-canva.${
          canvaAsset.type === "ZIP" ? "zip" : "zip"
        }`,
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

    // Buscar o arquivo Canva (ZIP ou outro formato)
    const canvaAsset = product.assets.find(
      (asset) => asset.type === "ZIP" || asset.type === "OTHER"
    );
    if (!canvaAsset) {
      return NextResponse.json(
        { error: "Arquivo Canva não encontrado para este produto" },
        { status: 404 }
      );
    }

    // Registrar o download
    await logDownload(
      userId,
      id,
      canvaAsset.type,
      canvaAsset.sizeBytes || undefined,
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined
    );

    // Retornar o arquivo para download
    return NextResponse.json({
      success: true,
      downloadUrl: canvaAsset.uri,
      fileName: `${product.name}-canva.${
        canvaAsset.type === "ZIP" ? "zip" : "zip"
      }`,
      message: "Download autorizado",
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
