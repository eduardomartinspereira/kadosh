import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Flyers para eventos',
    slug: 'flyers-eventos',
    description: 'Flyers e materiais promocionais para eventos diversos'
  },
  {
    name: 'Posts para redes sociais',
    slug: 'posts-redes-sociais',
    description: 'Artes e posts otimizados para Instagram, Facebook e outras redes sociais'
  },
  {
    name: 'Banners',
    slug: 'banners',
    description: 'Banners digitais e impressos para diferentes formatos'
  },
  {
    name: 'Convites',
    slug: 'convites',
    description: 'Convites digitais e impressos para eventos e celebrações'
  },
  {
    name: 'Artes para cultos',
    slug: 'artes-cultos',
    description: 'Materiais visuais para cultos e atividades religiosas'
  },
  {
    name: 'Datas comemorativas',
    slug: 'datas-comemorativas',
    description: 'Artes e materiais para datas especiais e celebrações'
  },
  {
    name: 'Assets para criação de artes',
    slug: 'assets-criacao',
    description: 'Elementos gráficos, templates e recursos para criação de artes'
  }
]

async function main() {
  console.log('🌱 Iniciando seed das categorias...')

  for (const category of categories) {
    try {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug }
      })

      if (existingCategory) {
        console.log(`✅ Categoria "${category.name}" já existe`)
        continue
      }

      const newCategory = await prisma.category.create({
        data: category
      })

      console.log(`✅ Categoria criada: ${newCategory.name} (${newCategory.slug})`)
    } catch (error) {
      console.error(`❌ Erro ao criar categoria "${category.name}":`, error)
    }
  }

  console.log('🎉 Seed das categorias concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 