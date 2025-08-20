// app/api/mercadopago/webhook/route.ts
import { NextResponse } from 'next/server';
import { payments } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (secret) {
      const url = new URL(req.url);
      const q = url.searchParams.get('secret');
      const h = req.headers.get('x-mp-signature');
      if (q !== secret && h !== secret) {
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }
    }

    const data = await req.json();
    const id = data?.data?.id;
    if (!id) return NextResponse.json({ ok: true });

    const payment = await payments.get({ id });

    // TODO: atualizar sua base com payment.status (approved, pending, rejected, etc.)
    // ex: await db.payment.update(...)

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro webhook' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
