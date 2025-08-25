'use client';

import { useEffect } from 'react';

interface PaymentProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    status: string;
}

export default function PaymentProcessingModal({ 
    isOpen, 
    onClose, 
    amount, 
    description, 
    status 
}: PaymentProcessingModalProps) {
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

    // Função para traduzir os status de processamento
    const getStatusMessage = (status: string) => {
        const statusMessages: { [key: string]: string } = {
            'pending': 'Pagamento em análise',
            'in_process': 'Pagamento em processamento',
            'authorized': 'Pagamento autorizado, aguardando confirmação',
            'approved': 'Pagamento aprovado',
            'rejected': 'Pagamento rejeitado',
            'cancelled': 'Pagamento cancelado',
            'refunded': 'Pagamento estornado',
            'charged_back': 'Pagamento contestado',
        };
        
        return statusMessages[status] || 'Pagamento em processamento';
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
                    {/* Ícone de processamento */}
                    <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <span className="absolute inset-0 flex items-center justify-center text-2xl">⏳</span>
                        </div>
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Pagamento em Processamento
                    </h2>

                    {/* Descrição */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {getStatusMessage(status)}
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
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botão de ação */}
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        Entendi
                    </button>

                    {/* Mensagem adicional */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>O que acontece agora?</strong>
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 text-left">
                            <li>• Seu pagamento está sendo analisado</li>
                            <li>• Você receberá um email com o resultado</li>
                            <li>• O status será atualizado automaticamente</li>
                            <li>• Em caso de dúvidas, entre em contato</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
