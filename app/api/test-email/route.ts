// app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentConfirmationEmail } from '../../../lib/mailer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('[TEST-EMAIL] 📧 Testando envio de email para:', email);

    const emailSent = await sendPaymentConfirmationEmail({
      to: email,
      name: name || 'Teste',
      orderId: 'TEST_ORDER_123',
      amount: 100.00,
      description: 'Teste de Email',
      receiptUrl: undefined,
    });

    if (emailSent) {
      console.log('[TEST-EMAIL] ✅ Email de teste enviado com sucesso');
      return NextResponse.json(
        { success: true, message: 'Email de teste enviado com sucesso' },
        { status: 200 }
      );
    } else {
      console.log('[TEST-EMAIL] ⚠️ Email não foi enviado (configuração SMTP ausente)');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email não foi enviado - verifique a configuração SMTP',
          smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || 
                          !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[TEST-EMAIL] ❌ Erro ao enviar email de teste:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao enviar email de teste',
        details: error?.message || 'Erro desconhecido',
        smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || 
                        !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      },
      { status: 500 }
    );
  }
}
