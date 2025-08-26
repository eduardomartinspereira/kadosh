// app/api/test-rejection-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentRejectedEmail } from '../../../lib/mailer';

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

    console.log('[TEST-REJECTION-EMAIL] 📧 Testando envio de email de recusa para:', email);

    const emailSent = await sendPaymentRejectedEmail({
      to: email,
      name: name || 'Teste',
      orderId: 'TEST_REJECTION_123',
      amount: 150.00,
      description: 'Teste de Email de Recusa',
      rejectionReason: 'Saldo insuficiente (Teste)',
      statusDetail: 'cc_rejected_insufficient_amount',
    });

    if (emailSent) {
      console.log('[TEST-REJECTION-EMAIL] ✅ Email de recusa de teste enviado com sucesso');
      return NextResponse.json(
        { success: true, message: 'Email de recusa de teste enviado com sucesso' },
        { status: 200 }
      );
    } else {
      console.log('[TEST-REJECTION-EMAIL] ⚠️ Email de recusa não foi enviado (configuração SMTP ausente)');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email de recusa não foi enviado - verifique a configuração SMTP',
          smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || 
                          !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[TEST-REJECTION-EMAIL] ❌ Erro ao enviar email de recusa de teste:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao enviar email de recusa de teste',
        details: error?.message || 'Erro desconhecido',
        smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || 
                        !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      },
      { status: 500 }
    );
  }
}

