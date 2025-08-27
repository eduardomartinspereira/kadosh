import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, cpf, password } = body

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar formato de CPF (formato básico: XXX.XXX.XXX-XX)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    if (!cpfRegex.test(cpf)) {
      return NextResponse.json(
        { error: 'Formato de CPF inválido. Use o formato: XXX.XXX.XXX-XX' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
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

    // Criptografar a senha
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Criar o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        cpf: cpf.trim(),
        password: hashedPassword,
        role: 'CUSTOMER', // Definir como CUSTOMER por padrão
      }
    })

    // Retornar sucesso (sem a senha)
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    
    // Verificar se é um erro de validação do Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('email')) {
          return NextResponse.json(
            { error: 'Este email já está em uso' },
            { status: 409 }
          )
        }
        if (error.message.includes('cpf')) {
          return NextResponse.json(
            { error: 'Este CPF já está em uso' },
            { status: 409 }
          )
        }
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 