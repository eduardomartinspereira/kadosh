// app/api/mercadopago/payments/route.ts
import { NextResponse } from 'next/server';
import { payments } from '@/lib/mercadopago';

type Body = {
  amount: number;
  description: string;
  payment_method: 'card' | 'pix' | 'boleto';
  // Cartão
  token?: string;                    // card token criado no frontend
  installments?: number;             // parcelas
  issuer_id?: string | number;       // opcional
  // Payer (comum)
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
    identification?: { type: string; number: string }; // ex: { type: 'CPF', number: '12345678909' }
    address?: any;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body?.amount || !body?.description || !body?.payment_method || !body?.payer) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    const basePayload: any = {
      transaction_amount: Number(body.amount),
      description: body.description,
      payer: body.payer,
    };

    if (body.payment_method === 'card') {
      if (!body.token) {
        return NextResponse.json({ error: 'Token do cartão ausente' }, { status: 400 });
      }
      const payload = {
        ...basePayload,
        token: body.token,
        installments: body.installments ? Number(body.installments) : 1,
        payment_method_id: 'visa', // DICA: você pode detectar pela BIN e setar dinamicamente; ou deixar sem e o MP resolve
        issuer_id: body.issuer_id ?? undefined,
      };

      const payment = await payments.create({ body: payload });
      
      // Retornar dados no formato que o frontend espera
      return NextResponse.json({
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        // Campos adicionais para compatibilidade
        point_of_interaction: payment.point_of_interaction,
        transaction_details: payment.transaction_details
      }, { status: 200 });
    }

    if (body.payment_method === 'pix') {
      const payload = {
        ...basePayload,
        payment_method_id: 'pix',
      };
      const payment = await payments.create({ body: payload });
      
      // Retornar dados no formato que o frontend espera
      return NextResponse.json({
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        point_of_interaction: payment.point_of_interaction,
        transaction_details: payment.transaction_details
      }, { status: 200 });
    }

    if (body.payment_method === 'boleto') {
      const payload = {
        ...basePayload,
        payment_method_id: 'bolbradesco', // ou outro banco suportado
      };
      const payment = await payments.create({ body: payload });
      
      // Retornar dados no formato que o frontend espera
      return NextResponse.json({
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        point_of_interaction: payment.point_of_interaction,
        transaction_details: payment.transaction_details
      }, { status: 200 });
    }

    return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 });
  } catch (err: any) {
    console.error('Erro na API de pagamentos:', err);
    const status = err?.status || 500;
    return NextResponse.json(
      {
        error: 'Erro ao criar pagamento',
        details: err?.message || err,
      },
      { status },
    );
  }
}
