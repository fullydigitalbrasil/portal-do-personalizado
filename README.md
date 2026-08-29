# Portal do Personalizado — TPO Embalagens

Scaffold do **Módulo 0 (Fundação técnica)** do roadmap do projeto. Stack completa em
`docs/stack-tecnica-portal-do-personalizado.md` (ou no doc do projeto Claude).

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (componentes-base já incluídos em `components/ui/`)
- **Prisma** como ORM, schema em `prisma/schema.prisma` (traduzido do Modelo de Dados v1.5)
- **Postgres via Neon** (integração nativa da Vercel)
- **Vercel Blob** para os anexos das cotações
- **Resend + React Email** para os e-mails (token de login e notificações)

## Passo a passo para colocar no ar

1. **Criar o repositório no GitHub** e enviar este código:
   ```bash
   git remote add origin <url-do-seu-repositorio>
   git push -u origin main
   ```

2. **Importar o repositório na Vercel** (vercel.com → Add New → Project).

3. **Adicionar as integrações pelo marketplace da Vercel** (aba Integrations do projeto):
   - **Neon** (Postgres) — cria automaticamente a variável `DATABASE_URL`.
   - **Vercel Blob** — cria automaticamente `BLOB_READ_WRITE_TOKEN`.
   - **Resend** — cria automaticamente `RESEND_API_KEY`.

4. **Configurar as variáveis de ambiente localmente:**
   ```bash
   cp .env.example .env.local
   # preencha DATABASE_URL, BLOB_READ_WRITE_TOKEN, RESEND_API_KEY e SESSION_SECRET
   ```

5. **Instalar dependências e gerar o Prisma Client:**
   ```bash
   npm install
   npx prisma generate
   ```

6. **Rodar a primeira migration** (cria as tabelas no Neon a partir do schema):
   ```bash
   npx prisma migrate dev --name init
   ```

7. **Rodar localmente:**
   ```bash
   npm run dev
   ```

## Estrutura de pastas

```
app/
├── (auth)/login/              # Módulo 1 — login por token
├── (admin)/admin/dashboard/   # Módulo 2, 3, 5, 8 — Painel Admin
├── autocadastro/              # Módulo 3 — autocadastro público
├── (cotacao)/nova-cotacao/    # Módulo 4 — Painel de Cotação
└── (acompanhamento)/          # Módulo 6 — Painel de Acompanhamento
components/ui/                 # base shadcn/ui (Button, Input, Card, Table, Select, Dialog, Tabs...)
lib/
├── db/client.ts                # cliente Prisma (singleton)
├── auth/token.ts                # regras do token (validade, bloqueio, reenvio)
└── email/resend.ts              # cliente Resend
prisma/schema.prisma            # schema — todas as ~13 entidades do Modelo de Dados v1.5
```

Cada página já criada tem comentários `TODO (Módulo N)` marcando exatamente o que falta
implementar naquele módulo do roadmap — é o ponto de partida para o Módulo 1 em diante.

## Observações desta versão inicial

- Os componentes de `components/ui/` foram criados manualmente seguindo o padrão do
  shadcn/ui (o CLI oficial não pôde ser usado no ambiente onde este scaffold foi gerado,
  que bloqueia o domínio `ui.shadcn.com`). Funcionam normalmente; para adicionar novos
  componentes depois, `npx shadcn@latest add <componente>` deve funcionar sem problema
  numa máquina com acesso irrestrito à internet.
- Por esse mesmo tipo de bloqueio de rede, **não foi possível rodar `prisma generate` /
  `prisma validate`** neste ambiente (o Prisma baixa o engine binário de
  `binaries.prisma.sh`). O schema foi revisado manualmente; rode o passo 5 acima assim que
  clonar o projeto para validar e gerar o client de verdade.
- `npm audit` acusa vulnerabilidades em dependências transitivas do **Prisma CLI**
  (pacotes `@prisma/dev`/`hono`, usados apenas pelas ferramentas de desenvolvimento da
  Prisma, não pelo runtime da aplicação). Vale revisar com `npm audit` antes de ir para
  produção, mas não bloqueia o desenvolvimento.
- Autenticação, upload de anexos, precificação automática e templates de e-mail ainda
  não têm lógica implementada — são o conteúdo dos Módulos 1, 4, 5 e 7, respectivamente.
