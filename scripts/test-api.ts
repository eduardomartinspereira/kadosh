import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPI() {
  try {
    console.log('🧪 Testando API de status dos downloads...')

    // Buscar usuário pelo email
    const userEmail = 'eduardomartinspereira20@gmail.com'
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('👤 Usuário:', user.email)

    // Testar a mesma query que a API usa
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
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

    console.log('🔍 Query executada com sucesso')
    console.log('🔍 Subscription encontrada:', activeSubscription ? 'SIM' : 'NÃO')
    
    if (activeSubscription) {
      console.log('🔍 Status:', activeSubscription.status)
      console.log('🔍 Plano:', activeSubscription.plan.name)
      console.log('🔍 currentPeriodEnd:', activeSubscription.currentPeriodEnd)
      console.log('🔍 Data atual:', new Date())
      console.log('🔍 currentPeriodEnd > Data atual:', activeSubscription.currentPeriodEnd > new Date())
    }

    // Testar query mais simples
    console.log('\n🔍 Testando query mais simples...')
    const allSubscriptions = await prisma.subscription.findMany({
      where: { userId: user.id },
      include: { plan: true }
    })

    console.log('🔍 Todas as subscriptions:', allSubscriptions.length)
    allSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. Status: ${sub.status}, Plano: ${sub.plan.name}`)
    })

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI() 