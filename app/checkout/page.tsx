'use client';

import { ArrowLeft, Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// >>> IMPORTA o formulário do Checkout Transparente
import TransparentForm from './TransparentForm';

interface Plan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: string[];
}

const plans: Record<string, Plan> = {
    basic: {
        id: 'basic',
        name: 'Básico',
        description: 'Ideal para pequenas empresas e freelancers',
        monthlyPrice: 97,
        yearlyPrice: 970,
        features: [
            'Acesso ao catálogo básico',
            '5 downloads por mês',
            'Suporte por email',
            'Templates básicos',
            'Guias de marca simples',
        ],
    },
    professional: {
        id: 'professional',
        name: 'Profissional',
        description:
            'Para empresas em crescimento que precisam de mais recursos',
        monthlyPrice: 34.90,
        yearlyPrice: 289.90,
        features: [
            'Acesso completo ao catálogo',
            '5 downloads por dia',
            'Suporte prioritário',
            'Templates premium',
            'Guias de marca avançados',
            'Consultoria mensal (1h)',
            'Acesso a webinars exclusivos',
        ],
    },
    enterprise: {
        id: 'enterprise',
        name: 'Empresarial',
        description: 'Solução completa para grandes empresas',
        monthlyPrice: 397,
        yearlyPrice: 3970,
        features: [
            'Acesso ilimitado ao catálogo',
            'Downloads ilimitados',
            'Suporte 24/7',
            'Templates exclusivos',
            'Guias de marca personalizados',
            'Consultoria ilimitada',
            'Sessões de treinamento',
            'Gerente de conta dedicado',
            'Conteúdo personalizado',
        ],
    },
};

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const planId = (searchParams.get('plan') || 'professional').toLowerCase();
    const billingCycle = (searchParams.get('cycle') || 'monthly').toLowerCase();

    useEffect(() => {
        if (status === 'loading') return; // Aguarda carregar
        
        if (status === 'unauthenticated' || !session) {
            router.push('/auth/login');
            return;
        }
    }, [status, session, router]);

    // Mostra loading enquanto verifica autenticação
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Redireciona se não estiver autenticado
    if (status === 'unauthenticated' || !session) {
        return null; // Será redirecionado pelo useEffect
    }

    const [formData, setFormData] = useState({
        acceptTerms: false,
    });

    const selectedPlan = plans[planId] || plans.basic;
    const price =
        billingCycle === 'monthly'
            ? selectedPlan.monthlyPrice
            : selectedPlan.yearlyPrice;
    const savings =
        billingCycle === 'yearly'
            ? selectedPlan.monthlyPrice * 12 - selectedPlan.yearlyPrice
            : 0;

    const handleChange = (field: string, value: string | boolean) => {
        console.log('handleChange called:', field, value);
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };
            console.log('New formData:', newData);
            return newData;
        });
    };

    // Public Key do MP vinda do .env (NEXT_PUBLIC_MP_PUBLIC_KEY)
    const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

    // Descrição que será enviada ao pagamento
    const paymentDescription = `Assinatura do plano ${selectedPlan.name} - ${
        billingCycle === 'monthly' ? 'Mensal' : 'Anual'
    }`;

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/plans"
                            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar aos planos
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">
                            Finalizar Assinatura
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Complete seu cadastro para acessar a plataforma
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="space-y-6">
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-foreground">
                                        Resumo do Pedido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-foreground">
                                                {selectedPlan.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedPlan.description}
                                            </p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                Ciclo:{' '}
                                                {billingCycle === 'monthly'
                                                    ? 'Mensal'
                                                    : 'Anual'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-foreground">
                                                R$ {price}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                /
                                                {billingCycle === 'monthly'
                                                    ? 'mês'
                                                    : 'ano'}
                                            </div>
                                        </div>
                                    </div>

                                    {billingCycle === 'yearly' &&
                                        savings > 0 && (
                                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                <p className="text-green-700 dark:text-green-400 text-sm">
                                                    💰 Economia de R$ {savings}{' '}
                                                    por ano!
                                                </p>
                                            </div>
                                        )}

                                    <div className="border-t border-border pt-4">
                                        <h4 className="font-semibold text-foreground mb-3">
                                            Incluído no seu plano:
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedPlan.features.map(
                                                (feature, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-muted-foreground">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Security Info */}
                            <Card className="bg-card border-border">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Shield className="h-5 w-5 text-green-500" />
                                        <h4 className="font-semibold text-foreground">
                                            Segurança e Privacidade
                                        </h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Seus dados estão protegidos com
                                        criptografia de ponta a ponta. Nunca
                                        compartilhamos suas informações pessoais
                                        com terceiros.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Checkout Form */}
                        <div className="space-y-6">
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-foreground">
                                        Informações de Pagamento
                                    </CardTitle>
                                    <CardDescription>
                                        Use o Checkout Transparente do Mercado
                                        Pago para concluir sua assinatura
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Terms and Conditions */}
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="acceptTerms"
                                                checked={formData.acceptTerms}
                                                onCheckedChange={(checked) => {
                                                    console.log('Checkbox clicked:', checked);
                                                    handleChange('acceptTerms', Boolean(checked));
                                                }}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor="acceptTerms"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    onClick={() => {
                                                        const newValue = !formData.acceptTerms;
                                                        console.log('Label clicked, new value:', newValue);
                                                        handleChange('acceptTerms', newValue);
                                                    }}
                                                >
                                                    Aceito os termos e condições
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Li e concordo com os{' '}
                                                    <Link
                                                        href="/terms"
                                                        className="text-primary hover:underline"
                                                    >
                                                        termos de serviço
                                                    </Link>{' '}
                                                    e{' '}
                                                    <Link
                                                        href="/privacy"
                                                        className="text-primary hover:underline"
                                                    >
                                                        política de privacidade
                                                    </Link>
                                                    .
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Debug info - remover depois */}
                                        <div className="text-xs text-gray-500">
                                            Status do checkbox: {formData.acceptTerms ? 'Marcado' : 'Desmarcado'}
                                        </div>
                                    </div>

                                    {/* Renderiza o Checkout Transparente somente após aceitar os termos */}
                                                                            {formData.acceptTerms ? (
                                            mpPublicKey ? (
                                                <TransparentForm
                                                    amount={price}
                                                    description={paymentDescription}
                                                    publicKey={mpPublicKey}
                                                />
                                            ) : (
                                            <div className="text-sm text-red-500">
                                                Defina{' '}
                                                <code>
                                                    NEXT_PUBLIC_MP_PUBLIC_KEY
                                                </code>{' '}
                                                no seu <code>.env</code> para
                                                habilitar o pagamento.
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-sm text-muted-foreground">
                                            Marque &quot;Aceito os termos e
                                            condições&quot; para liberar o
                                            pagamento.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
