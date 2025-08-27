import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testUserCreation() {
  try {
    console.log('🧪 Testando criação de usuários...')

    // Teste 1: Criar usuário válido
    console.log('\n📝 Teste 1: Criando usuário válido...')
    const testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        cpf: '123.456.789-00',
        password: 'senha123456',
        role: 'CUSTOMER'
      }
    })

    console.log('✅ Usuário criado com sucesso:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role,
      createdAt: testUser.createdAt
    })

    // Teste 2: Verificar se o usuário foi salvo
    console.log('\n🔍 Teste 2: Verificando se o usuário foi salvo...')
    const savedUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    })

    if (savedUser) {
      console.log('✅ Usuário encontrado no banco:', {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      })
    } else {
      console.log('❌ Usuário não encontrado no banco')
    }

    // Teste 3: Verificar se o role é CUSTOMER
    console.log('\n👤 Teste 3: Verificando role do usuário...')
    if (savedUser?.role === 'CUSTOMER') {
      console.log('✅ Role correto: CUSTOMER')
    } else {
      console.log('❌ Role incorreto:', savedUser?.role)
    }

    // Teste 4: Listar todos os usuários
    console.log('\n📋 Teste 4: Listando todos os usuários...')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Total de usuários: ${allUsers.length}`)
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })

    // Teste 5: Verificar constraints únicas
    console.log('\n🔒 Teste 5: Verificando constraints únicas...')
    try {
      const duplicateUser = await prisma.user.create({
        data: {
          name: 'Usuário Duplicado',
          email: 'teste@exemplo.com', // Email duplicado
          cpf: '987.654.321-00',
          password: 'senha123456',
          role: 'CUSTOMER'
        }
      })
      console.log('❌ Não deveria ter criado usuário com email duplicado')
    } catch (error) {
      console.log('✅ Constraint de email único funcionando:', error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Limpeza: Remover usuário de teste
    console.log('\n🧹 Limpeza: Removendo usuário de teste...')
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Usuário de teste removido')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar os testes
testUserCreation() 