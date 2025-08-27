// app/api/mercadopago/card/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '../../../../lib/mercadopago';
import { sendPaymentConfirmationEmail } from '../../../../lib/mailer';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';

type CardBody = {
  token: string;
  issuer_id?: string;              // recebido do Brick, mas NÃO será enviado ao MP
  payment_method_id?: string;      // idem
  installments?: number | string;
  amount: number | string;
  description?: string;
  external_reference?: string;
  payer?: {
    name?: string;
    email?: string;
    identification?: { type?: 'CPF' | 'CNPJ' | string; number?: string };
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CardBody;

    // === validações básicas ===
    const token = String(body.token || '').trim();
    if (!token) {
      return NextResponse.json(
        { error: 'Token do cartão ausente' },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor (amount) inválido' },
        { status: 400 }
      );
    }

    const externalReference = String(
      body.external_reference ?? `order_${Date.now()}`
    );

    // normalização do pagador
    const payerName = String(body.payer?.name || '').trim() || 'Nome não informado';
    const payerEmail =
      String(body.payer?.email || '').trim() || 'email@nao.informado';

    const rawDoc = String(body.payer?.identification?.number || '').replace(/\D/g, '');
    const payerCpfCnpj = rawDoc || 'CPF não informado';

    const rawType = String(body.payer?.identification?.type || 'CPF').toUpperCase();
    const payerDocType = rawType === 'CNPJ' ? 'CNPJ' : 'CPF';

    const installments =
      body.installments !== undefined ? Number(body.installments) : 1;

    const description = body.description ?? 'Pagamento com cartão de crédito';

    // === Chamada ao serviço MP (sem issuer_id e sem payment_method_id) ===
    const mpData = await mercadoPagoService.createCardPayment({
      token,
      // issuer_id e payment_method_id são intencionalmente OMITIDOS
      installments,
      amount,
      description,
      external_reference: externalReference,
      payer: {
        email: payerEmail,
        identification: { type: payerDocType, number: payerCpfCnpj },
        name: payerName,
      },
    });

    // === Salvar no banco se o pagamento foi aprovado ===
    if (mpData.status === 'approved' || mpData.status === 'authorized') {
      try {
        // Buscar usuário pelo email ou CPF
        let user = await prisma.user.findUnique({
          where: { email: payerEmail }
        });

        // Se não encontrar pelo email, tentar pelo CPF
        if (!user && payerCpfCnpj !== 'CPF não informado') {
          user = await prisma.user.findUnique({
            where: { cpf: payerCpfCnpj }
          });
        }

        // Se ainda não encontrar, tentar buscar pelo email sem espaços
        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: payerEmail.trim() },
                { email: payerEmail.toLowerCase() },
                { email: payerEmail.toLowerCase().trim() }
              ]
            }
          });
        }

        console.log('[CARD-API] 🔍 Buscando usuário:', { payerEmail, payerCpfCnpj });
        console.log('[CARD-API] 🔍 Usuário encontrado:', user ? `Sim (ID: ${user.id})` : 'Não');

        if (user) {
          // Determinar o plano baseado no valor
          let planSlug = 'monthly'; // padrão
          if (amount >= 290) { // R$ 290,00 ou mais = plano anual
            planSlug = 'yearly';
          }

          // Buscar o plano
          const plan = await prisma.plan.findUnique({
            where: { slug: planSlug }
          });

          if (plan) {
            // Criar Subscription
            const subscription = await prisma.subscription.create({
              data: {
                userId: user.id,
                planId: plan.id,
                status: 'ACTIVE',
                paymentMethod: 'CARD',
                provider: 'MERCADO_PAGO',
                providerSubscriptionId: mpData.id?.toString(),
                startAt: new Date(),
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + (planSlug === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000), // 1 ano ou 1 mês
              }
            });

            // Criar Order
            const order = await prisma.order.create({
              data: {
                userId: user.id,
                subscriptionId: subscription.id, // Vincular à subscription
                type: 'SUBSCRIPTION_INITIAL',
                status: 'PAID',
                totalAmountCents: Math.round(amount * 100), // Converter para centavos
                currency: 'BRL',
                provider: 'MERCADO_PAGO',
                providerOrderId: mpData.id?.toString(),
              }
            });

            // Criar Invoice
            const invoice = await prisma.invoice.create({
              data: {
                orderId: order.id,
                provider: 'MERCADO_PAGO',
                status: 'PAID',
                providerInvoiceId: mpData.id?.toString(),
              }
            });

            // Criar Payment
            await prisma.payment.create({
              data: {
                invoiceId: invoice.id,
                provider: 'MERCADO_PAGO',
                method: 'CARD',
                status: 'APPROVED',
                amountCents: Math.round(amount * 100),
                paidAt: new Date(),
                providerPaymentId: mpData.id?.toString(),
                providerRaw: mpData as any,
              }
            });

            console.log('[CARD-API] 💾 Dados salvos no banco com sucesso');
            console.log(`[CARD-API] 📅 Subscription criada: ${plan.name} (${planSlug})`);
          }
        }
      } catch (dbError) {
        console.error('[CARD-API] ❌ Erro ao salvar no banco:', dbError);
        // Não falha o pagamento se o banco falhar
      }

      // === Enviar email de confirmação ===
      try {
        console.log('[CARD-API] 📧 Enviando email de confirmação para:', payerEmail);
        
        const emailSent = await sendPaymentConfirmationEmail({
          to: payerEmail,
          name: payerName,
          orderId: externalReference,
          amount: amount,
          description: description,
          receiptUrl: mpData.point_of_interaction?.transaction_data?.ticket_url,
        });
        
        if (emailSent) {
          console.log('[CARD-API] ✅ Email enviado com sucesso');
        } else {
          console.log('[CARD-API] ⚠️ Email não foi enviado (configuração SMTP ausente)');
        }
      } catch (emailError) {
        console.error('[CARD-API] ❌ Erro ao enviar email:', emailError);
        // Não falha o pagamento se o email falhar
      }
    }

    // retorna o objeto do MP (id, status, etc.)
    return NextResponse.json(mpData, { status: 200 });
  } catch (e: any) {
    console.error('[CARD-API] ❌ Erro ao processar pagamento:', e);
    return NextResponse.json(
      {
        error: 'Erro ao processar pagamento',
        details: e?.message ?? 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
