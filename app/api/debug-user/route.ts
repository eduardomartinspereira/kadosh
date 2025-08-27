import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug User - Iniciando...')
    
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    console.log('🔍 Debug User - Session:', session ? 'OK' : 'NULL')
    
    if (!session) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    const userId = (session.user as any)?.id
    console.log('🔍 Debug User - User ID:', userId)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário não encontrado' },
        { status: 400 }
      )
    }

    // Buscar usuário básico
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cpf: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar assinaturas do usuário
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Buscar pedidos do usuário
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        subscription: true,
        invoices: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Buscar planos disponíveis
    const plans = await prisma.plan.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    // Verificar assinatura ativa
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        OR: [
          { status: 'ACTIVE' },
          { status: 'TRIALING' }
        ],
        currentPeriodEnd: {
          gt: new Date()
        }
      },
      include: {
        plan: true
      }
    })

    // Verificar se há assinaturas expiradas
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        currentPeriodEnd: {
          lte: new Date()
        }
      },
      include: {
        plan: true
      }
    })

    // Verificar produtos disponíveis
    const products = await prisma.product.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        arquivoPdf: true,
        arquivoPng: true
      },
      take: 3
    })

    return NextResponse.json({
      success: true,
      message: 'Debug do usuário concluído',
      data: {
        user,
        subscriptions: {
          all: subscriptions,
          active: activeSubscription,
          expired: expiredSubscriptions
        },
        orders,
        plans,
        products,
        debug: {
          currentTime: new Date().toISOString(),
          userId: userId,
          hasActiveSubscription: !!activeSubscription,
          subscriptionCount: subscriptions.length,
          orderCount: orders.length,
          plansCount: plans.length,
          productsCount: products.length
        }
      }
    })

  } catch (error) {
    console.error('🔍 Debug User - Erro:', error)
    return NextResponse.json(
      { 
        error: 'Erro no debug do usuário',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    )
  }
} 