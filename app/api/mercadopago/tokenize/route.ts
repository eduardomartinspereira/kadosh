import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { card_number, security_code, expiration_month, expiration_year, cardholder } = body;

        // Validações básicas
        if (!card_number || !security_code || !expiration_month || !expiration_year || !cardholder) {
            return NextResponse.json(
                { error: 'Dados do cartão incompletos' },
                { status: 400 }
            );
        }

        // Chama a API do Mercado Pago para gerar o token
        const response = await fetch('https://api.mercadopago.com/v1/card_tokens', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                card_number,
                security_code,
                expiration_month,
                expiration_year,
                cardholder,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na API do MP:', errorData);
            return NextResponse.json(
                { error: 'Erro ao gerar token do cartão', details: errorData },
                { status: response.status }
            );
        }

        const tokenData = await response.json();
        console.log('Token gerado com sucesso:', tokenData.id);

        return NextResponse.json(tokenData, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao tokenizar cartão:', error);
        return NextResponse.json(
            { error: 'Erro interno ao tokenizar cartão', details: error.message },
            { status: 500 }
        );
    }
}
