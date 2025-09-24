// app/api/mercadopago/card/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mercadoPagoService } from "../../../../lib/mercadopago";
import {
  sendPaymentConfirmationEmail,
  sendPaymentRejectedEmail,
} from "../../../../lib/mailer";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

/** ===================== helpers ===================== */

// Traduz motivos de recusa do MP
function getRejectionReason(statusDetail: string): string {
  const rejectionReasons: Record<string, string> = {
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

// Mapeia status do MP → enums do seu banco
function mapStatuses(mpStatus: string): {
  payment: "PENDING" | "APPROVED" | "DECLINED" | "REFUNDED" | "CHARGED_BACK";
  invoice: "OPEN" | "PAID" | "VOID" | "CANCELED";
  order: "PENDING" | "PAID" | "CANCELED" | "REFUNDED";
  isPaid: boolean;
} {
  switch ((mpStatus || "").toLowerCase()) {
    case "approved":
    case "authorized":
      return {
        payment: "APPROVED",
        invoice: "PAID",
        order: "PAID",
        isPaid: true,
      };
    case "in_process":
    case "pending":
      return {
        payment: "PENDING",
        invoice: "OPEN",
        order: "PENDING",
        isPaid: false,
      };
    case "rejected":
      return {
        payment: "DECLINED",
        invoice: "OPEN",
        order: "PENDING",
        isPaid: false,
      };
    case "refunded":
      return {
        payment: "REFUNDED",
        invoice: "VOID",
        order: "REFUNDED",
        isPaid: false,
      };
    case "charged_back":
      return {
        payment: "CHARGED_BACK",
        invoice: "VOID",
        order: "REFUNDED",
        isPaid: false,
      };
    default:
      return {
        payment: "PENDING",
        invoice: "OPEN",
        order: "PENDING",
        isPaid: false,
      };
  }
}

// Upsert de usuário (sem plano/assinatura)
async function ensureUser(
  payerEmail: string,
  payerCpfCnpj?: string,
  payerName?: string
) {
  const email = payerEmail.trim().toLowerCase();
  const cpf = (payerCpfCnpj || "").replace(/\D/g, "") || null;

  const user = await prisma.user.upsert({
    where: { email },
    update: cpf ? { cpf } : {},
    create: {
      email,
      name: payerName || null,
      cpf: cpf || null,
      role: "CUSTOMER",
    },
  });

  return user;
}

// Persiste SEMPRE Order → Invoice → Payment (sem Subscription/Plan)
async function persistCardPayment(args: {
  mpData: any;
  amount: number;
  description: string;
  externalReference: string;
  payerEmail: string;
  payerName?: string;
  payerCpfCnpj?: string;
}) {
  const {
    mpData,
    amount,
    description,
    externalReference,
    payerEmail,
    payerName,
    payerCpfCnpj,
  } = args;

  const user = await ensureUser(payerEmail, payerCpfCnpj, payerName);

  const providerPaymentId = mpData?.id ? String(mpData.id) : undefined;
  const provider = "MERCADO_PAGO" as const;

  const {
    payment: paymentStatus,
    invoice: invoiceStatus,
    order: orderStatus,
    isPaid,
  } = mapStatuses(mpData?.status);

  const now = new Date();
  const cents = Math.round(Number(amount) * 100);

  return await prisma.$transaction(async (tx) => {
    // Order (ONE_OFF, sem subscription e sem items)
    const order = await tx.order.create({
      data: {
        userId: user.id,
        subscriptionId: null,
        type: "ONE_OFF",
        status: orderStatus,
        totalAmountCents: cents,
        currency: "BRL",
        provider,
        providerOrderId: providerPaymentId,
      },
    });

    // Invoice
    const invoice = await tx.invoice.create({
      data: {
        orderId: order.id,
        provider,
        status: invoiceStatus,
        providerInvoiceId: providerPaymentId,
        pdfUrl:
          mpData?.point_of_interaction?.transaction_data?.ticket_url || null,
      },
    });

    // Payment
    const payment = await tx.payment.create({
      data: {
        invoiceId: invoice.id,
        provider,
        method: "CARD",
        status: paymentStatus,
        amountCents: cents,
        paidAt: isPaid ? now : null,
        providerPaymentId,
        providerRaw: mpData as any,
      },
    });

    return { user, order, invoice, payment };
  });
}

/** ===================== types ===================== */

type CardBody = {
  token: string;
  issuer_id?: string; // recebido do Brick, não enviamos ao MP
  payment_method_id?: string; // idem
  installments?: number | string;
  amount: number | string;
  description?: string;
  external_reference?: string;
  payer?: {
    name?: string;
    email?: string;
    identification?: { type?: "CPF" | "CNPJ" | string; number?: string };
  };
};

/** ===================== handler ===================== */

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CardBody;

    // validações
    const token = String(body.token || "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Token do cartão ausente" },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Valor (amount) inválido" },
        { status: 400 }
      );
    }

    const externalReference = String(
      body.external_reference ?? `order_${Date.now()}`
    );
    const payerName =
      String(body.payer?.name || "").trim() || "Nome não informado";
    const payerEmail =
      String(body.payer?.email || "")
        .trim()
        .toLowerCase() || "email@nao.informado";
    const rawDoc = String(body.payer?.identification?.number || "").replace(
      /\D/g,
      ""
    );
    const payerCpfCnpj = rawDoc || "CPF não informado";
    const rawType = String(
      body.payer?.identification?.type || "CPF"
    ).toUpperCase();
    const payerDocType = rawType === "CNPJ" ? "CNPJ" : "CPF";
    const installments =
      body.installments !== undefined ? Number(body.installments) : 1;
    const description = body.description ?? "Pagamento com cartão de crédito";

    // cria pagamento no MP (sem issuer_id / payment_method_id)
    const mpData = await mercadoPagoService.createCardPayment({
      token,
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

    console.log("[CARD-API] 📊 Status do pagamento:", {
      status: mpData?.status,
      id: mpData?.id,
      external_reference: externalReference,
    });

    // SEMPRE persistir no banco (order/invoice/payment)
    try {
      const persisted = await persistCardPayment({
        mpData,
        amount,
        description,
        externalReference,
        payerEmail,
        payerName,
        payerCpfCnpj,
      });

      console.log("[CARD-API] 💾 Persistência OK:", {
        orderId: persisted.order.id,
        invoiceId: persisted.invoice.id,
        paymentId: persisted.payment.id,
      });
    } catch (dbError) {
      console.error("[CARD-API] ❌ Erro ao persistir no banco:", dbError);
      // Continuamos retornando mpData para não perder a resposta do MP
    }

    // e-mails
    if (mpData?.status === "approved" || mpData?.status === "authorized") {
      try {
        console.log(
          "[CARD-API] 📧 Enviando email de confirmação para:",
          payerEmail
        );
        const emailSent = await sendPaymentConfirmationEmail({
          to: payerEmail,
          name: payerName,
          orderId: externalReference,
          amount,
          description,
          receiptUrl:
            mpData?.point_of_interaction?.transaction_data?.ticket_url,
        });
        console.log(
          emailSent
            ? "[CARD-API] ✅ Email enviado"
            : "[CARD-API] ⚠️ SMTP não configurado"
        );
      } catch (emailError) {
        console.error(
          "[CARD-API] ❌ Erro ao enviar email de confirmação:",
          emailError
        );
      }
    }

    if (mpData?.status === "rejected") {
      try {
        const rejectionReason = getRejectionReason(
          mpData?.status_detail || "cc_rejected_other_reason"
        );
        await sendPaymentRejectedEmail({
          to: payerEmail,
          name: payerName,
          orderId: externalReference,
          amount,
          description,
          rejectionReason,
          statusDetail: mpData?.status_detail || "Motivo não especificado",
        });
      } catch (emailError) {
        console.error(
          "[CARD-API] ❌ Erro ao enviar email de recusa:",
          emailError
        );
      }
    }

    // responde com o objeto do MP
    return NextResponse.json(mpData, { status: 200 });
  } catch (e: any) {
    console.error("[CARD-API] ❌ Erro ao processar pagamento:", e);
    return NextResponse.json(
      {
        error: "Erro ao processar pagamento",
        details: e?.message ?? "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
