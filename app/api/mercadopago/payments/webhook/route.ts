'use client';
import { useState } from 'react';

export default function PixCheckout() {
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  async function createPix() {
    const resp = await fetch('/api/mercadopago/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'pix',
        amount: 79.9,
        payer: {
          email: 'cliente@ex.com',
          first_name: 'Cliente',
          last_name: 'Teste',
          identification: { type: 'CPF', number: '12345678909' },
        },
      }),
    });
    const data = await resp.json();
    setQr(data?.pix?.qr_code_base64 ?? null);
    setCode(data?.pix?.qr_code ?? null);
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <button onClick={createPix} className="px-4 py-2 rounded bg-black text-white">Gerar Pix</button>
      {qr && <img src={`data:image/png;base64,${qr}`} alt="QR Pix" />}
      {code && <textarea className="w-full border p-2" readOnly rows={3} value={code} />}
    </div>
  );
}
