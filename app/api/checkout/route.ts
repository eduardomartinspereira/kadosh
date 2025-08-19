import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle, userId, paymentData } = await request.json()

    // Validações básicas
    if (!planId || !billingCycle || !userId) {
      return NextResponse.json(
        { error: 'Dados do plano são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Definir preços dos planos
    const planPrices: Record<string, { monthly: number; yearly: number }> = {
      basic: { monthly: 97, yearly: 970 },
      professional: { monthly: 197, yearly: 1970 },
      enterprise: { monthly: 397, yearly: 3970 }
    }

    const plan = planPrices[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const price = billingCycle === 'monthly' ? plan.monthly : plan.yearly

    // Criar ordem no banco de dados
    const order = await prisma.order.create({
      data: {
        userId,
        type: 'SUBSCRIPTION_INITIAL',
        status: 'PENDING',
        totalAmountCents: price * 100, // Convertendo para centavos
        currency: 'BRL',
        provider: 'MERCADO_PAGO', // Você pode alterar conforme necessário
        items: {
          create: {
            itemType: 'PLAN',
            planId: planId,
            quantity: 1,
            unitAmountCents: price * 100,
            subtotalCents: price * 100,
          }
        }
      }
    })

    // Aqui você implementaria a integração real com o gateway de pagamento
    // Por enquanto, vamos simular um pagamento bem-sucedido
    
    // Simular processamento do pagamento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Atualizar status da ordem para PAID
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' }
    })

    // Criar assinatura para o usuário
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: planId,
        status: 'ACTIVE',
        paymentMethod: 'CARD',
        provider: 'MERCADO_PAGO',
        currentPeriodStart: new Date(),
        currentPeriodEnd: billingCycle === 'monthly' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 dias
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +365 dias
      }
    })

    // Vincular ordem à assinatura
    await prisma.order.update({
      where: { id: order.id },
      data: { subscriptionId: subscription.id }
    })

    return NextResponse.json(
      { 
        message: 'Pagamento processado com sucesso',
        orderId: order.id,
        subscriptionId: subscription.id,
        amount: price
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 