import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar produtos com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Construir filtros
    const where: any = {
      isPublic: true,
      status: 'ACTIVE'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    // Buscar produtos com categorias e assets
    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        assets: {
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Contar total de produtos
    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, categoryIds, assets } = body

    if (!name || !categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Nome e pelo menos uma categoria são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar slug único
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Criar produto
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        status: 'ACTIVE',
        isPublic: true,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            categoryId
          }))
        },
        assets: {
          create: assets?.map((asset: any) => ({
            label: asset.label,
            uri: asset.uri,
            type: asset.type || 'IMAGE',
            sizeBytes: asset.sizeBytes,
            width: asset.width,
            height: asset.height,
            previewUri: asset.previewUri
          })) || []
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        assets: true
      }
    })

    return NextResponse.json(product, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 