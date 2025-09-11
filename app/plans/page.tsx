"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Crown,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const plans = [
    /*{{
      id: "basic",
      name: "Básico",
      icon: <Zap className="h-6 w-6" />,
      description: "Ideal para pequenas empresas e freelancers",
      monthlyPrice: 97,
      yearlyPrice: 970,
      popular: false,
      features: [
        "Acesso ao catálogo básico",
        "5 downloads por mês",
        "Suporte por email",
        "Templates básicos",
        "Guias de marca simples",
      ],
      limitations: ["Sem acesso a conteúdo premium", "Sem consultoria personalizada", "Sem prioridade no suporte"],
    },*/
    {
      id: "professional",
      name: "Profissional",
      icon: <Star className="h-6 w-6" />,
      description: "Para empresas em crescimento que precisam de mais recursos",
      monthlyPrice: 34.9,
      yearlyPrice: 289.9,
      popular: true,
      features: [
        "Até 5 downloads por dia",
        "Qualquer arquivo do site",
        "Downloads simultâneos",
        "Velocidade máxima",
        "Site sem anúncios",
        "Suporte via Whatsapp",
        "Atualizações diárias",
        "Liberação imediata",
      ],
    },
    /*{{
      id: "enterprise",
      name: "Empresarial",
      icon: <Crown className="h-6 w-6" />,
      description: "Solução completa para grandes empresas",
      monthlyPrice: 397,
      yearlyPrice: 3970,
      popular: false,
      features: [
        "Acesso ilimitado ao catálogo",
        "Downloads ilimitados",
        "Suporte 24/7",
        "Templates exclusivos",
        "Guias de marca personalizados",
        "Consultoria ilimitada",
        "Sessões de treinamento",
        "Gerente de conta dedicado",
        "Conteúdo personalizado",
      ],
      limitations: [],
    },  */
  ];

  const features = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Acesso Seguro",
      description:
        "Plataforma protegida com autenticação avançada e dados criptografados",
    },
    {
      icon: <Download className="h-5 w-5" />,
      title: "Downloads Imediatos",
      description: "Acesso instantâneo a todos os arquivos em alta resolução",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Atualizações Constantes",
      description: "Novos conteúdos e recursos adicionados semanalmente",
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Qualidade Premium",
      description:
        "Arquivos profissionais criados por designers especializados",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Suporte Dedicado",
      description: "Atendimento via WhatsApp para dúvidas e suporte técnico",
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Sem Anúncios",
      description: "Experiência limpa e focada no conteúdo sem interrupções",
    },
  ];

  const getPrice = (plan: any) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavings = (plan: any) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    return savings.toFixed(2);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Planos e Preços
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Escolha o plano ideal para sua empresa
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Acesse conteúdos exclusivos, templates premium e consultoria
              especializada. Todos os planos incluem acesso à nossa plataforma e
              suporte dedicado.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span
                className={
                  billingCycle === "monthly"
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }
              >
                Mensal
              </span>
              <button
                onClick={() =>
                  setBillingCycle(
                    billingCycle === "monthly" ? "yearly" : "monthly"
                  )
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-primary-foreground transition-transform ${
                    billingCycle === "yearly"
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={
                  billingCycle === "yearly"
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }
              >
                Anual
              </span>
              {billingCycle === "yearly" && (
                <Badge variant="secondary" className="ml-2">
                  Economize até 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="max-w-md w-full">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular ? "ring-2 ring-primary scale-105" : ""
                  } hover:shadow-xl transition-all duration-300 bg-background border-border`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl text-foreground">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-base mt-2 text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold text-foreground">
                          R$ {getPrice(plan)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          /{billingCycle === "monthly" ? "mês" : "ano"}
                        </span>
                      </div>
                      {billingCycle === "yearly" && (
                        <p className="text-sm text-green-500 mt-2">
                          Economize R$ {getSavings(plan)} por ano
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">
                        Incluído:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className={`w-full ${
                        plan.popular ? "bg-primary hover:bg-primary/90" : ""
                      }`}
                      size="lg"
                      asChild
                    >
                      <Link
                        href={`/checkout?plan=${plan.id}&cycle=${billingCycle}`}
                      >
                        Começar Agora
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Recursos Inclusos em Todos os Planos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades essenciais para potencializar seus projetos de
              design
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow bg-card border-border"
              >
                <CardHeader>
                  <div className="mx-auto w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Compare os Planos</h2>
            <p className="text-xl text-muted-foreground">Veja em detalhes o que cada plano oferece</p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Recursos</th>
                  <th className="text-center py-4 px-6 font-semibold text-foreground">Básico</th>
                  <th className="text-center py-4 px-6 font-semibold text-foreground">Profissional</th>
                  <th className="text-center py-4 px-6 font-semibold text-foreground">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-muted-foreground">Downloads mensais</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">5</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">20</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">Ilimitado</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-muted-foreground">Suporte</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">Email</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">Prioritário</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">24/7</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-muted-foreground">Consultoria</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">-</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">1h/mês</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">Ilimitada</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-muted-foreground">Templates premium</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">-</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-6 text-muted-foreground">Gerente de conta</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">-</td>
                  <td className="text-center py-4 px-6 text-muted-foreground">-</td>
                  <td className="text-center py-4 px-6 text-green-500">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section> */}

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Por que escolher o Kadosh?
            </h2>
            <p className="text-xl text-muted-foreground">
              Recursos exclusivos que fazem a diferença no seu projeto
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow bg-card border-border"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Números que impressionam
            </h2>
            <p className="text-xl text-muted-foreground">
              Resultados reais da nossa plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Arquivos Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Downloads Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Suporte Disponível</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre nossos planos
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Posso cancelar minha assinatura a qualquer momento?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento. Não
                  há taxas de cancelamento e você manterá acesso até o final do
                  período pago.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Posso fazer upgrade ou downgrade do meu plano?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Claro! Você pode alterar seu plano a qualquer momento. O valor
                  será ajustado proporcionalmente no próximo ciclo de cobrança.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Os downloads têm limite de uso comercial?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos os nossos recursos podem ser usados comercialmente. Você
                  recebe licença completa para uso em projetos de clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">
                  Como funciona a consultoria incluída nos planos?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  A consultoria é realizada por videochamada com nossos
                  especialistas. Você pode agendar sessões para tirar dúvidas
                  sobre projetos, estratégias de marca e muito mais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Escolha seu plano e tenha acesso imediato a todos os recursos da HD
            Designer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
              asChild
            >
              <Link href="/auth/register">Criar Conta Grátis</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              asChild
            >
              <Link href="/contact">Falar com Especialista</Link>
            </Button>
          </div>
        </div>
      </section>

      <WhatsAppButton />
    </div>
  );
}
