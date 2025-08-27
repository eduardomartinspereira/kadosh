// app/api/pix-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '../../../lib/mercadopago';
import { sendPaymentConfirmationEmail } from '../../../lib/mailer';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, cpf, amount } = body ?? {};

    console.log('[PIX-API] Dados recebidos:', { name, email, cpf, amount });

    // validação básica
    if (!name || !email || !cpf || amount == null) {
      console.log('[PIX-API] Validação falhou - campos obrigatórios');
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const nAmount =
      typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    if (!Number.isFinite(nAmount) || nAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valor inválido' },
        { status: 400 }
      );
    }

    console.log('[PIX-API] Chamando serviço MP com:', { name: String(name), email: String(email), cpf: String(cpf), amount: nAmount });
    
    const pix = await mercadoPagoService.createPixPayment({
      name: String(name),
      email: String(email),
      cpf: String(cpf),
      amount: nAmount,
    });

    console.log('[PIX-API] PIX criado com sucesso:', pix);

    // === Salvar no banco ===
    try {
      // Buscar usuário pelo email ou CPF
      let user = await prisma.user.findUnique({
        where: { email: String(email) }
      });

      // Se não encontrar pelo email, tentar pelo CPF
      if (!user && cpf) {
        user = await prisma.user.findUnique({
          where: { cpf: String(cpf) }
        });
      }

      // Se ainda não encontrar, tentar buscar pelo email sem espaços
      if (!user) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: String(email).trim() },
              { email: String(email).toLowerCase() },
              { email: String(email).toLowerCase().trim() }
            ]
          }
        });
      }

      console.log('[PIX-API] 🔍 Buscando usuário:', { email, cpf });
      console.log('[PIX-API] 🔍 Usuário encontrado:', user ? `Sim (ID: ${user.id})` : 'Não');

      if (user) {
          // Determinar o plano baseado no valor
          let planSlug = 'monthly'; // padrão
          if (nAmount >= 290) { // R$ 290,00 ou mais = plano anual
            planSlug = 'yearly';
          }

          // Buscar o plano
          const plan = await prisma.plan.findUnique({
            where: { slug: planSlug }
          });

          if (plan) {
            // Criar Subscription (pendente)
            const subscription = await prisma.subscription.create({
              data: {
                userId: user.id,
                planId: plan.id,
                status: 'TRIALING', // PIX fica em trial até ser pago
                paymentMethod: 'PIX',
                provider: 'MERCADO_PAGO',
                providerSubscriptionId: pix.id?.toString(),
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
                status: 'PENDING', // PIX fica pendente até ser pago
                totalAmountCents: Math.round(nAmount * 100), // Converter para centavos
                currency: 'BRL',
                provider: 'MERCADO_PAGO',
                providerOrderId: pix.id?.toString(),
              }
          });

            // Criar Invoice
            const invoice = await prisma.invoice.create({
              data: {
                orderId: order.id,
                provider: 'MERCADO_PAGO',
                status: 'OPEN', // PIX fica aberto até ser pago
                providerInvoiceId: pix.id?.toString(),
              }
            });

            // Criar Payment (pendente)
            await prisma.payment.create({
              data: {
                invoiceId: invoice.id,
                provider: 'MERCADO_PAGO',
                method: 'PIX',
                status: 'PENDING', // PIX fica pendente até ser pago
                amountCents: Math.round(nAmount * 100),
                providerPaymentId: pix.id?.toString(),
                providerRaw: pix as any,
              }
            });

            console.log('[PIX-API] 💾 Dados salvos no banco com sucesso');
            console.log(`[PIX-API] 📅 Subscription criada: ${plan.name} (${planSlug})`);
          }
        }
    } catch (dbError) {
      console.error('[PIX-API] ❌ Erro ao salvar no banco:', dbError);
      // Não falha o PIX se o banco falhar
    }

    // === Enviar email de confirmação do PIX ===
    try {
      console.log('[PIX-API] 📧 Enviando email de confirmação PIX para:', email);
      
      const emailSent = await sendPaymentConfirmationEmail({
        to: String(email),
        name: String(name),
        orderId: `PIX_${pix.id || Date.now()}`,
        amount: nAmount,
        description: 'Pagamento PIX',
        receiptUrl: undefined, // PIX não tem comprovante de pagamento
      });
      
      if (emailSent) {
        console.log('[PIX-API] ✅ Email enviado com sucesso');
      } else {
        console.log('[PIX-API] ⚠️ Email não foi enviado (configuração SMTP ausente)');
      }
    } catch (emailError) {
      console.error('[PIX-API] ❌ Erro ao enviar email:', emailError);
      // Não falha o PIX se o email falhar
    }

    return NextResponse.json({ success: true, data: pix }, { status: 200 });
  } catch (err: any) {
    console.error('[PIX-API] erro', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Erro interno do servidor',
        details: err?.cause ?? null,
      },
      { status: 500 }
    );
  }
}
