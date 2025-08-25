'use client';

import { useEffect } from 'react';

interface PaymentErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    error: string;
    statusDetail?: string;
}

export default function PaymentErrorModal({ 
    isOpen, 
    onClose, 
    amount, 
    description, 
    error,
    statusDetail 
}: PaymentErrorModalProps) {
    // Fecha o modal com ESC
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Função para traduzir os erros do Mercado Pago
    const getErrorMessage = (statusDetail: string) => {
        const errorMessages: { [key: string]: string } = {
            'cc_rejected_insufficient_amount': 'Saldo insuficiente no cartão',
            'cc_rejected_bad_filled_date': 'Data de expiração incorreta',
            'cc_rejected_bad_filled_other': 'Dados do cartão incorretos',
            'cc_rejected_bad_filled_security_code': 'Código de segurança incorreto',
            'cc_rejected_blacklist': 'Cartão não autorizado',
            'cc_rejected_call_for_authorize': 'Ligue para autorizar o pagamento',
            'cc_rejected_card_disabled': 'Cartão desabilitado',
            'cc_rejected_card_error': 'Erro no cartão',
            'cc_rejected_duplicated_payment': 'Pagamento duplicado',
            'cc_rejected_high_risk': 'Pagamento rejeitado por risco',
            'cc_rejected_invalid_installments': 'Parcelamento não disponível',
            'cc_rejected_max_attempts': 'Máximo de tentativas excedido',
            'cc_rejected_other_reason': 'Pagamento rejeitado',
        };
        
        return errorMessages[statusDetail] || 'Pagamento rejeitado';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                {/* Header com botão fechar */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <span className="text-2xl text-gray-500 hover:text-gray-700">×</span>
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-8 text-center">
                    {/* Ícone de erro */}
                    <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">❌</span>
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Pagamento Rejeitado
                    </h2>

                    {/* Descrição */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {statusDetail ? getErrorMessage(statusDetail) : error}
                    </p>

                    {/* Detalhes */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    R$ {amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Descrição:</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {description}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                    Rejeitado
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botão de ação */}
                    <button
                        onClick={onClose}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        Tentar Novamente
                    </button>

                    {/* Mensagem adicional */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Verifique os dados do cartão e tente novamente
                    </p>
                </div>
            </div>
        </div>
    );
}
