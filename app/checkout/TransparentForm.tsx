'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

type Props = {
  amount: number;
  description: string;
  publicKey: string; // process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
};

export default function TransparentForm({ amount, description, publicKey }: Props) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [cpf, setCpf] = useState('');

  // Campos do cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expirationMonth, setExpirationMonth] = useState('');
  const [expirationYear, setExpirationYear] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const mpRef = useRef<any>(null);

  useEffect(() => {
    const inject = () =>
      new Promise<void>((resolve, reject) => {
        if (window.MercadoPago) return resolve();
        const s = document.createElement('script');
        s.src = 'https://sdk.mercadopago.com/js/v2';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = reject;
        document.body.appendChild(s);
      });

    (async () => {
      try {
        await inject();
        mpRef.current = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
      } catch (error) {
        console.error('Erro ao carregar SDK do Mercado Pago:', error);
      }
    })();
  }, [publicKey]);

  async function payWithCard() {
    if (!mpRef.current) {
      alert('SDK não carregado');
      return;
    }

    setLoading(true);
    try {
      // Cria token do cartão (Checkout Transparente)
      const { id: token } = await mpRef.current.fields.createCardToken({
        cardNumber,
        cardholderName,
        securityCode,
        expirationMonth,
        expirationYear,
      });

      const res = await fetch('/api/mercadopago/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          payment_method: 'card',
          token,
          payer: {
            identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erro ao processar pagamento');

      // status: approved | in_process | rejected | pending
      alert(`Pagamento cartão: ${json.status}`);
      // TODO: redirecionar para página de sucesso/falha
    } catch (error: any) {
      console.error('Erro no pagamento com cartão:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao processar pagamento';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function payWithPixOrBoleto(kind: 'pix' | 'boleto') {
    setLoading(true);
    try {
      const res = await fetch('/api/mercadopago/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description,
          payment_method: kind,
          payer: {
            identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Erro ao processar pagamento');

      if (kind === 'pix') {
        // Para PIX, a resposta traz o QR/copy&paste
        const copy = json.point_of_interaction?.transaction_data?.qr_code || '';
        const link = json.point_of_interaction?.transaction_data?.ticket_url || '';
        alert('PIX gerado! Abra o link para pagar.');
        if (link) window.open(link, '_blank');
        console.log('PIX copy&paste:', copy);
      } else {
        // Boleto retorna boleto_url / barcode
        const boletoUrl = json.transaction_details?.external_resource_url || json.ticket_url;
        alert('Boleto gerado! Abra o link para pagar.');
        if (boletoUrl) window.open(boletoUrl, '_blank');
      }
    } catch (error: any) {
      console.error(`Erro no pagamento com ${kind}:`, error);
      const errorMessage = error?.message || `Erro desconhecido ao processar pagamento com ${kind}`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') return payWithCard();
    if (paymentMethod === 'pix') return payWithPixOrBoleto('pix');
    return payWithPixOrBoleto('boleto');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Método */}
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => setPaymentMethod('card')} className={`border rounded p-2 ${paymentMethod==='card'?'border-primary':''}`}>Cartão</button>
        <button type="button" onClick={() => setPaymentMethod('pix')} className={`border rounded p-2 ${paymentMethod==='pix'?'border-primary':''}`}>PIX</button>
        <button type="button" onClick={() => setPaymentMethod('boleto')} className={`border rounded p-2 ${paymentMethod==='boleto'?'border-primary':''}`}>Boleto</button>
      </div>

      {/* Campo CPF */}
      <input 
        className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        placeholder="CPF (somente números)" 
        value={cpf} 
        onChange={e=>setCpf(e.target.value)} 
        required 
      />

      {paymentMethod === 'card' && (
        <div className="space-y-2">
          <input 
            className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Número do cartão" 
            value={cardNumber} 
            onChange={e=>setCardNumber(e.target.value)} 
            required 
          />
          <input 
            className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            placeholder="Nome impresso no cartão" 
            value={cardholderName} 
            onChange={e=>setCardholderName(e.target.value)} 
            required 
          />
          <div className="grid grid-cols-3 gap-2">
            <input 
              className="border rounded p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="MM" 
              value={expirationMonth} 
              onChange={e=>setExpirationMonth(e.target.value)} 
              required 
            />
            <input 
              className="border rounded p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="AAAA" 
              value={expirationYear} 
              onChange={e=>setExpirationYear(e.target.value)} 
              required 
            />
            <input 
              className="border rounded p-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="CVV" 
              value={securityCode} 
              onChange={e=>setSecurityCode(e.target.value)} 
              required 
            />
          </div>
        </div>
      )}

      <button disabled={loading} className="w-full bg-primary text-white rounded p-3">
        {loading ? 'Processando...' : `Pagar R$ ${amount}`}
      </button>
    </form>
  );
}
