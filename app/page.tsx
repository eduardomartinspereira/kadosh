import { Button } from "@/components/ui/button"
import { ArrowRight, FileImage, Smartphone, Calendar, Gift } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CatalogSection from "@/components/catalog-section"

export default function HomePage() {
  const serviceCategories = [
    {
      icon: <FileImage className="h-6 w-6" />,
      title: "Flyers para Eventos",
      description: "Artes profissionais para divulgação de eventos, cultos e atividades da igreja",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Posts para Redes Sociais",
      description: "Conteúdo visual otimizado para Instagram, Facebook e outras plataformas",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Artes para Cultos",
      description: "Materiais visuais para apresentações, slides e decoração de cultos",
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Datas Comemorativas",
      description: "Artes especiais para Natal, Páscoa, Dia das Mães e outras celebrações",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Reverted to Version 1 style with dark theme */}
      <section className="relative py-20 lg:py-32 flex flex-col items-center justify-center text-center bg-background text-foreground">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
            Transforme sua visão em realidade com <span className="text-primary">Kadosh</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-10 text-muted-foreground">
            Sua biblioteca digital completa de artes e materiais gráficos cristãos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="#catalog">Ver Catálogo</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              asChild
            >
              <Link href="/contact">Falar Conosco</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Catálogo de Produtos - Agora na página principal */}
      <CatalogSection />

      {/* Services/Products Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nossos Serviços</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Assinatura mensal com acesso completo à nossa biblioteca de arquivos PSD, PNG, JPG, flyers e artes cristãs
              editáveis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-background border-border">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg text-foreground">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="#catalog">
                Explorar Catálogo Completo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Original Services Preview - Now focused on general design services */}
     {/* <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Formatos Disponíveis</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Todos os arquivos em formatos profissionais para máxima qualidade e flexibilidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <Image
                  src="/imagemPsd2.png"
                  alt="Arquivos PSD"
                  width={400}
                  height={200}
                  className="rounded-lg mb-4"
                />
                <CardTitle className="text-foreground">Arquivos PSD</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Arquivos editáveis do Photoshop com camadas organizadas para máxima flexibilidade de edição.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <Image
                  src="/imagemPng.png"
                  alt="Arquivos PNG"
                  width={400}
                  height={200}
                  className="rounded-lg mb-4"
                />
                <CardTitle className="text-foreground">Arquivos PNG</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Imagens em alta resolução com fundo transparente, prontas para uso imediato.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <Image
                  src="/placeholder.svg?height=200&width=400&text=JPG+Files"
                  alt="Arquivos JPG"
                  width={400}
                  height={200}
                  className="rounded-lg mb-4"
                />
                <CardTitle className="text-foreground">Arquivos JPG</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Imagens finalizadas em alta qualidade, otimizadas para impressão e uso digital.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/plans">
                Ver Planos de Assinatura
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section> /*`

      {/* CTA Section - Adapted to dark theme */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Pronto para transformar sua comunicação visual?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Acesse nossa biblioteca completa de artes cristãs com Kadosh e eleve o nível da comunicação da sua igreja ou
            ministério
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/contact">Falar Conosco</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/plans">Ver Planos</Link>
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  )
}
