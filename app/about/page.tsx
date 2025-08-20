import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Award, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function AboutPage() {
  const team = [
    {
      name: "Hudson Soares",
      role: "Fundador e CEO",
      image: "/placeholder.svg?height=300&width=300",
      description: "Mais de 10 anos de experiência em design e comunicação cristã",
    }
  ]

  const milestones = [
    { year: "2020", event: "Fundação da Kadosh" },
    { year: "2021", event: "Identificação da lacuna no mercado cristão" },
    { year: "2022", event: "Desenvolvimento da plataforma digital" },
    { year: "2023", event: "Lançamento da biblioteca de recursos criativos" },
    { year: "2024", event: "Expansão e reconhecimento no segmento cristão" },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Sobre a Kadosh
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">Sobre Nós – Kadosh</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Uma plataforma digital especializada em oferecer recursos criativos para designers e comunicadores que atuam no segmento cristão.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Quem Somos</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A Kadosh é uma plataforma digital especializada em oferecer recursos criativos para designers e comunicadores que atuam no segmento cristão. Fundada por Hudson Soares, unimos mais de 10 anos de experiência no design com a missão de simplificar e potencializar o processo criativo de quem comunica a mensagem do Evangelho através das artes visuais.
                </p>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground">Nossa Origem</h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A ideia nasceu de uma lacuna no mercado. Ao longo de anos atendendo igrejas e eventos cristãos, percebemos que não havia um ambiente que reunisse, de forma prática e organizada, materiais relevantes e de alta qualidade para esse nicho. Foi então que decidimos transformar essa necessidade em oportunidade, criando um espaço que oferece exatamente o que buscávamos no passado.
                </p>
              </div>
              
              <Button size="lg" asChild>
                <Link href="/contact">
                  Entre em Contato
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Kadosh - Nossa equipe trabalhando"
                width={600}
                height={500}
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nossos Serviços e Compromisso</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              O que oferecemos e como nos comprometemos com sua criatividade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">O que Fazemos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  Disponibilizamos uma biblioteca de templates, arquivos PSD e artes temáticas projetadas para atender as demandas do público cristão. Nossa plataforma é intuitiva, atualizada constantemente e pensada para economizar tempo, sem comprometer a qualidade do resultado final.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Nosso Compromisso</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  Mais do que fornecer arquivos, queremos ser parceiros no processo criativo. Nosso objetivo é que cada arte produzida com nossos recursos tenha impacto, clareza e excelência — fortalecendo a comunicação e potencializando o alcance das mensagens que você quer transmitir.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Para Quem Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Para Quem</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nossos recursos são desenvolvidos especificamente para atender suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow bg-background border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Designers Cristãos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Que precisam de agilidade e variedade em seus projetos criativos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-background border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Voluntários de Mídia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Que atuam na comunicação visual de suas igrejas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-background border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Pastores e Líderes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Que desejam criar seus próprios materiais de divulgação.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nosso Diferencial Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nosso Diferencial</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              O que nos torna únicos no mercado de recursos criativos cristãos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Conteúdo 100% Focado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Conteúdo 100% focado no segmento cristão, evitando dispersão e garantindo relevância.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Organização Estratégica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organização estratégica que facilita a busca por temas e formatos específicos.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Arquivos Prontos para Edição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Arquivos prontos para edição, otimizando o tempo de produção.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Atualizações Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Frequentes atualizações para acompanhar tendências e datas importantes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conheça o fundador da Kadosh
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow bg-background border-border">
                <CardHeader>
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
                  />
                  <CardTitle className="text-xl text-foreground">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Nossa Jornada</h2>
            <p className="text-xl text-muted-foreground">Marcos importantes da nossa trajetória</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1">
                    <Card className="bg-card border-border">
                      <CardContent className="p-6">
                        <p className="text-lg font-medium text-foreground">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Pronto para potencializar sua criatividade?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Acesse nossa biblioteca de recursos criativos e transforme suas ideias em artes impactantes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/catalog">Explorar Catálogo</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/plans">Ver Planos</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/contact">Falar Conosco</Link>
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  )
}
