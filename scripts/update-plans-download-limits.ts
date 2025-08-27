import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePlansWithDownloadLimits() {
  try {
    console.log('🔄 Atualizando planos com limites de download...')

    // Atualizar plano Básico (se existir)
    await prisma.plan.upsert({
      where: { slug: 'basic' },
      update: {
        maxDownloadsPerMonth: 5,
        maxDownloadsPerDay: 1
      },
      create: {
        name: 'Básico',
        slug: 'basic',
        description: 'Plano básico com acesso limitado',
        billingPeriod: 'MONTHLY',
        priceCents: 9700, // R$ 97,00
        currency: 'BRL',
        maxDownloadsPerMonth: 5,
        maxDownloadsPerDay: 1
      }
    })

    // Atualizar plano Profissional
    await prisma.plan.upsert({
      where: { slug: 'professional' },
      update: {
        maxDownloadsPerMonth: 150, // 5 por dia * 30 dias
        maxDownloadsPerDay: 5
      },
      create: {
        name: 'Profissional',
        slug: 'professional',
        description: 'Plano profissional com mais recursos',
        billingPeriod: 'MONTHLY',
        priceCents: 3500, // R$ 35,00
        currency: 'BRL',
        maxDownloadsPerMonth: 150,
        maxDownloadsPerDay: 5
      }
    })

    // Atualizar plano Empresarial (se existir)
    await prisma.plan.upsert({
      where: { slug: 'enterprise' },
      update: {
        maxDownloadsPerMonth: null, // Ilimitado
        maxDownloadsPerDay: null // Ilimitado
      },
      create: {
        name: 'Empresarial',
        slug: 'enterprise',
        description: 'Plano empresarial com downloads ilimitados',
        billingPeriod: 'MONTHLY',
        priceCents: 39700, // R$ 397,00
        currency: 'BRL',
        maxDownloadsPerMonth: null,
        maxDownloadsPerDay: null
      }
    })

    console.log('✅ Planos atualizados com sucesso!')
    
    // Listar planos atualizados
    const plans = await prisma.plan.findMany({
      select: {
        name: true,
        slug: true,
        maxDownloadsPerMonth: true,
        maxDownloadsPerDay: true,
        priceCents: true
      }
    })

    console.log('\n📋 Planos configurados:')
    plans.forEach(plan => {
      console.log(`- ${plan.name} (${plan.slug}):`)
      console.log(`  Preço: R$ ${(plan.priceCents / 100).toFixed(2)}`)
      console.log(`  Downloads/dia: ${plan.maxDownloadsPerDay || 'Ilimitado'}`)
      console.log(`  Downloads/mês: ${plan.maxDownloadsPerMonth || 'Ilimitado'}`)
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar planos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
updatePlansWithDownloadLimits() 