import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../../../../lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    console.log('🔍 Debug API - session:', session)
    
    if (!session) {
      console.log('🔍 Debug API - Sem session')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }
    
    console.log('🔍 Debug API - session.user:', session.user)
    console.log('🔍 Debug API - session.user.id:', (session.user as any)?.id)
    
    if (!(session.user as any)?.id) {
      console.log('🔍 Debug API - Sem userId')
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id as string
    console.log('🔍 Debug API - userId:', userId)

    // Buscar informações da assinatura ativa do usuário
    console.log('🔍 Debug - userId:', userId)
    console.log('🔍 Debug - Data atual:', new Date())
    
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        OR: [
          { status: 'ACTIVE' },
          { status: 'TRIALING' } // Incluir PIX em trial
        ],
        currentPeriodEnd: {
          gt: new Date()
        }
      },
      include: {
        plan: true
      }
    })
    
    console.log('🔍 Debug - Subscription encontrada:', activeSubscription)
    if (activeSubscription) {
      console.log('🔍 Debug - Status:', activeSubscription.status)
      console.log('🔍 Debug - currentPeriodEnd:', activeSubscription.currentPeriodEnd)
      console.log('🔍 Debug - Plan:', activeSubscription.plan)
    }

    // Calcular downloads do dia
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const downloadsToday = await prisma.downloadLog.count({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Calcular downloads do mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const downloadsThisMonth = await prisma.downloadLog.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Buscar histórico recente de downloads
    const recentDownloads = await prisma.downloadLog.findMany({
      where: {
        userId
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Calcular estatísticas por tipo de arquivo
    const downloadsByType = await prisma.downloadLog.groupBy({
      by: ['assetType'],
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      },
      _count: {
        assetType: true
      }
    })

    const plan = activeSubscription?.plan
    const maxDaily = plan?.maxDownloadsPerDay || 0
    const maxMonthly = plan?.maxDownloadsPerMonth || 0

    return NextResponse.json({
      success: true,
      data: {
        subscription: activeSubscription && plan ? {
          planName: plan.name,
          planSlug: plan.slug,
          status: activeSubscription.status,
          currentPeriodEnd: activeSubscription.currentPeriodEnd,
          billingPeriod: plan.billingPeriod
        } : null,
        limits: {
          daily: {
            current: downloadsToday,
            max: maxDaily,
            remaining: Math.max(0, maxDaily - downloadsToday)
          },
          monthly: {
            current: downloadsThisMonth,
            max: maxMonthly,
            remaining: Math.max(0, maxMonthly - downloadsThisMonth)
          }
        },
        recentDownloads: recentDownloads.map(dl => ({
          id: dl.id,
          productName: dl.product.name,
          productSlug: dl.product.slug,
          assetType: dl.assetType,
          fileSize: dl.fileSize,
          createdAt: dl.createdAt
        })),
        downloadsByType: downloadsByType.map(dt => ({
          assetType: dt.assetType,
          count: dt._count.assetType
        }))
      }
    })

  } catch (error) {
    console.error('Erro ao buscar status dos downloads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 