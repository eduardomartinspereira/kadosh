import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { payments } from '@/lib/mp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const method = body.method as 'pix'|'boleto'|'card';

  try {
    if (method === 'pix') {
      const expires = body.expiresInMinutes ?? 60 * 24;
      const date_of_expiration = new Date(Date.now() + expires * 60_000).toISOString();

      const res = await payments.create({
        body: {
          transaction_amount: Number(body.amount),
          description: body.description ?? 'Pagamento Pix',
          payment_method_id: 'pix',
          date_of_expiration,
          payer: body.payer,
          notification_url: process.env.MP_NOTIFICATION_URL, // webhook por pagamento (opcional)
        },
        requestOptions: { idempotencyKey: crypto.randomUUID() },
      });

      const t = (res as any)?.point_of_interaction?.transaction_data;
      return NextResponse.json({
        id: res.id,
        status: res.status,
        pix: { qr_code: t?.qr_code, qr_code_base64: t?.qr_code_base64, ticket_url: t?.ticket_url },
      });
    }

    if (method === 'boleto') {
      const res = await payments.create({
        body: {
          transaction_amount: Number(body.amount),
          description: body.description ?? 'Boleto bancário',
          payment_method_id: 'bolbradesco',
          date_of_expiration: body.dueDate, // ISO opcional
          payer: body.payer,
          notification_url: process.env.MP_NOTIFICATION_URL,
        },
        requestOptions: { idempotencyKey: crypto.randomUUID() },
      });

      const link = (res as any)?.transaction_details?.external_resource_url
        ?? (res as any)?.point_of_interaction?.transaction_data?.ticket_url;

      return NextResponse.json({ id: res.id, status: res.status, boleto: { external_resource_url: link } });
    }

    if (method === 'card') {
      const res = await payments.create({
        body: {
          transaction_amount: Number(body.amount),
          description: body.description ?? 'Pagamento com cartão',
          token: body.token,
          installments: body.installments ?? 1,
          payment_method_id: body.payment_method_id,
          issuer_id: body.issuer_id,
          payer: body.payer,
          notification_url: process.env.MP_NOTIFICATION_URL,
        },
        requestOptions: { idempotencyKey: crypto.randomUUID() },
      });

      return NextResponse.json({ id: res.id, status: res.status, status_detail: (res as any).status_detail });
    }

    return NextResponse.json({ error: 'Método inválido' }, { status: 400 });
  } catch (e: any) {
    console.error('create payment error', e);
    return NextResponse.json({ error: e?.message ?? 'Erro' }, { status: 400 });
  }
}
