/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '../../../lib/mercadopago';
import { sendPaymentConfirmationEmail } from '../../../lib/mailer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
  
// --- Utils -------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidEmail(email?: string | null) {
  if (!email) return false;
  const e = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  // evita placeholders
  if (e.endsWith('@example.com')) return false;
  if (e === 'cliente@example.com' || e === 'cliente@exemplo.com') return false;
  return true;
}

function pickBuyerEmail(details: any): string | undefined {
  const a =
    details?.metadata?.buyer_email ||
    details?.additional_info?.payer?.email ||
    details?.payer?.email;
  return isValidEmail(a) ? a : undefined;
}

function pickName(details: any): string | undefined {
  const fromPayer =
    [details?.payer?.first_name, details?.payer?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;
  return fromPayer || details?.metadata?.customer_name || undefined;
}

function pickItems(details: any) {
  const arr = Array.isArray(details?.additional_info?.items)
    ? details.additional_info.items
    : [];
  return arr.map((it: any) => ({
    title: it.title,
    quantity: Number(it.quantity || 1),
    unit_price: Number(it.unit_price || it.unitPrice || 0),
  }));
}

// Idempotência simples para evitar e-mail duplicado em reentregas rápidas
const sentMap = new Map<string, number>(); // key: paymentId, value: timestamp
function markSent(id: string) {
  sentMap.set(id, Date.now());
}
function wasRecentlySent(id: string, ms = 5 * 60 * 1000) {
  const t = sentMap.get(id);
  return t ? Date.now() - t < ms : false;
}

// --- Handlers ----------------------------------------------------------------
export async function POST(req: NextRequest) {
  let body: any = null;
  try { body = await req.json(); } catch { body = null; }

  const url = new URL(req.url);
  const type =
    body?.type ||
    body?.action ||
    url.searchParams.get('type') ||
    url.searchParams.get('topic') ||
    url.searchParams.get('action') ||
    '';

  const paymentId =
    body?.data?.id ||
    url.searchParams.get('data.id') ||
    url.searchParams.get('id') ||
    null;

  console.log('[WEBHOOK] ▶️ recebido', { type, paymentId, qs: Object.fromEntries(url.searchParams.entries()) });

  // Ignora eventos que não são de pagamento
  const isPayment = (typeof type === 'string' && type.includes('payment')) || !!paymentId;
  if (!isPayment) {
    return NextResponse.json({ ok: true, message: 'ignorado (não é payment)' }, { status: 200 });
  }
  if (!paymentId) {
    return NextResponse.json({ ok: false, message: 'paymentId ausente' }, { status: 200 });
  }

  // Busca detalhes com backoff leve (propagação do MP pode demorar alguns ms)
  const maxAttempts = 3;
  let details: any = null;
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      details = await mercadoPagoService.getPaymentDetails(paymentId);
      if (details) break;
    } catch (err) {
      console.warn(`[WEBHOOK] tentativa ${i} falhou`, err);
      if (i < maxAttempts) await sleep(300 * i);
    }
  }
  if (!details) {
    console.error('[WEBHOOK] ❌ sem detalhes do pagamento', paymentId);
    return NextResponse.json({ ok: false, message: 'sem detalhes' }, { status: 200 });
  }

  console.log('[WEBHOOK] ℹ️ detalhes', {
    id: details.id,
    status: details.status,
    status_detail: (details as any).status_detail,
    external_reference: details.external_reference,
  });

  // === SALVAR/ATUALIZAR NO BANCO DE DADOS ===
  let dbPayment: any = null;
  let webhookEvent: any = null;
  
  try {
    // Por enquanto, vamos apenas logar os dados sem salvar no banco
    console.log('[WEBHOOK] 📊 Dados do pagamento recebidos:', {
      id: details.id,
      status: details.status,
      external_reference: details.external_reference,
      transaction_amount: details.transaction_amount,
      payer: details.payer,
    });
    
    // TODO: Implementar salvamento no banco quando o schema estiver compatível
    
  } catch (dbError) {
    console.error('[WEBHOOK] ❌ Erro ao processar dados:', dbError);
    // Continuar processamento mesmo com erro
  }

  // Atualize seu banco aqui (pelo external_reference / id), se desejar.

  // Envia e-mail somente quando aprovado
  if (details.status === 'approved') {
    if (wasRecentlySent(String(details.id))) {
      console.log('[WEBHOOK] ⏭️ e-mail já enviado recentemente, ignorando duplicado');
    } else {
      const to = pickBuyerEmail(details);
      const name = pickName(details);
      const orderId =
        details?.external_reference ||
        details?.metadata?.order_id ||
        String(details.id);
      const items = pickItems(details);
      const amount = Number(details?.transaction_amount || 0);
      const receiptUrl = details?.point_of_interaction?.transaction_data?.ticket_url ?? undefined;

      console.log('[WEBHOOK] 📧 preparando e-mail', { to, orderId, amount, items: items.length });

      if (to) {
        try {
          const emailSent = await sendPaymentConfirmationEmail({
            to,
            name,
            orderId,
            amount,
            description: items.length > 0 ? items[0].title : 'Pagamento',
            receiptUrl,
          });
          
          if (emailSent) {
            markSent(String(details.id));
            console.log('[WEBHOOK] ✅ e-mail enviado', {
              to,
              orderId,
            });
          } else {
            console.log('[WEBHOOK] ⚠️ Email não foi enviado (configuração SMTP ausente)');
          }
        } catch (err) {
          console.error('[WEBHOOK] ❌ falha ao enviar e-mail', err);
        }
      } else {
        console.warn('[WEBHOOK] ⚠️ e-mail do comprador não encontrado/é placeholder — não enviado');
      }
    }
  } else if (details.status === 'rejected') {
    console.log('[WEBHOOK] ❌ pagamento rejeitado', {
      id: details.id,
      status_detail: (details as any).status_detail,
    });
  } else if (details.status === 'in_process') {
    console.log('[WEBHOOK] ⏳ pagamento em análise/processamento');
  } else if (details.status === 'cancelled') {
    console.log('[WEBHOOK] ⏹️ pagamento cancelado');
  } else {
    console.log('[WEBHOOK] 📋 status:', details.status);
  }

  // Marcar webhook como processado
  console.log('[WEBHOOK] ✅ Webhook processado com sucesso');

  return NextResponse.json(
    {
      ok: true,
      paymentId,
      status: details.status,
      external_reference: details.external_reference,
      processed_at: new Date().toISOString(),
      saved_to_db: !!dbPayment,
    },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return NextResponse.json({
    status: 'ok',
    ts: new Date().toISOString(),
    echo: Object.fromEntries(searchParams.entries()),
  });
}
