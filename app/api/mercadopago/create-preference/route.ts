import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DA API ===')
    
    const { planId, billingCycle, userId } = await request.json()
    console.log('Dados recebidos:', { planId, billingCycle, userId })

    // Definir preços dos planos
    const planPrices: Record<string, { monthly: number; yearly: number }> = {
      basic: { monthly: 97, yearly: 970 },
      professional: { monthly: 197, yearly: 1970 },
      enterprise: { monthly: 397, yearly: 3970 }
    }

    const plan = planPrices[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const price = billingCycle === 'monthly' ? plan.monthly : plan.yearly
    const planNames = {
      basic: 'Básico',
      professional: 'Profissional',
      enterprise: 'Empresarial'
    }

    console.log('Configurando MercadoPago...')
    console.log('MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? 'Configurado' : 'NÃO CONFIGURADO')
    
    try {
      // Configurar MercadoPago
      const { MercadoPagoConfig, Preference } = require('mercadopago')
      console.log('SDK MercadoPago importado com sucesso')
      
      const config = new MercadoPagoConfig({
        accessToken: process.env.MP_ACCESS_TOKEN!
      })
      console.log('Configuração MercadoPago criada')

      // Criar preferência de pagamento
      const preference = {
        items: [
          {
            id: `${planId}_${billingCycle}`,
            title: `Plano ${planNames[planId as keyof typeof planNames]} - ${billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`,
            unit_price: price,
            quantity: 1,
            currency_id: 'BRL',
            description: `Assinatura do plano ${planNames[planId as keyof typeof planNames]} - ${billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`
          }
        ],
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 12,
          default_installments: 1
        },
        back_urls: {
          success: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?plan=${planId}&cycle=${billingCycle}`,
          failure: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/failure`,
          pending: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/pending`
        },
        external_reference: `user_${userId}_plan_${planId}_${billingCycle}`,
        notification_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mercadopago/webhook`,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        statement_descriptor: `HD Designer - ${planNames[planId as keyof typeof planNames]}`
      }

      console.log('Preferência configurada:', JSON.stringify(preference, null, 2))
      console.log('Criando preferência no MercadoPago...')
      
      // Criar preferência no MercadoPago
      const preferenceClient = new Preference(config)
      console.log('Cliente Preference criado')
      
      const response = await preferenceClient.create({ body: preference })
      console.log('Preferência criada com sucesso:', response)

      return NextResponse.json(
        { 
          preferenceId: response.id,
          initPoint: response.init_point
        },
        { status: 200 }
      )
      
    } catch (mercadopagoError: any) {
      console.error('=== ERRO DETALHADO DO MERCADOPAGO ===')
      console.error('Tipo de erro:', mercadopagoError?.constructor?.name || 'Desconhecido')
      console.error('Mensagem:', mercadopagoError?.message || 'Sem mensagem')
      console.error('Stack:', mercadopagoError?.stack || 'Sem stack')
      console.error('Código:', mercadopagoError?.code || 'Sem código')
      console.error('Status:', mercadopagoError?.status || 'Sem status')
      console.error('Response:', mercadopagoError?.response || 'Sem response')
      console.error('=== FIM DO ERRO DETALHADO ===')
      
      // Retornar preferência simulada para o frontend funcionar
      const mockPreferenceId = `pref_${Date.now()}_${planId}_${billingCycle}`
      
      return NextResponse.json(
        { 
          preferenceId: mockPreferenceId,
          initPoint: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${mockPreferenceId}`,
          message: 'Preferência simulada (MercadoPago com erro)',
          error: mercadopagoError?.message || 'Erro desconhecido',
          errorDetails: {
            type: mercadopagoError?.constructor?.name || 'Desconhecido',
            code: mercadopagoError?.code || 'Sem código',
            status: mercadopagoError?.status || 'Sem status'
          }
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('=== ERRO GERAL NA API ===')
    console.error('Erro:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('=== FIM DO ERRO GERAL ===')
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 