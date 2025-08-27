import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Teste de Download - Iniciando...')
    
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    console.log('🔍 Teste de Download - Session:', session ? 'OK' : 'NULL')
    
    if (!session) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any)?.id
    console.log('🔍 Teste de Download - User ID:', userId)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado' },
        { status: 400 }
      )
    }

    // Teste 1: Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    })
    console.log('🔍 Teste de Download - Usuário:', user)

    // Teste 2: Verificar assinaturas do usuário
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: { plan: true }
    })
    console.log('🔍 Teste de Download - Assinaturas:', subscriptions)

    // Teste 3: Verificar produtos disponíveis
    const products = await prisma.product.findMany({
      where: { isPublic: true },
            select: {
        id: true, 
        name: true, 
        isPublic: true,
        arquivoPdf: true,
        arquivoPng: true
      },
      take: 3
    })
    console.log('🔍 Teste de Download - Produtos:', products)

    // Teste 4: Verificar logs de download
    const downloadLogs = await prisma.downloadLog.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    console.log('🔍 Teste de Download - Logs de download:', downloadLogs)

    // Teste 5: Verificar se o campo arquivoPdf existe
    const productWithPdf = await prisma.product.findFirst({
      where: {
        arquivoPdf: { not: null }
      },
      select: { id: true, name: true, arquivoPdf: true }
    })
    console.log('🔍 Teste de Download - Produto com PDF:', productWithPdf)

    return NextResponse.json({
      success: true,
      message: 'Teste de download concluído',
      data: {
        user,
        subscriptions,
        products,
        downloadLogs,
        productWithPdf,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🔍 Teste de Download - Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro no teste de download',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
} 