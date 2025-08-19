'use client';
import { useEffect } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

export default function CardCheckout() {
  useEffect(() => {
    // precisa estar definida no .env como NEXT_PUBLIC_MP_PUBLIC_KEY
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' });
  }, []);

  const amount = 79.9; // valor da compra

  return (
    <div className="max-w-md mx-auto p-4">
      <CardPayment
        initialization={{ amount }}
        customization={{
          visual: { style: { theme: 'dark' } }, // opcional
        }}
        onSubmit={async ({ selectedPaymentMethod, formData }) => {
          try {
            const payer = {
              email: formData.payer?.email,
              first_name: formData.payer?.firstName,
              last_name: formData.payer?.lastName,
              identification: formData.payer?.identification, // { type:'CPF', number:'...' }
            };

            const resp = await fetch('/api/mercadopago/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                method: 'card',
                amount,
                token: formData.token, // token seguro gerado pelo Brick
                installments: formData.installments ?? 1,
                payment_method_id: selectedPaymentMethod?.id,      // ex.: 'visa'
                issuer_id: selectedPaymentMethod?.issuer?.id ?? undefined,
                payer,
              }),
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data?.error || 'Falha no pagamento');

            // TODO: redirecionar ou mostrar status ao usuário
            // ex.: if (data.status === 'approved') router.push('/sucesso')
            console.log('Pagamento cartão ->', data);
          } catch (err) {
            // lançar o erro permite que o Brick mostre feedback de falha
            console.error(err);
            throw err;
          }
        }}
        onError={(error) => {
          console.error('Erro no CardPayment Brick:', error);
        }}
      />
    </div>
  );
}
