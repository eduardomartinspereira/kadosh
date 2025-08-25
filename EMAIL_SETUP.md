# Configuração de Envio de Emails

## 📧 Sistema de Emails Implementado

O sistema agora usa **nodemailer** diretamente e envia emails automaticamente quando:
- ✅ **Pagamento com cartão é aprovado**
- ✅ **PIX é gerado**
- ✅ **Webhook do Mercado Pago confirma pagamento aprovado**

## 🔧 Configuração Necessária

### 1. Criar arquivo `.env.local`

Copie o arquivo `env.example` para `.env.local` e configure as variáveis SMTP:

```bash
cp env.example .env.local
```

### 2. Configurar Email

#### Opção 1: Novas variáveis (Recomendadas)
```env
EMAIL_USER=suporteservicosnet@gmail.com
EMAIL_PASS=cwiz goav vvhu qozu
EMAIL_FROM=suporteservicosnet@gmail.com
```

#### Opção 2: Variáveis antigas (Alternativa)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
MAIL_FROM=seu-email@gmail.com
```

**⚠️ Importante:** Para Gmail, você precisa usar uma **senha de app**, não sua senha normal.

### 3. Como criar senha de app no Gmail

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas** (se não estiver ativa)
4. Vá em **Senhas de app**
5. Gere uma nova senha para "Email"
6. Use essa senha no `SMTP_PASS`

## 🧪 Testando o Sistema

### Opção 1: Página de Teste Completa
Acesse: `http://localhost:3000/test-email`

A página inclui:
- ✅ **Teste de Conexão SMTP** - Verifica se a configuração está correta
- ✅ **Teste de Envio de Email** - Envia um email real de teste

### Opção 2: APIs de Teste

#### Testar Conexão SMTP:
```bash
curl http://localhost:3000/api/test-smtp
```

#### Testar Envio de Email:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","name":"Seu Nome"}'
```

## 📋 Logs e Debug

Os logs de email aparecem no console do servidor:

```
[MAILER] ✅ Email enviado com sucesso: { messageId: "...", to: "cliente@email.com", orderId: "..." }
```

Se houver erro:
```
[MAILER] ❌ Erro ao enviar email: [detalhes do erro]
```

Se SMTP não estiver configurado:
```
[MAILER] ⚠️ Email não foi enviado (configuração SMTP ausente)
```

## 🚀 Deploy na Vercel

Para o deploy na Vercel, configure as variáveis de ambiente no painel da Vercel:

1. Vá para seu projeto na Vercel
2. Settings → Environment Variables
3. Adicione as variáveis de email:

#### Opção 1: Novas variáveis (Recomendadas)
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

#### Opção 2: Variáveis antigas (Alternativa)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

## 📧 Template do Email

O email enviado inclui:
- ✅ Confirmação do pagamento com design moderno
- ✅ Detalhes do pedido (ID, descrição, valor)
- ✅ Link para comprovante (quando disponível)
- ✅ Versão HTML e texto simples
- ✅ Informações de segurança

## 🔍 Troubleshooting

### Email não está sendo enviado?

1. **Teste a conexão SMTP primeiro:**
   - Acesse `/test-email`
   - Clique em "Testar Conexão SMTP"
   - Verifique se a conexão está OK

2. **Verifique as variáveis de email:**
   ```bash
   # Novas variáveis
   echo $EMAIL_USER
   echo $EMAIL_PASS
   echo $EMAIL_FROM
   
   # Ou variáveis antigas
   echo $SMTP_HOST
   echo $SMTP_USER
   echo $SMTP_PASS
   ```

3. **Teste o envio de email:**
   - Use a página `/test-email`
   - Verifique os logs no console

4. **Problemas comuns:**
   - Gmail: Use senha de app, não senha normal
   - Porta incorreta: Gmail usa 587, não 465
   - Firewall: Verifique se a porta 587 está liberada

### Logs de erro comuns:

```
535 Authentication failed
```
→ Senha incorreta ou não é senha de app

```
Connection timeout
```
→ Host SMTP incorreto ou problema de rede

```
550 Relaying not allowed
```
→ Configuração SMTP incorreta

```
Transporter não configurado
```
→ Variáveis SMTP não estão definidas

## 📞 Suporte

Se ainda tiver problemas:
1. Teste a conexão SMTP em `/test-email`
2. Verifique os logs no console do servidor
3. Confirme se as variáveis SMTP estão corretas
4. Reinicie o servidor após configurar as variáveis
5. Para Gmail, certifique-se de usar senha de app

## 🔄 Mudanças Recentes

- ✅ **Suporte para novas variáveis de email** (EMAIL_USER, EMAIL_PASS, EMAIL_FROM)
- ✅ **Compatibilidade com variáveis antigas** (SMTP_*)
- ✅ **Simplificado para usar nodemailer diretamente**
- ✅ **Interface mais limpa e moderna**
- ✅ **Melhor tratamento de erros**
- ✅ **Teste de conexão SMTP separado**
- ✅ **Logs mais detalhados**
- ✅ **Template de email melhorado**

