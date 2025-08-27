# 🔍 Debug do Erro de Download PSD

## 🚨 **Problema Identificado:**

O download PSD está retornando "Erro interno do servidor" em vez de funcionar corretamente.

## ✅ **Soluções Implementadas:**

### **1. Logs de Debug Adicionados**

#### **API de Download PSD (`/api/download/psd/[id]`):**
```typescript
// Logs adicionados em cada etapa
console.log('🔍 Debug PSD API - session:', session)
console.log('🔍 Debug PSD API - product:', product)
console.log('🔍 Debug PSD API - arquivoPsd:', (product as any).arquivoPsd)
console.log('🔍 Debug PSD API - Verificando acesso ao produto...')
console.log('🔍 Debug PSD API - hasAccess:', hasAccess)
console.log('🔍 Debug PSD API - Verificando permissões de download...')
console.log('🔍 Debug PSD API - permission:', permission)
console.log('🔍 Debug PSD API - Registrando download...')
```

#### **Funções de Permissão (`lib/download-permissions.ts`):**
```typescript
// Logs para verificar assinatura
console.log('🔍 Debug - Verificando assinatura para usuário:', userId)
console.log('🔍 Debug - Assinatura encontrada:', activeSubscription)

// Logs para verificar acesso ao produto
console.log('🔍 Debug - Verificando acesso ao produto:', productId, 'para usuário:', userId)
console.log('🔍 Debug - Produto encontrado:', product)
console.log('🔍 Debug - Produto é público, acesso permitido')

// Logs para registrar download
console.log('🔍 Debug - Tentando registrar download:', { userId, productId, assetType })
```

#### **Frontend (`app/catalog/page.tsx`):**
```typescript
// Logs para debug do frontend
console.error('🔍 Debug Frontend - Erro na API PSD:', data)
console.error('🔍 Debug Frontend - Erro no download PSD:', error)
```

### **2. Endpoint de Teste Criado**

**URL:** `/api/test-download`

**O que testa:**
- ✅ Autenticação do usuário
- ✅ Existência do usuário no banco
- ✅ Assinaturas ativas
- ✅ Produtos disponíveis
- ✅ Campos de arquivo (PSD, PDF, PNG)
- ✅ Logs de download
- ✅ Produtos com arquivo PSD

## 🔧 **Como Usar o Debug:**

### **1. Verificar Logs do Servidor:**
```bash
# No terminal onde está rodando npm run dev
# Os logs aparecerão com prefixo 🔍 Debug
```

### **2. Testar Endpoint de Debug:**
```bash
# Acesse no navegador (logado)
http://localhost:3001/api/test-download
```

### **3. Verificar Console do Navegador:**
```javascript
// Abra DevTools (F12) e veja a aba Console
// Os logs aparecerão com prefixo 🔍 Debug Frontend
```

## 🎯 **Possíveis Causas do Erro:**

### **1. Campo `arquivoPsd` não existe:**
```sql
-- Verificar se o campo foi criado
DESCRIBE Product;
```

### **2. Produto sem arquivo PSD:**
```typescript
// O produto pode não ter arquivoPsd preenchido
if (!(product as any).arquivoPsd) {
  return { error: 'Arquivo PSD não encontrado' }
}
```

### **3. Problema de permissão:**
```typescript
// Usuário pode não ter assinatura ativa
// Ou limite de downloads atingido
```

### **4. Problema no banco de dados:**
```typescript
// Erro na conexão ou schema incorreto
```

## 🧪 **Passos para Debug:**

### **Passo 1: Verificar Logs do Servidor**
1. **Abra o terminal** onde está rodando `npm run dev`
2. **Tente fazer download** de um arquivo PSD
3. **Observe os logs** com prefixo `🔍 Debug PSD API`

### **Passo 2: Testar Endpoint de Debug**
1. **Acesse** `/api/test-download` no navegador
2. **Verifique** se está logado
3. **Analise** a resposta JSON

### **Passo 3: Verificar Console do Navegador**
1. **Abra DevTools** (F12)
2. **Vá para aba Console**
3. **Tente fazer download** PSD
4. **Observe logs** com prefixo `🔍 Debug Frontend`

### **Passo 4: Verificar Banco de Dados**
1. **Abra Prisma Studio** (se disponível)
2. **Verifique tabela Product**
3. **Confirme** se campo `arquivoPsd` existe
4. **Verifique** se produtos têm arquivos PSD

## 🔍 **Logs Esperados:**

### **Sucesso:**
```
🔍 Debug PSD API - session: OK
🔍 Debug PSD API - product: { id: "...", name: "...", arquivoPsd: "..." }
🔍 Debug PSD API - arquivoPsd: "https://..."
🔍 Debug PSD API - Verificando acesso ao produto...
🔍 Debug PSD API - hasAccess: true
🔍 Debug PSD API - Verificando permissões de download...
🔍 Debug PSD API - permission: { canDownload: true, ... }
🔍 Debug PSD API - Registrando download...
🔍 Debug PSD API - Download registrado com sucesso
```

### **Erro:**
```
🔍 Debug PSD API - session: NULL
🔍 Debug PSD API - product: null
🔍 Debug PSD API - arquivoPsd: undefined
🔍 Debug PSD API - hasAccess: false
🔍 Debug PSD API - permission: { canDownload: false, reason: "..." }
```

## 🎉 **Resultado Esperado:**

Após implementar os logs de debug:

- ✅ **Logs detalhados** em cada etapa do processo
- ✅ **Identificação clara** de onde está o problema
- ✅ **Endpoint de teste** para verificar o sistema
- ✅ **Mensagens de erro** mais específicas
- ✅ **Debug completo** do fluxo de download

**Agora você pode identificar exatamente onde está o problema!** 🚀

Execute o teste e verifique os logs para descobrir a causa do erro. 