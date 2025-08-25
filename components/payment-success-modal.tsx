'use client';

import { useEffect } from 'react';

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    status: string;
}

export default function PaymentSuccessModal({ 
    isOpen, 
    onClose, 
    amount, 
    description, 
    status 
}: PaymentSuccessModalProps) {
    // Fecha o modal com ESC
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            // Previne scroll do body quando modal estiver aberto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

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
                    {/* Ícone de sucesso */}
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">✅</span>
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Pagamento Aprovado! 🎉
                    </h2>

                    {/* Descrição */}
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Seu pagamento foi processado com sucesso
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
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botão de ação */}
                    <button
                        onClick={onClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        Continuar
                    </button>

                    {/* Mensagem adicional */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Você receberá um email de confirmação em breve
                    </p>
                </div>
            </div>
        </div>
    );
}
