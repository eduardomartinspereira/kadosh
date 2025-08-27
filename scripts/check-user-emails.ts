import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserEmails() {
  try {
    console.log('🔍 Verificando emails dos usuários...')

    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n👥 Total de usuários: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuário:`)
      console.log(`   - ID: ${user.id}`)
      console.log(`   - Nome: ${user.name}`)
      console.log(`   - Email: ${user.email}`)
      console.log(`   - Role: ${user.role}`)
      console.log(`   - Criado em: ${user.createdAt}`)
    })

    // Verificar se há usuários com emails duplicados ou incorretos
    const emailCounts = users.reduce((acc, user) => {
      acc[user.email] = (acc[user.email] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\n📧 Análise de emails:')
    Object.entries(emailCounts).forEach(([email, count]) => {
      if (count > 1) {
        console.log(`   ⚠️  Email duplicado: ${email} (${count} usuários)`)
      } else {
        console.log(`   ✅ Email único: ${email}`)
      }
    })

    // Verificar usuário específico
    const specificUser = await prisma.user.findUnique({
      where: { email: 'eduardomartinspereira20@gmail.com' },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        }
      }
    })

    if (specificUser) {
      console.log('\n🎯 Usuário específico encontrado:')
      console.log(`   - ID: ${specificUser.id}`)
      console.log(`   - Nome: ${specificUser.name}`)
      console.log(`   - Email: ${specificUser.email}`)
      console.log(`   - Role: ${specificUser.role}`)
      console.log(`   - Subscriptions: ${specificUser.subscriptions.length}`)
      
      specificUser.subscriptions.forEach((sub, index) => {
        console.log(`     ${index + 1}. Subscription ID: ${sub.id}`)
        console.log(`        - Status: ${sub.status}`)
        console.log(`        - Plano: ${sub.plan.name}`)
        console.log(`        - Criada em: ${sub.createdAt}`)
      })
    } else {
      console.log('\n❌ Usuário específico NÃO encontrado!')
    }

  } catch (error) {
    console.error('❌ Erro ao verificar emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserEmails() 