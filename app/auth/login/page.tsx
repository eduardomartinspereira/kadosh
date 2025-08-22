'use client';

import { useCustomSession } from '@/app/context/SessionContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

// 👇 toastify
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const router = useRouter();

    const { setSession } = useCustomSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { csrfToken } = await fetch('/api/auth/csrf', {
                cache: 'no-store',
            }).then((r) => r.json());

            const res = await fetch('/api/auth/callback/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    csrfToken,
                    email: formData.email,
                    password: formData.password,
                    callbackUrl: '/plans',
                }),
            });

            const finalUrl = new URL(res.url, window.location.origin);
            const errorCode = finalUrl.searchParams.get('error');

            if (errorCode) {
                toast.error(
                    errorCode === 'CredentialsSignin'
                        ? 'E-mail ou senha inválidos.'
                        : 'Falha ao entrar. Tente novamente.'
                );
                return;
            }

            if (res.ok) {
                // 👇 busca sessão atualizada
                const updatedSession = await fetch('/api/auth/session')
                    .then((r) => r.json());

                // 👇 seta no contexto
                setSession(updatedSession);

                toast.success('Login realizado com sucesso!');
                router.push('/plans');
            } else {
                toast.error('Falha ao entrar. Tente novamente.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro no login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
            {/* Overlay de carregamento */}
            {loading && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
                    <div className="flex h-full items-center justify-center">
                        <div className="flex items-center gap-3 rounded-xl bg-background/80 p-4 shadow-lg ring-1 ring-border">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-foreground">
                                Autenticando…
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md">
                {/* ... (header e textos iguais) */}


                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            Entrar na sua conta
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Digite suas credenciais para acessar a plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            aria-busy={loading}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            handleChange(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        placeholder="seu@email.com"
                                        className="pl-10 bg-muted border-border"
                                        required
                                        disabled={loading} // 👈 trava input
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={formData.password}
                                        onChange={(e) =>
                                            handleChange(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Sua senha"
                                        className="pl-10 pr-10 bg-muted border-border"
                                        required
                                        disabled={loading} // 👈 trava input
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        disabled={loading}
                                        aria-label={
                                            showPassword
                                                ? 'Ocultar senha'
                                                : 'Mostrar senha'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={formData.rememberMe}
                                        onCheckedChange={(checked) =>
                                            handleChange(
                                                'rememberMe',
                                                Boolean(checked)
                                            )
                                        }
                                        className="border-border"
                                        disabled={loading}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm text-muted-foreground"
                                    >
                                        Lembrar de mim
                                    </Label>
                                </div>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando…
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <Separator className="my-4 bg-border" />
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Não tem uma conta?{' '}
                                    <Link
                                        href="/auth/register"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Criar conta
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground">
                        Ao continuar, você concorda com nossos{' '}
                        <Link
                            href="/terms"
                            className="text-primary hover:underline"
                        >
                            Termos de Uso
                        </Link>{' '}
                        e{' '}
                        <Link
                            href="/privacy"
                            className="text-primary hover:underline"
                        >
                            Política de Privacidade
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
