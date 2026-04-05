# 🚗 Uiatan Veículos — Site de Garagem Premium

Site completo para venda de veículos com painel administrativo, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e Prisma.

## ✨ Funcionalidades

### Site Público
- 🏠 Listagem de veículos com grid responsivo
- 🔍 Filtro por status (Disponível / Reservado / Vendido)
- 🚗 Página de detalhes com galeria de imagens (carousel)
- 💬 Botão WhatsApp com mensagem pré-preenchida
- 📱 100% responsivo (mobile + desktop)

### Painel Admin
- 🔐 Login com proteção de rotas (middleware)
- 📊 Dashboard com estatísticas do estoque
- ➕ Cadastro de veículos com upload de imagens
- ✏️ Edição completa de veículos
- 🔄 Alteração de status inline
- 🗑️ Exclusão de veículos

---

## 🚀 Como Rodar Localmente

### 1. Clone e instale as dependências

```bash
git clone <seu-repo>
cd uiatan-veiculos
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:

```env
DATABASE_URL="file:./dev.db"
ADMIN_EMAIL="admin@uiatanveiculos.com.br"
ADMIN_PASSWORD="suasenha"
SESSION_SECRET="uma-string-secreta-aleatoria-longa"
NEXT_PUBLIC_WHATSAPP_NUMBER="5553984385998"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configure o banco de dados

```bash
# Criar e migrar o banco (SQLite local)
npx prisma migrate dev --name init

# (Opcional) Popular com dados de exemplo
npm run db:seed
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

Painel admin: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🔑 Credenciais Admin Padrão

```
Email: admin@uiatanveiculos.com.br
Senha: admin123
```

> ⚠️ **Altere a senha** no arquivo `.env` antes de fazer deploy!

---

## 📦 Deploy na Vercel

### 1. Banco de dados em produção

Para produção, use **PostgreSQL** (recomendado: [Neon](https://neon.tech) — gratuito):

1. Crie uma conta no Neon
2. Crie um novo projeto
3. Copie a Connection String

### 2. Configure as variáveis na Vercel

No painel da Vercel → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ADMIN_EMAIL=seu@email.com
ADMIN_PASSWORD=senhaforte123
SESSION_SECRET=string-secreta-aleatoria-muito-longa
NEXT_PUBLIC_WHATSAPP_NUMBER=5553984385998
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

### 3. Altere o schema do Prisma para PostgreSQL

No arquivo `prisma/schema.prisma`, mude:

```prisma
datasource db {
  provider = "postgresql"  // ← mude de "sqlite" para "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Deploy

```bash
# Via CLI
npx vercel

# Ou conecte seu GitHub no painel da Vercel
```

Após o deploy, rode a migração:

```bash
npx vercel env pull .env.production.local
DATABASE_URL="sua-url-producao" npx prisma migrate deploy
```

---

## 🖼️ Upload de Imagens em Produção

Por padrão, as imagens são salvas localmente em `/public/uploads`. Na Vercel, o sistema de arquivos é **read-only**.

### Opção recomendada: Vercel Blob

1. No painel da Vercel → Storage → Create Blob Store
2. Adicione `BLOB_READ_WRITE_TOKEN` nas env vars
3. Instale: `npm install @vercel/blob`
4. Atualize `/app/api/upload/route.ts`:

```typescript
import { put } from '@vercel/blob';

// Substitua o writeFile por:
const blob = await put(uniqueName, buffer, { access: 'public' });
return NextResponse.json({ url: blob.url });
```

---

## 📁 Estrutura do Projeto

```
uiatan-veiculos/
├── app/
│   ├── page.tsx                     # Home pública
│   ├── veiculo/[id]/page.tsx        # Detalhes do veículo
│   ├── admin/
│   │   ├── login/page.tsx           # Login admin
│   │   └── (protected)/             # Rotas protegidas
│   │       ├── layout.tsx           # Layout com sidebar
│   │       ├── dashboard/           # Dashboard
│   │       └── veiculos/            # CRUD veículos
│   └── api/
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       └── upload/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── VehicleCard.tsx
│   ├── VehicleGallery.tsx
│   ├── VehicleForm.tsx
│   ├── AdminSidebar.tsx
│   └── StatusBadge.tsx
├── actions/
│   └── vehicles.ts                  # Server Actions CRUD
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
├── middleware.ts                    # Proteção de rotas admin
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Iniciar produção
npm run db:migrate   # Criar migração
npm run db:studio    # Prisma Studio (GUI do banco)
npm run db:seed      # Popular banco com dados exemplo
```

---

## 📞 Contato

**Uiatan Veículos** — Pelotas, Rio Grande do Sul  
WhatsApp: (53) 98438-5998
