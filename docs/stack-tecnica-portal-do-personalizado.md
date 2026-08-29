# Portal do Personalizado — TPO Embalagens
## Stack Técnica (v1.1 — aprovada)

**Baseado em:** PRD v2.1 + Modelo de Dados v1.5 + Roadmap de Módulos
**Status:** Aprovada pelo cliente — stack oficial do Módulo 0
**Data:** 29/08/2026

---

## 1. Critérios usados na escolha

- Tudo precisa rodar bem na **Vercel** (hospedagem já definida) e integrar de forma nativa com **GitHub** (fluxo branch → PR → preview → merge já definido no roadmap).
- Prioridade para ferramentas com boa curva de aprendizado e documentação madura, já que o desenvolvimento será modular e pode envolver mais de uma pessoa ao longo do tempo.
- Nada de infraestrutura própria para gerenciar (bancos, filas, storage) — tudo como serviço gerenciado, coerente com a decisão de manter tudo na infraestrutura Vercel.

---

## 2. Stack proposta

| Camada | Escolha | Por quê |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript | Framework oficial da Vercel, deploy zero-config, Server Components/Server Actions cobrem bem os CRUDs do Painel Admin sem precisar de uma API separada. |
| **Banco de dados** | Postgres via **Neon** (integração nativa no marketplace da Vercel — sucessora do antigo "Vercel Postgres") | Suporta **um branch de banco por Pull Request**, isolado da produção — encaixa perfeitamente no fluxo modular do roadmap: cada módulo em desenvolvimento testa com dados isolados, sem risco de afetar produção. |
| **ORM** | Prisma | Migrations versionadas (`prisma migrate`), schema único e legível para as ~13 entidades já modeladas, e o Prisma Studio ajuda a inspecionar dados durante o desenvolvimento sem precisar de outra ferramenta. |
| **Armazenamento de anexos** | **Vercel Blob** | Resolve a pendência "Postgres binário vs. Blob": Blob é feito para isso — upload direto do navegador (sem passar pelo servidor), URLs assinadas, custo menor e melhor performance do que guardar arquivos binários no Postgres. Suporta os até 20MB por arquivo definidos no PRD sem problema. |
| **Envio de e-mail** (token de login + notificações) | **Resend** + **React Email** | Resend é o parceiro oficial de e-mail da Vercel, boa entregabilidade. React Email permite escrever os templates (token, aprovação de cadastro, mudança de status etc.) como componentes React — reaproveita o mesmo conhecimento do front-end. |
| **Autenticação** | Implementação própria sobre a entidade `TOKEN_AUTENTICACAO` já modelada, com sessão via **cookie assinado (JWT com `jose`)** | O fluxo é bem específico (token numérico de 6 dígitos digitado pelo usuário, com bloqueio/desbloqueio) e não é o padrão "magic link" das bibliotecas prontas (como Auth.js) — compensa mais implementar direto sobre o modelo de dados que já existe do que adaptar uma lib pronta para um fluxo que ela não foi feita para. |
| **UI / Design system** | Tailwind CSS + shadcn/ui | Componentes acessíveis (Radix) e fáceis de customizar com a cor azul e tipografia (Baloo 2 + Manrope) já definidas nos wireframes — dá para chegar visualmente perto do que já foi aprovado. |
| **Formulários e validação** | React Hook Form + Zod | Mesmo schema de validação usado no formulário de autocadastro (client-side) e na Server Action que recebe os dados (server-side) — evita duplicar regra de validação. |
| **Testes** | Vitest (unitário) + Playwright (ponta a ponta) | Cobre desde regras de precificação/faixa de preço até o fluxo completo de cotação → aprovação → status, que é o coração do sistema. |
| **CI** | GitHub Actions (lint + testes no PR) | A própria Vercel já cuida do deploy/preview a cada PR; o GitHub Actions garante que só chega preview com o código passando nos testes. |

---

## 3. O que essa escolha já resolve das pendências em aberto

- **Vercel Postgres vs. Vercel Blob para os anexos** (pendência do roadmap, Módulo 4) → **resolvido: Vercel Blob.**
- **Templates de e-mail** (pendência do roadmap, Módulo 7) → tecnologia definida (React Email); falta só o conteúdo/redação de cada template, que pode ser feito quando chegarmos no Módulo 7.

---

## 4. Estrutura inicial de projeto (Módulo 0)

```
portal-do-personalizado/
├── app/                    # rotas (App Router) — cada painel como um grupo de rotas
│   ├── (auth)/             # login por token
│   ├── (admin)/            # Painel Admin
│   ├── (cotacao)/          # Painel de Cotação
│   └── (acompanhamento)/   # Painel de Acompanhamento
├── components/             # componentes de UI (shadcn/ui + customizados)
├── lib/
│   ├── db/                 # cliente Prisma
│   ├── auth/                # geração/validação de token, sessão
│   └── email/               # templates React Email + envio via Resend
├── prisma/
│   └── schema.prisma        # schema gerado a partir do Modelo de Dados v1.5
└── tests/
```

---

## 5. Próximo passo, se aprovado

1. Criar o repositório no GitHub.
2. Rodar `create-next-app` com TypeScript + Tailwind + App Router.
3. Conectar o repositório à Vercel (deploy automático a partir daí).
4. Adicionar as integrações Neon, Vercel Blob e Resend pelo marketplace da Vercel.
5. Traduzir o Modelo de Dados v1.5 para `schema.prisma` e rodar a primeira migration — isso fecha o Módulo 0.
