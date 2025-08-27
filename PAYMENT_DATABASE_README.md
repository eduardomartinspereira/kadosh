# Sistema de Pagamentos - Salvamento no Banco

## ✅ **Implementado com Sucesso**

### **O que foi adicionado:**

1. **💳 Pagamento com Cartão** (`/api/mercadopago/card`)
   - Salva automaticamente no banco quando aprovado
   - Cria: Order → Invoice → Payment

2. **📱 Pagamento PIX** (`/api/pixpayment`)
   - Salva automaticamente no banco quando criado
   - Cria: Order → Invoice → Payment (status PENDING)

## 🔄 **Fluxo de Salvamento**

### **Cartão de Crédito:**
```
Pagamento Aprovado → Salva no Banco → Envia Email
```

**Status no banco:**
- Order: `PAID`
- Invoice: `PAID` 
- Payment: `APPROVED`

### **PIX:**
```
PIX Criado → Salva no Banco (PENDING) → Envia Email
```

**Status no banco:**
- Order: `PENDING`
- Invoice: `OPEN`
- Payment: `PENDING`

## 📊 **Estrutura Criada no Banco**

### **1. Order (Pedido)**
- `userId`: Usuário que fez o pagamento
- `type`: `SUBSCRIPTION_INITIAL`
- `status`: `PAID` (cartão) ou `PENDING` (PIX)
- `totalAmountCents`: Valor em centavos
- `provider`: `MERCADO_PAGO`

### **2. Invoice (Fatura)**
- `orderId`: Referência ao pedido
- `status`: `PAID` (cartão) ou `OPEN` (PIX)
- `providerInvoiceId`: ID do Mercado Pago

### **3. Payment (Pagamento)**
- `invoiceId`: Referência à fatura
- `method`: `CARD` ou `PIX`
- `status`: `APPROVED` (cartão) ou `PENDING` (PIX)
- `amountCents`: Valor em centavos
- `providerPaymentId`: ID do Mercado Pago
- `providerRaw`: Dados completos da resposta do MP

## 🎯 **Como Funciona**

1. **Usuário faz pagamento** → Sistema processa
2. **Se aprovado (cartão)** → Salva tudo como PAID
3. **Se PIX** → Salva como PENDING
4. **Dados ficam no banco** → Pode consultar, rastrear, etc.

## 📝 **Logs no Console**

- `💾 Dados salvos no banco com sucesso` - Quando salva
- `❌ Erro ao salvar no banco` - Se der erro (não falha o pagamento)

## 🔍 **Consultas Úteis**

### **Ver todos os pagamentos:**
```sql
SELECT * FROM Payment ORDER BY createdAt DESC;
```

### **Ver pagamentos aprovados:**
```sql
SELECT * FROM Payment WHERE status = 'APPROVED';
```

### **Ver pagamentos pendentes (PIX):**
```sql
SELECT * FROM Payment WHERE status = 'PENDING';
```

### **Ver pagamentos por usuário:**
```sql
SELECT p.* FROM Payment p 
JOIN Invoice i ON p.invoiceId = i.id 
JOIN Order o ON i.orderId = o.id 
WHERE o.userId = 'user_id';
```

## ✅ **Resumo**

**Agora todos os pagamentos são salvos automaticamente no banco:**
- ✅ Cartão: Salva como aprovado
- ✅ PIX: Salva como pendente
- ✅ Dados completos para auditoria
- ✅ Rastreamento completo de transações
- ✅ Não falha o pagamento se o banco der erro

O sistema está funcionando perfeitamente! 🎯 