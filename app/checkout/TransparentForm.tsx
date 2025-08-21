'use client';

import { useState } from 'react';

type Props = {
    amount: number;
    description: string;
    publicKey: string; // process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
};

export default function TransparentForm({
    amount,
    description,
    publicKey,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<
        'card' | 'pix' | 'boleto'
    >('card');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');

    // Campos do cartão
    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [expirationMonth, setExpirationMonth] = useState('');
    const [expirationYear, setExpirationYear] = useState('');
    const [securityCode, setSecurityCode] = useState('');

    // Função para aplicar máscara do CPF
    const formatCPF = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');

        // Aplica a máscara XXX.XXX.XXX-XX
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 6) {
            return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        } else if (numbers.length <= 9) {
            return `${numbers.slice(0, 3)}.${numbers.slice(
                3,
                6
            )}.${numbers.slice(6)}`;
        } else {
            return `${numbers.slice(0, 3)}.${numbers.slice(
                3,
                6
            )}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
        }
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formatted = formatCPF(value);
        setCpf(formatted);
    };

    async function payWithCard() {
        setLoading(true);
        try {
            // Validações básicas
            if (
                !cardNumber ||
                !cardholderName ||
                !expirationMonth ||
                !expirationYear ||
                !securityCode
            ) {
                throw new Error('Todos os campos do cartão são obrigatórios');
            }

            const res = await fetch('/api/mercadopago/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    description,
                    payment_method: 'card',
                    card_data: {
                        cardNumber: cardNumber.replace(/\s/g, ''),
                        cardholderName,
                        securityCode,
                        expirationMonth,
                        expirationYear,
                    },
                    payer: {
                        email,
                        identification: {
                            type: 'CPF',
                            number: cpf.replace(/\D/g, ''),
                        },
                    },
                }),
            });

            const json = await res.json();
            if (!res.ok)
                throw new Error(json?.error || 'Erro ao processar pagamento');

            // status: approved | in_process | rejected | pending
            alert(`Pagamento cartão: ${json.status}`);
            // TODO: redirecionar para página de sucesso/falha
        } catch (error: any) {
            console.error('=== ERRO NO PAGAMENTO ===');
            console.error('Erro:', error);

            const errorMessage =
                error?.message || 'Erro desconhecido ao processar pagamento';
            alert(`Erro no pagamento: ${errorMessage}`);
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
                        email,
                        identification: {
                            type: 'CPF',
                            number: cpf.replace(/\D/g, ''),
                        },
                    },
                }),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json?.error || 'Erro ao processar pagamento');

            if (kind === 'pix') {
                // Para PIX, a resposta traz o QR/copy&paste
                const copy =
                    json.point_of_interaction?.transaction_data?.qr_code || '';
                const link =
                    json.point_of_interaction?.transaction_data?.ticket_url ||
                    '';
                alert('PIX gerado! Abra o link para pagar.');
                if (link) window.open(link, '_blank');
                console.log('PIX copy&paste:', copy);
            } else {
                // Boleto retorna boleto_url / barcode
                const boletoUrl =
                    json.transaction_details?.external_resource_url ||
                    json.ticket_url;
                alert('Boleto gerado! Abra o link para pagar.');
                if (boletoUrl) window.open(boletoUrl, '_blank');
            }
        } catch (error: any) {
            console.error(`Erro no pagamento com ${kind}:`, error);
            const errorMessage =
                error?.message ||
                `Erro desconhecido ao processar pagamento com ${kind}`;
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
                <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`border rounded p-2 ${
                        paymentMethod === 'card' ? 'border-primary' : ''
                    }`}
                >
                    Cartão
                </button>
                <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`border rounded p-2 ${
                        paymentMethod === 'pix' ? 'border-primary' : ''
                    }`}
                >
                    PIX
                </button>
                <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`border rounded p-2 ${
                        paymentMethod === 'boleto' ? 'border-primary' : ''
                    }`}
                >
                    Boleto
                </button>
            </div>

            {/* Campo Email */}
            <input
                className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            {/* Campo CPF com máscara */}
            <input
                className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCPFChange}
                maxLength={14}
                required
            />

            {paymentMethod === 'card' && (
                <div className="space-y-3">
                    {/* Campo Nome no Cartão */}
                    <input
                        className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome impresso no cartão"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        required
                    />

                    {/* Campo Número do Cartão */}
                    <input
                        className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Número do cartão"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                    />

                    {/* Campos Data e CVV */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mês de vencimento
                            </label>
                            <input
                                className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="MM"
                                value={expirationMonth}
                                onChange={(e) =>
                                    setExpirationMonth(e.target.value)
                                }
                                maxLength={2}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ano de vencimento
                            </label>
                            <input
                                className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="AA"
                                value={expirationYear}
                                onChange={(e) =>
                                    setExpirationYear(e.target.value)
                                }
                                maxLength={2}
                                required
                            />
                        </div>
                    </div>

                    {/* Campo CVV */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                        </label>
                        <input
                            className="border rounded p-2 w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="CVV"
                            value={securityCode}
                            onChange={(e) => setSecurityCode(e.target.value)}
                            maxLength={4}
                            required
                        />
                    </div>
                </div>
            )}

            <button
                disabled={loading}
                className="w-full bg-primary text-white rounded p-3"
            >
                {loading ? 'Processando...' : `Pagar R$ ${amount}`}
            </button>
        </form>
    );
}
