'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);
  const [smtpResult, setSmtpResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  const handleTestEmail = async () => {
    if (!email) {
      setResult({ error: 'Digite um email válido' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ error: data.error || 'Erro ao enviar email' });
      }
    } catch (error) {
      setResult({ error: 'Erro de conexão' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMTP = async () => {
    setSmtpLoading(true);
    setSmtpResult(null);

    try {
      const response = await fetch('/api/test-smtp');
      const data = await response.json();

      if (response.ok) {
        setSmtpResult({ success: true, message: data.message });
      } else {
        setSmtpResult({ error: data.error || 'Erro ao testar SMTP' });
      }
    } catch (error) {
      setSmtpResult({ error: 'Erro de conexão' });
    } finally {
      setSmtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Teste de Conexão SMTP */}
          <Card>
            <CardHeader>
              <CardTitle>Teste de Conexão SMTP</CardTitle>
              <CardDescription>
                Teste se a configuração SMTP está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleTestSMTP}
                disabled={smtpLoading}
                className="w-full"
                variant="outline"
              >
                {smtpLoading ? 'Testando...' : 'Testar Conexão SMTP'}
              </Button>

              {smtpResult && (
                <div className={`p-4 rounded-lg ${
                  smtpResult.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  {smtpResult.success ? (
                    <p>✅ {smtpResult.message}</p>
                  ) : (
                    <p>❌ {smtpResult.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teste de Envio de Email */}
          <Card>
            <CardHeader>
              <CardTitle>Teste de Envio de Email</CardTitle>
              <CardDescription>
                Teste se o envio de emails está funcionando corretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome (opcional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <Button
                onClick={handleTestEmail}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? 'Enviando...' : 'Enviar Email de Teste'}
              </Button>

              {result && (
                <div className={`p-4 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  {result.success ? (
                    <p>✅ {result.message}</p>
                  ) : (
                    <p>❌ {result.error}</p>
                  )}
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Para configurar o email:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Copie o arquivo <code>env.example</code> para <code>.env.local</code></li>
                  <li>Configure as variáveis SMTP no arquivo <code>.env.local</code></li>
                  <li>Para Gmail, use uma senha de app</li>
                  <li>Reinicie o servidor após configurar</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
