# HD Designer Website

Sistema completo de website para designer de interiores com autenticação, planos e pagamentos.

## 🚀 Funcionalidades

- ✅ Sistema de autenticação (cadastro/login)
- ✅ Páginas de planos com preços
- ✅ Sistema de checkout simplificado
- ✅ Interface para seleção de planos
- ✅ Banco de dados com Prisma
- ✅ Interface moderna com Tailwind CSS

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- MySQL ou PostgreSQL

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd hd-designer-website
```

2. Instale as dependências:
```bash
npm install --legacy-peer-deps
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o arquivo `.env`:
```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"

# JWT Secret
JWT_SECRET="sua-chave-secreta-jwt-aqui"

# Next.js
NEXTAUTH_SECRET="seu-secret-nextauth-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Configurações adicionais (se necessário)
# Adicione outras variáveis de ambiente conforme necessário
```

5. Configure o banco de dados:
```bash
npx prisma db push
npx prisma generate
```

6. Execute o projeto:
```bash
npm run dev
```

## 🔑 Configuração

Para usar em produção, você precisa:

1. Configurar seu banco de dados
2. Definir as variáveis de ambiente necessárias
3. Configurar autenticação JWT

## 📱 Uso

1. **Cadastro**: Acesse `/auth/register` para criar uma conta
2. **Login**: Acesse `/auth/login` para fazer login
3. **Planos**: Acesse `/plans` para ver os planos disponíveis
4. **Checkout**: Clique em "Começar Agora" para ir ao pagamento
5. **Checkout**: Complete o processo de assinatura

## 🏗️ Estrutura do Projeto

```
app/
├── api/                    # APIs do backend
│   ├── auth/              # Autenticação
│   ├── checkout/          # Processamento de assinaturas
├── auth/                  # Páginas de autenticação
├── checkout/              # Página de pagamento
├── plans/                 # Página de planos
└── catalog/               # Catálogo de produtos

components/                 # Componentes reutilizáveis
prisma/                    # Schema e configuração do banco
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados
- Proteção contra CSRF

## 🚧 Desenvolvimento

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM
- **Interface**: Componentes reutilizáveis

## 📄 Licença

Este projeto está sob a licença MIT. # kadoshDesigner
# kadosh
# kadosh
