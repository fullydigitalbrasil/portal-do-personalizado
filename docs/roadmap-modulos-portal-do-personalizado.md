# Portal do Personalizado — TPO Embalagens
## Roadmap de Desenvolvimento por Módulos

**Baseado em:** PRD v2.1 + Modelo de Dados v1.5
**Infraestrutura:** GitHub (repositório e versionamento) + Vercel (deploy e hospedagem)
**Data:** 29/08/2026

---

## 1. Como pensamos a divisão

Cada módulo abaixo é uma fatia **entregável e testável** do sistema — dá para desenvolver, revisar e subir para a Vercel um de cada vez, sem depender que o projeto inteiro esteja pronto. A ordem sugerida segue a dependência natural entre eles (ex.: não dá para ter Cotação sem antes ter Produto/Preço cadastrado), mas a ordem pode ser reorganizada conforme sua prioridade de negócio.

**Fluxo sugerido no GitHub + Vercel:**
1. Cada módulo vira uma branch (ex.: `modulo-2-marcas-produtos`).
2. Ao abrir o Pull Request, a Vercel gera automaticamente uma **preview URL** daquele módulo para você validar antes de aprovar.
3. Ao aprovar e fazer merge na `main`, a Vercel publica a versão em produção.
4. O próximo módulo parte do que já está em produção — assim o sistema vai crescendo em cima do que já foi validado.

---

## 2. Módulos

### Módulo 0 — Fundação técnica
Setup do repositório no GitHub, projeto base (framework a definir) conectado à Vercel, primeiro deploy (página inicial simples), estrutura inicial do banco de dados (Usuário, Marca). Sem isso, nenhum outro módulo roda.

### Módulo 1 — Autenticação
Login por e-mail + token numérico (sem senha): envio do token por e-mail, tela de digitação do código, validade de 5 min, reenvio a cada 120s, bloqueio após 5 tentativas com desbloqueio automático em 15 min. Base de perfis de acesso (Administrador, Colaborador, Visitante, Comprador).
*Wireframe: tela Login.*

### Módulo 2 — Marcas, Produtos e Preços (Painel Admin)
CRUD de MARCA (exclusivo do Administrador), CRUD de Produto vinculado obrigatoriamente a uma Marca, Faixas de Preço por quantidade.
*Wireframe: tela Cadastro de Marca/Produto/Preço.*

### Módulo 3 — Cadastro e Aprovação de Clientes
Formulário público de autocadastro (Visitante, com os campos e o campo "Nicho do estabelecimento"), cadastro direto pela TPO, fila de aprovação/recusa pelo Admin/Colaborador, promoção do Visitante a Comprador (Padrão ou Gerente).
*Wireframe: telas Autocadastro e Admin Dashboard (bloco de aprovações).*

### Módulo 4 — Painel de Cotação (Comprador)
Nova solicitação de cotação: produto do catálogo ou sob especificação, anexos obrigatórios (imagem/documento, até 20MB), cálculo automático de preço sugerido (produto + quantidade). Numeração sequencial da cotação.
*Wireframe: tela Nova Cotação.*

### Módulo 5 — Gestão de Cotações (Painel Admin)
Fila de cotações aguardando revisão, precificação manual (produto sob especificação, retorno em até 5 dias úteis), ajuste de preço, avanço manual pelas 12 etapas de status (5 fases: Cotação, Aprovação, Financeiro, Produção, Entrega), histórico de mudanças.
*Wireframe: tela Detalhe de Cotação (Admin).*

### Módulo 6 — Painel de Acompanhamento (Comprador)
Listagem de cotações/pedidos com status atual, filtro por fase, visibilidade diferenciada (Comprador Padrão vê só os próprios; Comprador Gerente vê todos da Marca).
*Wireframe: tela Acompanhamento.*

### Módulo 7 — Notificações por E-mail
Templates e disparo automático para todos os eventos do ciclo de vida da cotação (cadastro aprovado/recusado, cotação calculada, mudança de cada status, etc.).

### Módulo 8 — Ajustes finais e dashboard consolidado
Dashboard do Admin com indicadores (cadastros pendentes, cotações a revisar, pedidos em produção, etc.), refinamentos de UX com base na revisão dos wireframes, testes ponta a ponta antes da virada definitiva em produção.

---

## 3. Pendências que ainda podem afetar módulos específicos

- **Templates de e-mail** — afeta o Módulo 7.
- **Vercel Postgres vs. Vercel Blob para os anexos** — afeta o Módulo 4.

Não bloqueiam o início do desenvolvimento, mas vale fechar antes de chegar no módulo correspondente.

> **Resolvido:** Permissões Colaborador vs. Administrador (afetava os Módulos 2, 3 e 5) — definido que, por ora, o Administrador pode fazer tudo e o Colaborador tem acesso apenas de visualização em todo o Painel Admin, com mais permissões a serem liberadas depois pelo próprio Administrador.

---

## 4. Sequência de módulos — validada

**Confirmado:** seguimos com a ordem sugerida (Módulo 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8), sem divisões ou fusões adicionais entre módulos.

---

## 5. Próximo passo

Início do **Módulo 0 — Fundação técnica**: setup do repositório no GitHub, escolha do framework, primeiro projeto conectado à Vercel com deploy inicial, e estrutura inicial do banco de dados (Usuário, Marca).
