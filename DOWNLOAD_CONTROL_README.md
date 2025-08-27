# Sistema de Controle de Downloads - Kadosh

## Visão Geral

Este sistema implementa um controle completo de downloads para usuários, baseado em seus planos de assinatura. Cada usuário tem limites diários e mensais de downloads, e o sistema rastreia todos os downloads para auditoria.

## Funcionalidades Implementadas

### 1. Controle de Acesso
- ✅ Verificação de autenticação obrigatória
- ✅ Validação de entitlements (permissões) por produto
- ✅ Verificação de assinatura ativa
- ✅ Controle de expiração de acesso

### 2. Limites de Download
- ✅ Limite diário configurável por plano
- ✅ Limite mensal configurável por plano
- ✅ Contagem em tempo real
- ✅ Bloqueio automático quando limites são atingidos

### 3. Rastreamento de Downloads
- ✅ Log completo de todos os downloads
- ✅ Informações do usuário, produto e arquivo
- ✅ Timestamp e metadados (IP, User-Agent)
- ✅ Estatísticas por tipo de arquivo

### 4. APIs Implementadas
- ✅ `/api/download/psd/[id]` - Download de arquivos PSD
- ✅ `/api/download/canva/[id]` - Download de arquivos Canva
- ✅ `/api/downloads/status` - Status dos downloads do usuário

## Estrutura do Banco de Dados

### Modelo DownloadLog
```prisma
model DownloadLog {
    id          String   @id @default(cuid())
    user        User     @relation(fields: [userId], references: [id])
    userId      String
    product     Product  @relation(fields: [productId], references: [id])
    productId   String
    assetType   AssetType // Tipo do arquivo (PSD, AI, SVG, etc.)
    fileSize    BigInt?  // Tamanho em bytes
    ipAddress   String?  // IP do usuário
    userAgent   String?  // User agent do navegador
    createdAt   DateTime @default(now())
}
```

### Campos Adicionados ao Modelo Plan
```prisma
model Plan {
    // ... campos existentes ...
    maxDownloadsPerMonth Int?   // Máximo por mês
    maxDownloadsPerDay   Int?   // Máximo por dia
}
```

## Configuração dos Planos

### Plano Básico
- Downloads por dia: 1
- Downloads por mês: 5
- Preço: R$ 97,00/mês

### Plano Profissional
- Downloads por dia: 5
- Downloads por mês: 150
- Preço: R$ 35,00/mês

### Plano Empresarial
- Downloads por dia: Ilimitado
- Downloads por mês: Ilimitado
- Preço: R$ 397,00/mês

## Como Usar

### 1. Executar Migração do Banco
```bash
# Gerar e aplicar as migrações
npx prisma migrate dev --name add-download-control

# Ou se preferir usar o schema diretamente
npx prisma db push
```

### 2. Atualizar Planos Existentes
```bash
# Executar o script de atualização
npx tsx scripts/update-plans-download-limits.ts
```

### 3. Testar o Sistema
1. Faça login com um usuário
2. Acesse o catálogo
3. Tente fazer downloads de produtos
4. Verifique o status dos downloads na interface

## Fluxo de Download

1. **Usuário clica em Download**
2. **Sistema verifica autenticação**
3. **Sistema verifica permissões do produto**
4. **Sistema verifica limites do plano**
5. **Se aprovado:**
   - Registra o download no log
   - Retorna URL do arquivo
   - Atualiza contadores
6. **Se negado:**
   - Retorna erro específico
   - Não registra download

## Monitoramento e Auditoria

### Consultas Úteis

#### Downloads por Usuário
```sql
SELECT 
  u.email,
  COUNT(*) as total_downloads,
  COUNT(CASE WHEN DATE(dl.createdAt) = CURDATE() THEN 1 END) as downloads_hoje
FROM DownloadLog dl
JOIN User u ON dl.userId = u.id
GROUP BY u.id, u.email
ORDER BY total_downloads DESC;
```

#### Downloads por Produto
```sql
SELECT 
  p.name as produto,
  COUNT(*) as total_downloads,
  COUNT(CASE WHEN DATE(dl.createdAt) = CURDATE() THEN 1 END) as downloads_hoje
FROM DownloadLog dl
JOIN Product p ON dl.productId = p.id
GROUP BY p.id, p.name
ORDER BY total_downloads DESC;
```

#### Usuários que Atingiram Limites
```sql
SELECT 
  u.email,
  s.planId,
  COUNT(CASE WHEN DATE(dl.createdAt) = CURDATE() THEN 1 END) as downloads_hoje,
  p.maxDownloadsPerDay
FROM User u
JOIN Subscription s ON u.id = s.userId
JOIN Plan p ON s.planId = p.id
JOIN DownloadLog dl ON u.id = dl.userId
WHERE DATE(dl.createdAt) = CURDATE()
GROUP BY u.id, u.email, s.planId, p.maxDownloadsPerDay
HAVING downloads_hoje >= p.maxDownloadsPerDay;
```

## Segurança

- ✅ Autenticação obrigatória
- ✅ Validação de permissões
- ✅ Rate limiting por usuário
- ✅ Log de IP e User-Agent
- ✅ Verificação de entitlements

## Próximos Passos

1. **Implementar download real dos arquivos** (atualmente retorna URLs)
2. **Adicionar notificações** quando limites são atingidos
3. **Dashboard administrativo** para monitoramento
4. **Relatórios automáticos** de uso
5. **Sistema de alertas** para uso excessivo

## Troubleshooting

### Erro: "Limite diário de downloads atingido"
- Verificar se o usuário tem assinatura ativa
- Verificar se o plano tem limite configurado
- Verificar se não há downloads duplicados

### Erro: "Você não tem acesso a este produto"
- Verificar se o usuário tem entitlement para o produto
- Verificar se o entitlement não expirou
- Verificar se a assinatura está ativa

### Erro: "Usuário não autenticado"
- Verificar se o usuário está logado
- Verificar se a sessão não expirou
- Verificar se o NextAuth está configurado corretamente 