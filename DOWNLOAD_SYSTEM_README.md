# Sistema de Controle de Downloads

## Como Funciona

**Sistema extremamente simples:**

1. **Um único plano**: 5 downloads por dia
2. **Duas opções de pagamento**: Mensal ou Anual
3. **Controle automático**: Sistema verifica e bloqueia quando o limite é atingido

## Configuração

### 1. Executar o script de configuração
```bash
npx tsx scripts/setup-download-limits.ts
```

Isso criará:
- **Plano Mensal**: R$ 29,00 - 5 downloads/dia
- **Plano Anual**: R$ 290,00 - 5 downloads/dia

### 2. Estrutura do Banco

O sistema usa:
- `User` - Usuários cadastrados
- `Subscription` - Assinaturas ativas
- `Plan` - Planos (mensal/anual)
- `DownloadLog` - Registro de cada download
- `Product` - Produtos disponíveis

### 3. Regras de Negócio

- ✅ **Usuário com assinatura ativa**: Pode baixar até 5 arquivos por dia
- ❌ **Usuário sem assinatura**: Não pode baixar nada
- ❌ **Limite diário atingido**: Bloqueado até o próximo dia
- ❌ **Limite mensal atingido**: Bloqueado até o próximo mês

## APIs

### Download PSD
```
GET /api/download/psd/[id]
```

### Download Canva
```
GET /api/download/canva/[id]
```

### Status dos Downloads
```
GET /api/downloads/status
```

## Verificação de Permissões

O sistema verifica automaticamente:
1. Se o usuário está logado
2. Se tem assinatura ativa
3. Se não atingiu o limite diário (5 downloads)
4. Se não atingiu o limite mensal (150 downloads)

## Logs

Cada download é registrado com:
- Usuário que baixou
- Produto baixado
- Tipo de arquivo (PSD, ZIP, etc.)
- Data e hora
- IP e User Agent (opcional)

## Monitoramento

Para ver quantos downloads um usuário fez:
```sql
SELECT COUNT(*) FROM DownloadLog 
WHERE userId = 'user_id' 
AND createdAt >= CURDATE();
```

## Resumo

**Sistema simples e funcional:**
- 1 plano = 5 downloads/dia
- Controle automático de limites
- Logs completos para auditoria
- APIs seguras com autenticação 