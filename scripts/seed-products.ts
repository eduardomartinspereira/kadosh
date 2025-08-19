import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: 'Flyer Evento de Jovens',
    description: 'Flyer moderno para evento de jovens com design atrativo e cores vibrantes',
    categorySlug: 'flyers-eventos',
    assets: [
      {
        label: 'Versão Principal',
        uri: '/images/products/flyer-jovens-1.jpg',
        type: 'IMAGE',
        width: 800,
        height: 600
      },
      {
        label: 'Versão Alternativa',
        uri: '/images/products/flyer-jovens-2.jpg',
        type: 'IMAGE',
        width: 800,
        height: 600
      }
    ]
  },
  {
    name: 'Post Instagram Culto',
    description: 'Post otimizado para Instagram com mensagem inspiradora para cultos',
    categorySlug: 'posts-redes-sociais',
    assets: [
      {
        label: 'Post Principal',
        uri: '/images/products/post-culto-1.jpg',
        type: 'IMAGE',
        width: 1080,
        height: 1080
      },
      {
        label: 'Story',
        uri: '/images/products/post-culto-2.jpg',
        type: 'IMAGE',
        width: 1080,
        height: 1920
      }
    ]
  },
  {
    name: 'Banner Igreja',
    description: 'Banner digital para igreja com design limpo e profissional',
    categorySlug: 'banners',
    assets: [
      {
        label: 'Banner Principal',
        uri: '/images/products/banner-igreja-1.jpg',
        type: 'IMAGE',
        width: 1200,
        height: 400
      },
      {
        label: 'Banner Mobile',
        uri: '/images/products/banner-igreja-2.jpg',
        type: 'IMAGE',
        width: 400,
        height: 600
      }
    ]
  },
  {
    name: 'Convite Batizado',
    description: 'Convite elegante para cerimônia de batizado com design tradicional',
    categorySlug: 'convites',
    assets: [
      {
        label: 'Frente',
        uri: '/images/products/convite-batizado-1.jpg',
        type: 'IMAGE',
        width: 600,
        height: 400
      },
      {
        label: 'Verso',
        uri: '/images/products/convite-batizado-2.jpg',
        type: 'IMAGE',
        width: 600,
        height: 400
      }
    ]
  },
  {
    name: 'Arte Culto Domingo',
    description: 'Arte para culto de domingo com mensagem bíblica inspiradora',
    categorySlug: 'artes-cultos',
    assets: [
      {
        label: 'Arte Principal',
        uri: '/images/products/arte-culto-1.jpg',
        type: 'IMAGE',
        width: 1200,
        height: 800
      },
      {
        label: 'Versão Redes Sociais',
        uri: '/images/products/arte-culto-2.jpg',
        type: 'IMAGE',
        width: 1080,
        height: 1080
      }
    ]
  },
  {
    name: 'Arte Natal',
    description: 'Arte natalina com tema cristão e design festivo',
    categorySlug: 'datas-comemorativas',
    assets: [
      {
        label: 'Arte Principal',
        uri: '/images/products/arte-natal-1.jpg',
        type: 'IMAGE',
        width: 1200,
        height: 800
      },
      {
        label: 'Versão Cartão',
        uri: '/images/products/arte-natal-2.jpg',
        type: 'IMAGE',
        width: 600,
        height: 400
      },
      {
        label: 'Versão Redes Sociais',
        uri: '/images/products/arte-natal-3.jpg',
        type: 'IMAGE',
        width: 1080,
        height: 1080
      }
    ]
  },
  {
    name: 'Template Flyer Evento',
    description: 'Template editável para flyers de eventos com múltiplas variações',
    categorySlug: 'assets-criacao',
    assets: [
      {
        label: 'Template Base',
        uri: '/images/products/template-flyer-1.jpg',
        type: 'IMAGE',
        width: 800,
        height: 600
      },
      {
        label: 'Variação 1',
        uri: '/images/products/template-flyer-2.jpg',
        type: 'IMAGE',
        width: 800,
        height: 600
      },
      {
        label: 'Variação 2',
        uri: '/images/products/template-flyer-3.jpg',
        type: 'IMAGE',
        width: 800,
        height: 600
      }
    ]
  }
]

async function main() {
  console.log('🌱 Iniciando seed dos produtos...')

  for (const productData of sampleProducts) {
    try {
      // Buscar categoria
      const category = await prisma.category.findUnique({
        where: { slug: productData.categorySlug }
      })

      if (!category) {
        console.log(`⚠️ Categoria "${productData.categorySlug}" não encontrada, pulando produto`)
        continue
      }

      // Verificar se produto já existe
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name }
      })

      if (existingProduct) {
        console.log(`✅ Produto "${productData.name}" já existe`)
        continue
      }

      // Criar slug único
      const slug = productData.name
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
          name: productData.name,
          slug,
          description: productData.description,
          status: 'ACTIVE',
          isPublic: true,
          categories: {
            create: {
              categoryId: category.id
            }
          },
          assets: {
            create: productData.assets.map(asset => ({
              label: asset.label,
              uri: asset.uri,
              type: asset.type,
              width: asset.width,
              height: asset.height
            }))
          }
        }
      })

      console.log(`✅ Produto criado: ${product.name} com ${productData.assets.length} imagens`)

    } catch (error) {
      console.error(`❌ Erro ao criar produto "${productData.name}":`, error)
    }
  }

  console.log('🎉 Seed dos produtos concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 