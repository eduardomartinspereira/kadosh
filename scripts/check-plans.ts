import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPlans() {
  try {
    console.log('🔍 Verificando planos no banco...')
    
    // Buscar todos os planos
    const plans = await prisma.plan.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`\n📋 Total de planos encontrados: ${plans.length}`)
    
    if (plans.length === 0) {
      console.log('❌ Nenhum plano encontrado!')
      return
    }
    
    plans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.name}`)
      console.log(`   - Slug: ${plan.slug}`)
      console.log(`   - Período: ${plan.billingPeriod}`)
      console.log(`   - Preço: R$ ${(plan.priceCents / 100).toFixed(2)}`)
      console.log(`   - Ativo: ${plan.active ? '✅' : '❌'}`)
      console.log(`   - Dias de trial: ${plan.trialDays}`)
    })
    
    // Verificar se há planos mensais e anuais
    const monthlyPlans = plans.filter(p => p.billingPeriod === 'MONTHLY')
    const yearlyPlans = plans.filter(p => p.billingPeriod === 'YEARLY')
    
    console.log(`\n📊 Resumo:`)
    console.log(`   - Planos mensais: ${monthlyPlans.length}`)
    console.log(`   - Planos anuais: ${yearlyPlans.length}`)
    
    if (monthlyPlans.length === 0) {
      console.log('⚠️  Nenhum plano mensal encontrado!')
    }
    
    if (yearlyPlans.length === 0) {
      console.log('⚠️  Nenhum plano anual encontrado!')
    }
    
    // Verificar se há planos com slug 'monthly' e 'yearly'
    const monthlySlug = plans.find(p => p.slug === 'monthly')
    const yearlySlug = plans.find(p => p.slug === 'yearly')
    
    console.log(`\n🔍 Verificação de slugs:`)
    console.log(`   - Slug 'monthly': ${monthlySlug ? '✅' : '❌'}`)
    console.log(`   - Slug 'yearly': ${yearlySlug ? '✅' : '❌'}`)
    
    if (!monthlySlug || !yearlySlug) {
      console.log('\n⚠️  ATENÇÃO: Planos com slugs "monthly" e "yearly" são necessários para o sistema funcionar!')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar planos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPlans() 