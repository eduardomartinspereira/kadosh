import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserSubscriptions() {
  try {
    console.log('🔍 Verificando subscriptions dos usuários...')

    // Buscar usuário pelo email
    const userEmail = 'eduardomartinspereira20@gmail.com' // Seu email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        },
        orders: {
          include: {
            invoices: {
              include: {
                payments: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('👤 Usuário encontrado:')
    console.log(`   - ID: ${user.id}`)
    console.log(`   - Nome: ${user.name}`)
    console.log(`   - Email: ${user.email}`)
    console.log(`   - Role: ${user.role}`)

    console.log('\n📋 Subscriptions:')
    if (user.subscriptions.length === 0) {
      console.log('   ❌ Nenhuma subscription encontrada')
    } else {
      user.subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Subscription ID: ${sub.id}`)
        console.log(`      - Status: ${sub.status}`)
        console.log(`      - Plano: ${sub.plan.name} (${sub.plan.billingPeriod})`)
        console.log(`      - Início: ${sub.startAt}`)
        console.log(`      - Fim: ${sub.currentPeriodEnd}`)
        console.log(`      - Provider: ${sub.provider}`)
        console.log(`      - Provider ID: ${sub.providerSubscriptionId}`)
      })
    }

    console.log('\n🛒 Orders:')
    if (user.orders.length === 0) {
      console.log('   ❌ Nenhuma order encontrada')
    } else {
      user.orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order ID: ${order.id}`)
        console.log(`      - Status: ${order.status}`)
        console.log(`      - Tipo: ${order.type}`)
        console.log(`      - Valor: R$ ${(order.totalAmountCents / 100).toFixed(2)}`)
        console.log(`      - Provider: ${order.provider}`)
        console.log(`      - Provider ID: ${order.providerOrderId}`)
        console.log(`      - Subscription ID: ${order.subscriptionId || 'N/A'}`)
        
        if (order.invoices.length > 0) {
          order.invoices.forEach((invoice, invIndex) => {
            console.log(`      - Invoice ${invIndex + 1}: ${invoice.status}`)
            if (invoice.payments.length > 0) {
              invoice.payments.forEach((payment, payIndex) => {
                console.log(`        - Payment ${payIndex + 1}: ${payment.status} (${payment.method})`)
              })
            }
          })
        }
      })
    }

    console.log('\n📊 Planos disponíveis:')
    const plans = await prisma.plan.findMany({
      where: { active: true }
    })
    
    plans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name}`)
      console.log(`      - Slug: ${plan.slug}`)
      console.log(`      - Período: ${plan.billingPeriod}`)
      console.log(`      - Preço: R$ ${(plan.priceCents / 100).toFixed(2)}`)
      console.log(`      - Downloads/dia: ${plan.maxDownloadsPerDay}`)
      console.log(`      - Downloads/mês: ${plan.maxDownloadsPerMonth}`)
    })

  } catch (error) {
    console.error('❌ Erro ao verificar subscriptions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserSubscriptions() 