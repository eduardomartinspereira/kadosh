import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { name, email, cpf, password } = await request.json()

    // Validações básicas
    if (!name || !email || !cpf || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 }
      )
    }

    // Verificar se o CPF já existe
    const existingUserByCpf = await prisma.user.findUnique({
      where: { cpf }
    })

    if (existingUserByCpf) {
      return NextResponse.json(
        { error: 'Este CPF já está em uso' },
        { status: 409 }
      )
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashedPassword,
        role: 'CUSTOMER',
      }
    })

    // Retornar usuário criado (sem senha)
    const { ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 