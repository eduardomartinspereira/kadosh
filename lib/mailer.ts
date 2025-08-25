/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/mailer.ts
import nodemailer from 'nodemailer';

// Configuração do transporter
const createTransporter = () => {
  // Suporte para variáveis antigas e novas
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = process.env.SMTP_PORT || '587';
  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
  const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || SMTP_USER;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[MAILER] Variáveis de email não configuradas');
    console.warn('[MAILER] Configure EMAIL_USER, EMAIL_PASS e EMAIL_FROM ou SMTP_USER, SMTP_PASS e MAIL_FROM');
    return null;
  }

  console.log('[MAILER] Configurando transporter com:', {
    host: SMTP_HOST,
    port: SMTP_PORT,
    user: SMTP_USER,
    from: MAIL_FROM
  });

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// Função para formatar valor em BRL
const formatBRL = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função principal para enviar email de confirmação de pagamento
export async function sendPaymentConfirmationEmail({
  to,
  name = 'Cliente',
  orderId,
  amount,
  description,
  receiptUrl,
}: {
  to: string;
  name?: string;
  orderId: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('[MAILER] Transporter não configurado');
      return false;
    }

    // Obter MAIL_FROM para usar no envio
    const MAIL_FROM = process.env.MAIL_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

    // Template HTML do email
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pagamento Confirmado</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #28a745; margin: 0;">✅ Pagamento Confirmado</h1>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;">Olá, <strong>${name}</strong>!</p>
            <p style="margin: 0 0 15px 0;">Seu pagamento foi processado com sucesso.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #495057;">Detalhes do Pedido</h3>
              <p style="margin: 5px 0;"><strong>Pedido:</strong> ${orderId}</p>
              <p style="margin: 5px 0;"><strong>Descrição:</strong> ${description}</p>
              <p style="margin: 5px 0;"><strong>Valor:</strong> ${formatBRL(amount)}</p>
            </div>
            
            ${receiptUrl ? `
              <div style="text-align: center; margin: 20px 0;">
                <a href="${receiptUrl}" target="_blank" style="background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  📄 Ver Comprovante
                </a>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; color: #6c757d; font-size: 14px;">
            <p style="margin: 0;">Se você não reconhece esta compra, entre em contato conosco.</p>
            <p style="margin: 10px 0 0 0;">Obrigado por escolher nossos serviços!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Versão texto simples
    const text = `
      Pagamento Confirmado ✅
      
      Olá, ${name}!
      
      Seu pagamento foi processado com sucesso.
      
      Detalhes do Pedido:
      - Pedido: ${orderId}
      - Descrição: ${description}
      - Valor: ${formatBRL(amount)}
      
      ${receiptUrl ? `Comprovante: ${receiptUrl}` : ''}
      
      Obrigado por escolher nossos serviços!
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: to,
      subject: `✅ Pagamento Confirmado - Pedido ${orderId}`,
      text: text,
      html: html,
    });

    console.log('[MAILER] ✅ Email enviado com sucesso:', {
      messageId: info.messageId,
      to: to,
      orderId: orderId,
    });

    return true;
  } catch (error) {
    console.error('[MAILER] ❌ Erro ao enviar email:', error);
    return false;
  }
}

// Função para testar a conexão SMTP
export async function testSMTPConnection() {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Transporter não configurado' };
    }

    await transporter.verify();
    return { success: true, message: 'Conexão SMTP OK' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
