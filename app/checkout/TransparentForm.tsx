'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PaymentSuccessModal from '@/components/payment-success-modal';
import PaymentErrorModal from '@/components/payment-error-modal';
import PaymentProcessingModal from '@/components/payment-processing-modal';
import { showToast } from '@/lib/toast-config';

type Props = {
    amount: number;
    description: string;
    publicKey: string;
};

export default function TransparentForm({ amount, description, publicKey }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
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

    // Função para redirecionar para o catálogo após pagamento bem-sucedido
    const handlePaymentSuccess = () => {
        setShowSuccessModal(false);
        // Redireciona para o catálogo após um pequeno delay para melhor UX
        setTimeout(() => {
            router.push('/catalog');
        }, 500);
    };

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

    // Função simplificada para formatar CPF
    const formatCPF = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        const numbersOnly = numbers.slice(0, 11);
        
        // Aplica a máscara automaticamente
        if (numbersOnly.length === 0) return '';
        if (numbersOnly.length <= 3) return numbersOnly;
        if (numbersOnly.length <= 6) return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3)}`;
        if (numbersOnly.length <= 9) return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6)}`;
        return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6, 9)}-${numbersOnly.slice(9, 11)}`;
    };

    // Função para validar CPF
    const validateCPF = (cpf: string): boolean => {
        const numbers = cpf.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos
        if (numbers.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(numbers)) return false;
        
        // Validação dos dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(numbers[i]) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(numbers[9])) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(numbers[i]) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(numbers[10])) return false;
        
        return true;
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        console.log('🔍 CPF input:', inputValue); // Debug
        
        // Se o usuário está apagando, permite
        if (inputValue.length < cpf.length) {
            setCpf(inputValue);
            return;
        }
        
        const formatted = formatCPF(inputValue);
        console.log('🔍 CPF formatted:', formatted); // Debug
        
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
            showToast.error(`Erro no pagamento: ${error.message}`);
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
            showToast.error(`Erro PIX: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentMethod === 'card') return payWithCard();
        if (paymentMethod === 'pix') return payWithPix();
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Métodos de pagamento */}
            <div className="grid grid-cols-2 gap-2">
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

            <div className="space-y-1">
                <input
                    className={`border rounded p-2 w-full bg-white text-gray-900 ${
                        cpf && cpf.length === 14 
                            ? validateCPF(cpf) 
                                ? 'border-green-500 focus:border-green-600' 
                                : 'border-red-500 focus:border-red-600'
                            : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="CPF (000.000.000-00)"
                    value={cpf}
                    onChange={handleCPFChange}
                    onPaste={(e) => {
                        e.preventDefault();
                        const pastedText = e.clipboardData.getData('text');
                        console.log('🔍 CPF pasted:', pastedText); // Debug
                        const formatted = formatCPF(pastedText);
                        console.log('🔍 CPF pasted formatted:', formatted); // Debug
                        setCpf(formatted);
                    }}
                    maxLength={14}
                    required
                />
                {cpf && cpf.length === 14 && (
                    <div className={`text-xs ${
                        validateCPF(cpf) 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                    }`}>
                        {validateCPF(cpf) ? '✅ CPF válido' : '❌ CPF inválido'}
                    </div>
                )}
            </div>

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
                                        showToast.success('Código PIX copiado!');
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

                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setShowPixInfo(false);
                                setPixData(null);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Gerar Novo PIX
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowPixInfo(false);
                                setPixData(null);
                                // Redireciona para o catálogo após PIX gerado
                                setTimeout(() => {
                                    router.push('/catalog');
                                }, 500);
                            }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Ir para Catálogo
                        </button>
                    </div>
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
                onClose={handlePaymentSuccess}
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