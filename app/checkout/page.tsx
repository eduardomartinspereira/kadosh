"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Shield, Check, Lock, CreditCard, QrCode, FileText } from "lucide-react"
import Link from "next/link"
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'

interface Plan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
}

const plans: Record<string, Plan> = {
  basic: {
    id: "basic",
    name: "Básico",
    description: "Ideal para pequenas empresas e freelancers",
    monthlyPrice: 97,
    yearlyPrice: 970,
    features: [
      "Acesso ao catálogo básico",
      "5 downloads por mês",
      "Suporte por email",
      "Templates básicos",
      "Guias de marca simples",
    ],
  },
  professional: {
    id: "professional",
    name: "Profissional",
    description: "Para empresas em crescimento que precisam de mais recursos",
    monthlyPrice: 197,
    yearlyPrice: 1970,
    features: [
      "Acesso completo ao catálogo",
      "20 downloads por mês",
      "Suporte prioritário",
      "Templates premium",
      "Guias de marca avançados",
      "Consultoria mensal (1h)",
      "Acesso a webinars exclusivos",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Empresarial",
    description: "Solução completa para grandes empresas",
    monthlyPrice: 397,
    yearlyPrice: 3970,
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
  },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get("plan") || "basic"
  const billingCycle = searchParams.get("cycle") || "monthly"
  
  // Inicializar MercadoPago
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-12345678-1234-1234-1234-123456789012')
  }, [])
  
  // Verificar se o usuário está logado e gerar preferência
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      alert("Você precisa estar logado para acessar esta página. Faça login primeiro.")
      window.location.href = "/auth/login"
      return
    }

    // Gerar preferência de pagamento
    const generatePreference = async () => {
      try {
        const userData = JSON.parse(user)
        const response = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            billingCycle,
            userId: userData.id
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setPreferenceId(data.preferenceId)
        } else {
          console.error('Erro ao gerar preferência')
        }
      } catch (error) {
        console.error('Erro ao gerar preferência:', error)
      }
    }

    generatePreference()
  }, [planId, billingCycle])
  
  const [isLoading, setIsLoading] = useState(false)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    acceptTerms: false,
  })

  const selectedPlan = plans[planId]
  const price = billingCycle === "monthly" ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice
  const savings = billingCycle === "yearly" ? (selectedPlan.monthlyPrice * 12) - selectedPlan.yearlyPrice : 0

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/plans" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos planos
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Finalizar Assinatura</h1>
            <p className="text-muted-foreground mt-2">Complete seu pagamento para acessar a plataforma</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Ciclo: {billingCycle === "monthly" ? "Mensal" : "Anual"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">R$ {price}</div>
                      <div className="text-sm text-muted-foreground">
                        /{billingCycle === "monthly" ? "mês" : "ano"}
                      </div>
                    </div>
                  </div>

                  {billingCycle === "yearly" && savings > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-green-700 dark:text-green-400 text-sm">
                        💰 Economia de R$ {savings} por ano!
                      </p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-foreground mb-3">Incluído no seu plano:</h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-foreground">Pagamento Seguro</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Seus dados são protegidos com criptografia SSL de 256 bits. Não armazenamos informações do cartão.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Forma de Pagamento
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Escolha entre PIX, cartão ou boleto para finalizar sua assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleChange("acceptTerms", checked as boolean)}
                      required
                      className="border-border"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground">
                      Aceito os{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                    </Label>
                  </div>
                </div>

                {/* Opções de Pagamento */}
                {preferenceId ? (
                  <Tabs defaultValue="pix" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted">
                      <TabsTrigger value="pix" className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        PIX
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Cartão
                      </TabsTrigger>
                      <TabsTrigger value="boleto" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Boleto
                      </TabsTrigger>
                    </TabsList>

                    {/* PIX */}
                    <TabsContent value="pix" className="space-y-4">
                      <div className="text-center py-6">
                        <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Pagamento via PIX</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Escaneie o QR Code ou copie o código PIX para pagar instantaneamente
                        </p>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`, '_blank')}
                        >
                          Pagar com PIX
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Cartão de Crédito */}
                    <TabsContent value="card" className="space-y-4">
                      <div className="text-center py-6">
                        <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <CreditCard className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Cartão de Crédito/Débito</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Pague com cartão de crédito ou débito de forma segura
                        </p>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`, '_blank')}
                        >
                          Pagar com Cartão
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Boleto */}
                    <TabsContent value="boleto" className="space-y-4">
                      <div className="text-center py-6">
                        <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <FileText className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Boleto Bancário</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Gere um boleto para pagar no banco ou internet banking
                        </p>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => window.open(`https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${preferenceId}`, '_blank')}
                        >
                          Pagar com Boleto
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="border border-border rounded-lg p-4 text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando opções de pagamento...</p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Pagamento processado com segurança pelo MercadoPago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 