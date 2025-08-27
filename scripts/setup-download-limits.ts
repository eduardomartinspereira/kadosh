import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDownloadLimits() {
  try {
    console.log('🚀 Configurando plano único com 5 downloads por dia...')

    // Plano Mensal - 5 downloads por dia
    const monthlyPlan = await prisma.plan.upsert({
      where: { slug: 'monthly' },
      update: {
        maxDownloadsPerDay: 5,
        maxDownloadsPerMonth: 150, // 5 * 30 dias
      },
      create: {
        name: 'Plano Mensal',
        slug: 'monthly',
        description: 'Plano com 5 downloads por dia',
        billingPeriod: 'MONTHLY',
        priceCents: 2900, // R$ 29,00
        currency: 'BRL',
        maxDownloadsPerDay: 5,
        maxDownloadsPerMonth: 150,
        active: true,
      },
    })

    // Plano Anual - 5 downloads por dia
    const yearlyPlan = await prisma.plan.upsert({
      where: { slug: 'yearly' },
      update: {
        maxDownloadsPerDay: 5,
        maxDownloadsPerMonth: 150,
      },
      create: {
        name: 'Plano Anual',
        slug: 'yearly',
        description: 'Plano anual com 5 downloads por dia',
        billingPeriod: 'YEARLY',
        priceCents: 29000, // R$ 290,00
        currency: 'BRL',
        maxDownloadsPerDay: 5,
        maxDownloadsPerMonth: 150,
        active: true,
      },
    })

    console.log('✅ Planos configurados com sucesso!')
    console.log('📋 Resumo dos planos:')
    console.log(`   - Mensal: ${monthlyPlan.maxDownloadsPerDay} downloads/dia`)
    console.log(`   - Anual: ${yearlyPlan.maxDownloadsPerDay} downloads/dia`)

  } catch (error) {
    console.error('❌ Erro ao configurar planos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupDownloadLimits() 