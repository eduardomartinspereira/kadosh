"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: "",
  })

  // Função para aplicar máscara de telefone
  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara (99) 99999-9999
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Formatar a mensagem para o WhatsApp
    const whatsappMessage = `Nova mensagem do site HD Designer

Nome: ${formData.name}
E-mail: ${formData.email}
Telefone: ${formData.phone || 'Não informado'}
Empresa: ${formData.company || 'Não informado'}
Serviço de interesse: ${formData.service || 'Não informado'}

*Mensagem:*
${formData.message}

---
Mensagem enviada através do formulário de contato do site.`

    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(whatsappMessage)
    
    // Número do WhatsApp (formato internacional)
    const whatsappNumber = "5531986022600"
    
    // URL do WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, "_blank")
    
    // Mostrar mensagem de sucesso
    alert("Formulário enviado! Redirecionando para o WhatsApp...")
    
    // Limpar o formulário
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      message: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Endereço",
      content: "Divinópolis, MG (atendimento online)",
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: "Telefone",
      content: "(31) 98602-2600",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: "E-mail",
      content: "kadosh.suporteonline@gmail.com",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Horário",
      content: "Segunda à Sexta\n9h às 18h",
    },
  ]

  const services = [
    "Identidade Visual",
    "Design Digital",
    "Material Gráfico",
    "Branding",
    "Website",
    "Aplicativo",
    "Consultoria",
    "Outro",
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Entre em Contato
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">Vamos conversar sobre seu projeto</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Estamos prontos para transformar suas ideias em realidade. Entre em contato e descubra como podemos ajudar
              sua marca a se destacar.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Envie sua mensagem</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Preencha o formulário abaixo e entraremos em contato em até 24 horas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="Seu nome"
                          required
                          className="bg-muted border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="seu@email.com"
                          required
                          className="bg-muted border-border"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="(31) 98602-2600"
                          className="bg-muted border-border"
                        />
                        <p className="text-xs text-muted-foreground">
                          Formato: (31) 98602-2600
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          placeholder="Nome da empresa"
                          className="bg-muted border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service">Serviço de interesse</Label>
                      <Select onValueChange={(value) => handleChange("service", value)}>
                        <SelectTrigger className="bg-muted border-border">
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {services.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Conte-nos sobre seu projeto..."
                        rows={5}
                        required
                        className="bg-muted border-border"
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Informações de Contato</h2>
                <div className="grid gap-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="bg-background border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground flex-shrink-0">
                            {info.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                            <p className="text-muted-foreground whitespace-pre-line">{info.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* WhatsApp CTA */}
              <Card className="bg-green-900 border-green-700 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">Prefere WhatsApp?</h3>
                      <p className="text-green-200 mb-3">
                        Fale conosco diretamente pelo WhatsApp para um atendimento mais rápido
                      </p>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          window.open(
                            "https://wa.me/5531986022600?text=Olá! Gostaria de saber mais sobre os serviços da HD Designer.",
                            "_blank",
                          )
                        }
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chamar no WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="bg-background border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Siga-nos nas redes sociais</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Acompanhe nossos trabalhos e novidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="bg-muted border-border text-foreground hover:bg-accent"
                    >
                      <a href="https://instagram.com/kadosh" target="_blank" rel="noopener noreferrer">
                        Instagram
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section 
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossa Localização</h2>
            <p className="text-muted-foreground">Venha nos visitar em nosso escritório no centro de São Paulo</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Mapa interativo seria integrado aqui</p>
                    <p className="text-sm">Divinópolis, MG</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      */}

      <WhatsAppButton />
    </div>
  )
}
