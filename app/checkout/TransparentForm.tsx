'use client';

import { useState, useEffect } from 'react';
import PaymentSuccessModal from '@/components/payment-success-modal';
import PaymentErrorModal from '@/components/payment-error-modal';
import PaymentProcessingModal from '@/components/payment-processing-modal';

type Props = {
    amount: number;
    description: string;
    publicKey: string;
};

export default function TransparentForm({ amount, description, publicKey }: Props) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [expirationMonth, setExpirationMonth] = useState('');
    const [expirationYear, setExpirationYear] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    
    // Estados para PIX
    const [pixData, setPixData] = useState<any>(null);
    const [showPixInfo, setShowPixInfo] = useState(false);

    // Estado para modal de sucesso
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<string>('');

    // Estado para modal de erro
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [paymentError, setPaymentError] = useState<string>('');
    const [statusDetail, setStatusDetail] = useState<string>('');

    // Estado para modal de processamento
    const [showProcessingModal, setShowProcessingModal] = useState(false);

    // Inicializa o SDK do Mercado Pago
    const initializeMercadoPago = () => {
        if (typeof window !== 'undefined' && (window as any).Mercadopago && !(window as any).mp) {
            try {
                (window as any).mp = new (window as any).Mercadopago(publicKey);
                console.log('SDK do Mercado Pago inicializado com sucesso');
            } catch (error) {
                console.error('Erro ao inicializar SDK do MP:', error);
            }
        }
    };

    // Inicializa quando o componente monta
    useEffect(() => {
        initializeMercadoPago();
    }, []);

    // Cartões de teste do Mercado Pago:
    // Aprovado: 4509 9535 6623 3704
    // Rejeitado por saldo: 4000 0000 0000 0002
    // Rejeitado por dados: 4000 0000 0000 0069

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value);
        setCpf(formatted);
    };

    // Função para gerar token do cartão usando o SDK do MP
    async function generateCardToken(cardData: {
        cardNumber: string;
        cardholderName: string;
        securityCode: string;
        expirationMonth: string;
        expirationYear: string;
    }): Promise<string | null> {
        try {
            // Verifica se o SDK do Mercado Pago está disponível
            if (typeof window !== 'undefined' && (window as any).mp) {
                const mp = (window as any).mp;
                
                // Cria o card token usando a API correta
                const cardToken = await mp.cardTokenize({
                    cardNumber: cardData.cardNumber,
                    cardholderName: cardData.cardholderName,
                    cardExpirationMonth: cardData.expirationMonth,
                    cardExpirationYear: '20' + cardData.expirationYear, // Converte "25" para "2025"
                    securityCode: cardData.securityCode,
                    identificationType: 'CPF',
                    identificationNumber: cpf.replace(/\D/g, ''),
                });

                console.log('Token gerado via SDK:', cardToken);
                return cardToken.id;
            } else {
                // Fallback: gera token usando nossa API backend
                console.warn('SDK do Mercado Pago não encontrado, usando API backend');
                
                const response = await fetch('/api/mercadopago/tokenize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        card_number: cardData.cardNumber,
                        security_code: cardData.securityCode,
                        expiration_month: parseInt(cardData.expirationMonth),
                        expiration_year: parseInt('20' + cardData.expirationYear), // Converte "25" para 2025
                        cardholder: {
                            name: cardData.cardholderName,
                            identification: {
                                type: 'CPF',
                                number: cpf.replace(/\D/g, ''),
                            },
                        },
                    }),
                });

                if (response.ok) {
                    const tokenData = await response.json();
                    console.log('Token gerado via API backend:', tokenData);
                    return tokenData.id;
                } else {
                    console.error('Erro ao gerar token via API backend:', await response.text());
                    return null;
                }
            }
        } catch (error) {
            console.error('Erro ao gerar token do cartão:', error);
            return null;
        }
    }

    async function payWithCard() {
        setLoading(true);
        try {
            // Validações básicas
            if (!cardNumber || !cardholderName || !expirationMonth || !expirationYear || !securityCode) {
                throw new Error('Todos os campos do cartão são obrigatórios');
            }

            // Validação do ano de expiração
            const year = parseInt(expirationYear);
            if (year < 20 || year > 99) {
                throw new Error('Ano de expiração deve estar entre 20 e 99');
            }

            // Validação do mês de expiração
            const month = parseInt(expirationMonth);
            if (month < 1 || month > 12) {
                throw new Error('Mês de expiração deve estar entre 01 e 12');
            }

            // Gera o token do cartão usando o SDK do Mercado Pago
            const cardToken = await generateCardToken({
                cardNumber: cardNumber.replace(/\s/g, ''),
                cardholderName,
                securityCode,
                expirationMonth,
                expirationYear,
            });

            if (!cardToken) {
                throw new Error('Falha ao gerar token do cartão');
            }

            // Mostra modal de processamento quando realmente enviar para a API
            setShowProcessingModal(true);

            const res = await fetch('/api/mercadopago/card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    description,
                    payment_method: 'card',
                    token: cardToken, // Campo correto esperado pela API
                    payer: {
                        email,
                        identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
                    },
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Erro ao processar pagamento');
            
            // Fecha modal de processamento
            setShowProcessingModal(false);
            
            // Verifica o status do pagamento
            const status = json.status || 'rejected';
            const statusDetail = json.status_detail || '';
            
            if (status === 'approved' || status === 'authorized') {
                // Pagamento aprovado - mostra modal de sucesso
                setPaymentStatus(status);
                setShowSuccessModal(true);
            } else if (status === 'pending' || status === 'in_process') {
                // Pagamento em processamento - mostra modal de processamento
                setPaymentStatus(status);
                setShowProcessingModal(true);
            } else {
                // Pagamento rejeitado - mostra modal de erro
                setPaymentError(json.error || 'Pagamento rejeitado');
                setStatusDetail(statusDetail);
                setShowErrorModal(true);
            }
        } catch (error: any) {
            console.error('Erro no pagamento:', error);
            // Fecha modal de processamento em caso de erro
            setShowProcessingModal(false);
            alert(`Erro no pagamento: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function payWithPix() {
        setLoading(true);
        try {
            if (!email || !cpf) {
                throw new Error('Email e CPF são obrigatórios para PIX');
            }

            // Mostra modal de processamento quando realmente enviar para a API
            setShowProcessingModal(true);

            const res = await fetch('/api/pixpayment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: cardholderName || 'Cliente',
                    email,
                    cpf: cpf.replace(/\D/g, ''),
                    amount,
                }),
            });

            const json = await res.json();
            console.log('Resposta PIX:', json);

            // Fecha modal de processamento
            setShowProcessingModal(false);

            if (!json.success) {
                throw new Error(json?.error || 'Erro ao gerar PIX');
            }

            // PIX gerado com sucesso
            setPixData(json.data);
            setShowPixInfo(true);
            
        } catch (error: any) {
            console.error('Erro PIX:', error);
            // Fecha modal de processamento em caso de erro
            setShowProcessingModal(false);
            alert(`Erro PIX: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentMethod === 'card') return payWithCard();
        if (paymentMethod === 'pix') return payWithPix();
        alert('Funcionalidade boleto em desenvolvimento.');
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Métodos de pagamento */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`border rounded p-2 ${paymentMethod === 'card' ? 'border-primary bg-primary/10' : ''}`}
                >
                    Cartão
                </button>
                <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`border rounded p-2 ${paymentMethod === 'pix' ? 'border-primary bg-primary/10' : ''}`}
                >
                    PIX
                </button>
                <button
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={`border rounded p-2 ${paymentMethod === 'boleto' ? 'border-primary bg-primary/10' : ''}`}
                >
                    Boleto
                </button>
            </div>

            {/* Campos obrigatórios */}
            <input
                className="border rounded p-2 w-full bg-white text-gray-900"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                className="border rounded p-2 w-full bg-white text-gray-900"
                placeholder="CPF (000.000.000-00)"
                value={cpf}
                onChange={handleCPFChange}
                maxLength={14}
                required
            />

            {/* Campos do cartão */}
            {paymentMethod === 'card' && (
                <div className="space-y-3">
                    <input
                        className="border rounded p-2 w-full bg-white text-gray-900"
                        placeholder="Nome no cartão"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        required
                    />
                    <input
                        className="border rounded p-2 w-full bg-white text-gray-900"
                        placeholder="Número do cartão"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            className="border rounded p-2 bg-white text-gray-900"
                            placeholder="MM"
                            value={expirationMonth}
                            onChange={(e) => setExpirationMonth(e.target.value)}
                            maxLength={2}
                            required
                        />
                        <input
                            className="border rounded p-2 bg-white text-gray-900"
                            placeholder="AA (ex: 25)"
                            value={expirationYear}
                            onChange={(e) => setExpirationYear(e.target.value)}
                            maxLength={2}
                            required
                        />
                        <input
                            className="border rounded p-2 bg-white text-gray-900"
                            placeholder="CVV"
                            value={securityCode}
                            onChange={(e) => setSecurityCode(e.target.value)}
                            maxLength={4}
                            required
                        />
                    </div>
                </div>
            )}

            {/* Informações do PIX */}
            {showPixInfo && pixData && (
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                        PIX Gerado com Sucesso! 🎉
                    </h3>
                    
                    {/* QR Code */}
                    {pixData.qr_code_base64 && (
                        <div className="text-center mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Escaneie o QR Code:
                            </p>
                            <img 
                                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                                alt="QR Code PIX"
                                className="mx-auto border-2 border-gray-300 rounded-lg"
                                style={{ width: '200px', height: '200px' }}
                            />
                        </div>
                    )}

                    {/* Código PIX */}
                    {pixData.qr_code && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Ou copie o código PIX:
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pixData.qr_code}
                                    readOnly
                                    className="flex-1 p-2 border rounded bg-gray-50 dark:bg-gray-800 text-sm font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(pixData.qr_code);
                                        alert('Código PIX copiado!');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Informações */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p><strong>Valor:</strong> R$ {amount}</p>
                        <p><strong>Status:</strong> {pixData.status}</p>
                        <p><strong>ID:</strong> {pixData.id}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowPixInfo(false);
                            setPixData(null);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Gerar Novo PIX
                    </button>
                </div>
            )}

            <button
                disabled={loading}
                className="w-full bg-primary text-white rounded p-3"
            >
                {loading ? 'Processando...' : `Pagar R$ ${amount}`}
            </button>

            {/* Modal de sucesso */}
            <PaymentSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                amount={amount}
                description={description}
                status={paymentStatus}
            />

            {/* Modal de erro */}
            <PaymentErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                amount={amount}
                description={description}
                error={paymentError}
                statusDetail={statusDetail}
            />

            {/* Modal de processamento */}
            <PaymentProcessingModal
                isOpen={showProcessingModal}
                onClose={() => setShowProcessingModal(false)}
                amount={amount}
                description={description}
                status={paymentStatus || 'in_process'}
            />
        </form>
    );
}