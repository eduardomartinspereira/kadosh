// app/api/mercadopago/card/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '../../../../lib/mercadopago';
import { sendPaymentConfirmationEmail, sendPaymentRejectedEmail } from '../../../../lib/mailer';

export const runtime = 'nodejs';

// Função para traduzir códigos de erro do Mercado Pago
function getRejectionReason(statusDetail: string): string {
  const rejectionReasons: { [key: string]: string } = {
    'cc_rejected_bad_filled_date': 'Data de validade incorreta',
    'cc_rejected_bad_filled_other': 'Dados do cartão incorretos',
    'cc_rejected_bad_filled_security_code': 'Código de segurança incorreto',
    'cc_rejected_blacklist': 'Cartão bloqueado',
    'cc_rejected_call_for_authorize': 'Cartão requer autorização',
    'cc_rejected_card_disabled': 'Cartão desabilitado',
    'cc_rejected_card_error': 'Erro no cartão',
    'cc_rejected_duplicated_payment': 'Pagamento duplicado',
    'cc_rejected_high_risk': 'Pagamento rejeitado por risco',
    'cc_rejected_insufficient_amount': 'Saldo insuficiente',
    'cc_rejected_invalid_installments': 'Parcelamento inválido',
    'cc_rejected_max_attempts': 'Máximo de tentativas excedido',
    'cc_rejected_other_reason': 'Cartão recusado',
    'cc_rejected_bad_filled_card_number': 'Número do cartão incorreto',
  };

  return rejectionReasons[statusDetail] || 'Pagamento recusado pelo banco';
}

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

    // === Enviar email se o pagamento foi aprovado ===
    if (mpData.status === 'approved' || mpData.status === 'authorized') {
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

    // === Enviar email se o pagamento foi recusado ===
    if (mpData.status === 'rejected') {
      try {
        console.log('[CARD-API] 📧 Enviando email de recusa para:', payerEmail);
        
        // Traduzir o motivo da recusa
        const rejectionReason = getRejectionReason(mpData.status_detail || 'cc_rejected_other_reason');
        
        const emailSent = await sendPaymentRejectedEmail({
          to: payerEmail,
          name: payerName,
          orderId: externalReference,
          amount: amount,
          description: description,
          rejectionReason: rejectionReason,
          statusDetail: mpData.status_detail || 'Motivo não especificado',
        });
        
        if (emailSent) {
          console.log('[CARD-API] ✅ Email de recusa enviado com sucesso');
        } else {
          console.log('[CARD-API] ⚠️ Email de recusa não foi enviado (configuração SMTP ausente)');
        }
      } catch (emailError) {
        console.error('[CARD-API] ❌ Erro ao enviar email de recusa:', emailError);
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
