// app/api/test-smtp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { testSMTPConnection } from '../../../lib/mailer';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    console.log('[TEST-SMTP] 🔍 Testando conexão SMTP...');
    
    const result = await testSMTPConnection();
    
    console.log('[TEST-SMTP] Resultado:', result);
    
    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || 
                          !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[TEST-SMTP] ❌ Erro ao testar SMTP:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno ao testar SMTP',
        details: error?.message || 'Erro desconhecido',
        smtpConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || 
                        !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      },
      { status: 500 }
    );
  }
}
