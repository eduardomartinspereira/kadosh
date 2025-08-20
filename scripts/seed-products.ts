import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: 'Flyer Evento de Jovens',
    description: 'Flyer moderno para evento de jovens com design atrativo e cores vibrantes',
    categorySlug: 'flyers-eventos',
    mainImage: '/images/products/flyer-jovens-1.jpg',
    images: [
      {
        url: '/images/products/flyer-jovens-1.jpg',
        label: 'Versão Principal',
        width: 800,
        height: 600
      },
      {
        url: '/images/products/flyer-jovens-2.jpg',
        label: 'Versão Alternativa',
        width: 800,
        height: 600
      }
    ]
  },
  {
    name: 'Post Instagram Culto',
    description: 'Post otimizado para Instagram com mensagem inspiradora para cultos',
    categorySlug: 'posts-redes-sociais',
    mainImage: '/images/products/post-culto-1.jpg',
    images: [
      {
        url: '/images/products/post-culto-1.jpg',
        label: 'Post Principal',
        width: 1080,
        height: 1080
      },
      {
        url: '/images/products/post-culto-2.jpg',
        label: 'Story',
        width: 1080,
        height: 1920
      }
    ]
  },
  {
    name: 'Banner Igreja',
    description: 'Banner digital para igreja com design limpo e profissional',
    categorySlug: 'banners',
    mainImage: '/images/products/banner-igreja-1.jpg',
    images: [
      {
        url: '/images/products/banner-igreja-1.jpg',
        label: 'Banner Principal',
        width: 1200,
        height: 400
      },
      {
        url: '/images/products/banner-igreja-2.jpg',
        label: 'Banner Mobile',
        width: 400,
        height: 600
      }
    ]
  },
  {
    name: 'Convite Batizado',
    description: 'Convite elegante para cerimônia de batizado com design tradicional',
    categorySlug: 'convites',
    mainImage: '/images/products/convite-batizado-1.jpg',
    images: [
      {
        url: '/images/products/convite-batizado-1.jpg',
        label: 'Frente',
        width: 600,
        height: 400
      },
      {
        url: '/images/products/convite-batizado-2.jpg',
        label: 'Verso',
        width: 600,
        height: 400
      }
    ]
  },
  {
    name: 'Arte Culto Domingo',
    description: 'Arte para culto de domingo com mensagem bíblica inspiradora',
    categorySlug: 'artes-cultos',
    mainImage: '/images/products/arte-culto-1.jpg',
    images: [
      {
        url: '/images/products/arte-culto-1.jpg',
        label: 'Arte Principal',
        width: 1200,
        height: 800
      },
      {
        url: '/images/products/arte-culto-2.jpg',
        label: 'Versão Redes Sociais',
        width: 1080,
        height: 1080
      }
    ]
  },
  {
    name: 'Arte Natal',
    description: 'Arte natalina com tema cristão e design festivo',
    categorySlug: 'datas-comemorativas',
    mainImage: '/images/products/arte-natal-1.jpg',
    images: [
      {
        url: '/images/products/arte-natal-1.jpg',
        label: 'Arte Principal',
        width: 1200,
        height: 800
      },
      {
        url: '/images/products/arte-natal-2.jpg',
        label: 'Versão Cartão',
        width: 600,
        height: 400
      },
      {
        url: '/images/products/arte-natal-3.jpg',
        label: 'Versão Redes Sociais',
        width: 1080,
        height: 1080
      }
    ]
  },
  {
    name: 'Template Flyer Evento',
    description: 'Template editável para flyers de eventos com múltiplas variações',
    categorySlug: 'assets-criacao',
    mainImage: '/images/products/template-flyer-1.jpg',
    images: [
      {
        url: '/images/products/template-flyer-1.jpg',
        label: 'Template Base',
        width: 800,
        height: 600
      },
      {
        url: '/images/products/template-flyer-2.jpg',
        label: 'Variação 1',
        width: 800,
        height: 600
      },
      {
        url: '/images/products/template-flyer-3.jpg',
        label: 'Variação 2',
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
          mainImage: productData.mainImage,
          images: productData.images,
          categories: {
            create: {
              categoryId: category.id
            }
          }
        }
      })

      console.log(`✅ Produto criado: ${product.name} com ${productData.images?.length || 0} imagens`)

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