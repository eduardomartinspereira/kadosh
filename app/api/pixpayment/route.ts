// app/api/pix-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mercadoPagoService } from '../../../lib/mercadopago';

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
