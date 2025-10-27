/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mercadoPagoService } from "../../../lib/mercadopago";
import {
  sendPaymentConfirmationEmail,
  sendPaymentRejectedEmail,
} from "../../../lib/mailer";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Função para traduzir códigos de erro do Mercado Pago
function getRejectionReason(statusDetail: string): string {
  const rejectionReasons: { [key: string]: string } = {
    cc_rejected_bad_filled_date: "Data de validade incorreta",
    cc_rejected_bad_filled_other: "Dados do cartão incorretos",
    cc_rejected_bad_filled_security_code: "Código de segurança incorreto",
    cc_rejected_blacklist: "Cartão bloqueado",
    cc_rejected_call_for_authorize: "Cartão requer autorização",
    cc_rejected_card_disabled: "Cartão desabilitado",
    cc_rejected_card_error: "Erro no cartão",
    cc_rejected_duplicated_payment: "Pagamento duplicado",
    cc_rejected_high_risk: "Pagamento rejeitado por risco",
    cc_rejected_insufficient_amount: "Saldo insuficiente",
    cc_rejected_invalid_installments: "Parcelamento inválido",
    cc_rejected_max_attempts: "Máximo de tentativas excedido",
    cc_rejected_other_reason: "Cartão recusado",
    cc_rejected_bad_filled_card_number: "Número do cartão incorreto",
  };

  return rejectionReasons[statusDetail] || "Pagamento recusado pelo banco";
}

// --- Utils -------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isValidEmail(email?: string | null) {
  if (!email) return false;
  const e = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  // evita placeholders
  if (e.endsWith("@example.com")) return false;
  if (e === "cliente@example.com" || e === "cliente@exemplo.com") return false;
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
      .join(" ")
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
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const url = new URL(req.url);
  const type =
    body?.type ||
    body?.action ||
    url.searchParams.get("type") ||
    url.searchParams.get("topic") ||
    url.searchParams.get("action") ||
    "";

  const paymentId =
    body?.data?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    null;

  console.log("[WEBHOOK] ▶️ recebido", {
    type,
    paymentId,
    qs: Object.fromEntries(url.searchParams.entries()),
  });

  // Ignora eventos que não são de pagamento
  const isPayment =
    (typeof type === "string" && type.includes("payment")) || !!paymentId;
  if (!isPayment) {
    return NextResponse.json(
      { ok: true, message: "ignorado (não é payment)" },
      { status: 200 }
    );
  }
  if (!paymentId) {
    return NextResponse.json(
      { ok: false, message: "paymentId ausente" },
      { status: 200 }
    );
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
    console.error("[WEBHOOK] ❌ sem detalhes do pagamento", paymentId);
    return NextResponse.json(
      { ok: false, message: "sem detalhes" },
      { status: 200 }
    );
  }

  console.log("[WEBHOOK] ℹ️ detalhes", {
    id: details.id,
    status: details.status,
    status_detail: (details as any).status_detail,
    external_reference: details.external_reference,
  });

  // === SALVAR/ATUALIZAR NO BANCO DE DADOS ===
  let dbPayment: any = null;
  let webhookEvent: any = null;

  try {
    console.log("[WEBHOOK] 📊 Dados do pagamento recebidos:", {
      id: details.id,
      status: details.status,
      external_reference: details.external_reference,
      transaction_amount: details.transaction_amount,
      payer: details.payer,
    });

    // Buscar pagamento existente pelo providerPaymentId
    const existingPayment = await prisma.payment.findFirst({
      where: {
        providerPaymentId: String(details.id),
      },
    });

    if (existingPayment) {
      // Atualizar pagamento existente
      console.log(
        "[WEBHOOK] 🔄 Atualizando pagamento existente:",
        existingPayment.id
      );

      dbPayment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: details.status.toUpperCase() as any,
          paidAt: details.status === "approved" ? new Date() : null,
          providerPaymentId: String(details.id),
          amountCents: Math.round((details.transaction_amount || 0) * 100),
          providerRaw: details,
        },
      });

      console.log("[WEBHOOK] ✅ Pagamento atualizado:", {
        id: dbPayment.id,
        status: dbPayment.status,
        paidAt: dbPayment.paidAt,
      });

      // Se aprovado, também atualizar Invoice, Order e Subscription
      if (details.status === "approved") {
        try {
          const invoice = await prisma.invoice.update({
            where: { id: dbPayment.invoiceId },
            data: { status: "PAID" },
          });

          const order = await prisma.order.update({
            where: { id: invoice.orderId },
            data: { status: "PAID" },
          });

          if (order.subscriptionId) {
            await prisma.subscription.update({
              where: { id: order.subscriptionId },
              data: { status: "ACTIVE" },
            });
          }

          console.log(
            "[WEBHOOK] ✅ Entidades vinculadas atualizadas (invoice, order, subscription)"
          );
        } catch (linkErr) {
          console.error(
            "[WEBHOOK] ⚠️ Falha ao atualizar entidades vinculadas:",
            linkErr
          );
        }
      }
    } else {
      // Para criar um novo pagamento, precisamos de um invoiceId
      // Por enquanto, vamos apenas logar que não conseguimos criar
      console.log(
        "[WEBHOOK] ⚠️ Pagamento não encontrado e não é possível criar sem invoiceId"
      );
      console.log("[WEBHOOK] 📊 Dados do pagamento:", {
        id: details.id,
        status: details.status,
        external_reference: details.external_reference,
        transaction_amount: details.transaction_amount,
      });
    }
  } catch (dbError) {
    console.error("[WEBHOOK] ❌ Erro ao processar dados:", dbError);
    // Continuar processamento mesmo com erro
  }

  // Atualize seu banco aqui (pelo external_reference / id), se desejar.

  // Envia e-mail somente quando aprovado
  if (details.status === "approved") {
    if (wasRecentlySent(String(details.id))) {
      console.log(
        "[WEBHOOK] ⏭️ e-mail já enviado recentemente, ignorando duplicado"
      );
    } else {
      const to = pickBuyerEmail(details);
      const name = pickName(details);
      const orderId =
        details?.external_reference ||
        details?.metadata?.order_id ||
        String(details.id);
      const items = pickItems(details);
      const amount = Number(details?.transaction_amount || 0);
      const receiptUrl =
        details?.point_of_interaction?.transaction_data?.ticket_url ??
        undefined;

      console.log("[WEBHOOK] 📧 preparando e-mail", {
        to,
        orderId,
        amount,
        items: items.length,
      });

      if (to) {
        try {
          const emailSent = await sendPaymentConfirmationEmail({
            to,
            name,
            orderId,
            amount,
            description: items.length > 0 ? items[0].title : "Pagamento",
            receiptUrl,
          });

          if (emailSent) {
            markSent(String(details.id));
            console.log("[WEBHOOK] ✅ e-mail enviado", {
              to,
              orderId,
            });
          } else {
            console.log(
              "[WEBHOOK] ⚠️ Email não foi enviado (configuração SMTP ausente)"
            );
          }
        } catch (err) {
          console.error("[WEBHOOK] ❌ falha ao enviar e-mail", err);
        }
      } else {
        console.warn(
          "[WEBHOOK] ⚠️ e-mail do comprador não encontrado/é placeholder — não enviado"
        );
      }
    }
  }

  // === Enviar email se o pagamento foi recusado ===
  if (details.status === "rejected") {
    if (wasRecentlySent(String(details.id))) {
      console.log(
        "[WEBHOOK] ⏭️ e-mail de recusa já enviado recentemente, ignorando duplicado"
      );
    } else {
      const to = details.payer?.email;
      const name = details.payer?.name || "Cliente";
      const orderId = details.external_reference || String(details.id);
      const amount = details.transaction_amount || 0;
      const items = details.additional_info?.items || [];
      const rejectionReason = getRejectionReason(
        details.status_detail || "cc_rejected_other_reason"
      );

      if (to) {
        try {
          const emailSent = await sendPaymentRejectedEmail({
            to,
            name,
            orderId,
            amount,
            description: items.length > 0 ? items[0].title : "Pagamento",
            rejectionReason,
            statusDetail: details.status_detail,
          });

          if (emailSent) {
            markSent(String(details.id));
            console.log("[WEBHOOK] ✅ e-mail de recusa enviado", {
              to,
              orderId,
              rejectionReason,
            });
          } else {
            console.log(
              "[WEBHOOK] ⚠️ Email de recusa não foi enviado (configuração SMTP ausente)"
            );
          }
        } catch (err) {
          console.error("[WEBHOOK] ❌ falha ao enviar e-mail de recusa", err);
        }
      } else {
        console.warn(
          "[WEBHOOK] ⚠️ e-mail do comprador não encontrado/é placeholder — email de recusa não enviado"
        );
      }
    }
  }

  // Marcar webhook como processado
  console.log("[WEBHOOK] ✅ Webhook processado com sucesso");

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
    status: "ok",
    ts: new Date().toISOString(),
    echo: Object.fromEntries(searchParams.entries()),
  });
}
