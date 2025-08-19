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
      name: "Helena Dias",
      role: "Diretora Criativa",
      image: "/placeholder.svg?height=300&width=300",
      description: "15 anos de experiência em design gráfico e branding",
    },
    {
      name: "Ricardo Mendes",
      role: "Designer Sênior",
      image: "/placeholder.svg?height=300&width=300",
      description: "Especialista em design digital e interfaces de usuário",
    },
    {
      name: "Carla Santos",
      role: "Estrategista de Marca",
      image: "/placeholder.svg?height=300&width=300",
      description: "MBA em Marketing e especialização em branding",
    },
  ]

  const milestones = [
    { year: "2019", event: "Fundação da Kadosh" },
    { year: "2020", event: "Primeiro grande cliente corporativo" },
    { year: "2021", event: "Expansão da equipe e novos serviços" },
    { year: "2022", event: "Lançamento da plataforma de planos" },
    { year: "2023", event: "500+ projetos entregues" },
    { year: "2024", event: "Reconhecimento como referência no mercado" },
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
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">Criando conexões através do design</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Somos uma agência de design apaixonada por transformar ideias em experiências visuais marcantes. Nossa
              missão é elevar marcas através de soluções criativas e estratégicas.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Nossa História</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  A Kadosh nasceu com o propósito de facilitar o acesso a artes e materiais gráficos cristãos com
                  qualidade e agilidade. Fundada com a visão de se tornar a maior biblioteca digital de artes cristãs
                  para designers e igrejas no Brasil.
                </p>
                <p>
                  Nossa jornada começou identificando a necessidade de materiais gráficos de qualidade específicos para
                  o público cristão, oferecendo soluções práticas e acessíveis para igrejas, ministérios e designers.
                </p>
                <p>
                  Hoje, oferecemos uma assinatura mensal com acesso completo à nossa biblioteca de arquivos PSD, PNG,
                  JPG, flyers e artes cristãs editáveis, sempre mantendo nossos valores de qualidade, agilidade,
                  acessibilidade, ética e compromisso com o público cristão.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/contact">
                  Trabalhe Conosco
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Missão, Visão e Valores</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Os pilares que fundamentam nosso trabalho e compromisso com o público cristão
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  Facilitar o acesso a artes e materiais gráficos cristãos com qualidade e agilidade.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  Ser a maior biblioteca digital de artes cristãs para designers e igrejas no Brasil.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-card border-border">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-foreground">Nossos Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-muted-foreground">
                  Qualidade, agilidade, acessibilidade, ética e compromisso com o público cristão.
                </CardDescription>
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
              Profissionais talentosos e apaixonados por design
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
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Vamos criar algo incrível juntos?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Entre em contato e descubra como podemos transformar sua visão em realidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/contact">Iniciar Projeto</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/catalog">Ver Portfólio</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="https://www.instagram.com/kadosh.ofc/">Instagram</Link>
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  )
}
