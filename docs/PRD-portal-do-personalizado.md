# Portal do Personalizado — TPO Embalagens
## Documento de Requisitos (PRD)

**Cliente:** TPO Embalagens
**Projeto:** Portal do Personalizado
**Versão:** 2.1 — permissões Colaborador vs. Administrador definidas (última questão em aberto do PRD)
**Data:** 29/08/2026

---

## 1. Visão geral

A TPO Embalagens fabrica embalagens personalizadas e customizadas sob demanda para seus clientes B2B. O Portal do Personalizado é a plataforma que permitirá que esses clientes solicitem cotações e façam pedidos de embalagens diretamente, sem depender de contato manual (telefone, e-mail, planilha) para cada etapa do processo comercial.

O portal é composto por três painéis funcionais que compartilham a mesma base de usuários, autenticação e dados, mas atendem públicos e objetivos diferentes:

1. **Painel Admin** — backend interno da TPO, usado pela equipe para cadastrar clientes, produtos e preços, gerir cotações e pedidos, e aprovar ou recusar novos cadastros.
2. **Painel de Cotação** — onde o cliente (novo ou existente) solicita uma cotação, informando produto, quantidades e demais especificações.
3. **Painel de Acompanhamento** — onde o cliente acompanha o status do pedido (aprovado, em produção, etc.).

Todo acesso ao portal é restrito e autenticado por **e-mail + token enviado por e-mail** (sem senha).

---

## 2. Perfis de acesso

| Perfil | Descrição | Vínculo com MARCA |
|---|---|---|
| **Administrador** | Acesso total ao Painel Admin: cadastros, preços, criação de MARCAS, aprovação de clientes, gestão de cotações/pedidos, configurações gerais. | Não aplicável |
| **Colaborador** | Equipe interna da TPO com acesso ao Painel Admin **somente para visualização** (por ora): consulta cadastros, cotações, pedidos e preços, mas não altera nada nem aprova/recusa. O Administrador poderá conceder mais permissões ao Colaborador gradualmente, conforme necessário. | Não aplicável |
| **Visitante** | Estágio inicial de todo **cliente novo**. Tem acesso apenas ao **Painel de Cotação**, mas ainda não possui cotações nem pedidos — é o status anterior à aprovação/promoção para Comprador (ver seção 4.1 e 5.1). | Não aplicável (ainda não vinculado) |
| **Comprador Padrão** | Representa um usuário de um cliente B2B. Faz cotações e pedidos em nome da MARCA à qual está vinculado, vendo apenas as próprias cotações/pedidos. | **Obrigatório** |
| **Comprador Gerente** | Mesmas permissões do Comprador Padrão (pode cotar e pedir), **mais** a visualização de todas as cotações e pedidos feitos por qualquer comprador da mesma MARCA. | **Obrigatório** |

### 2.1 Agrupamento por MARCA

- Uma **MARCA** representa a empresa/cliente da TPO Embalagens.
- Todo **comprador**, ao ser cadastrado, deve obrigatoriamente estar vinculado a uma MARCA.
- Todo **produto**, ao ser cadastrado, deve obrigatoriamente estar vinculado a uma MARCA (o produto pertence/é destinado a uma marca específica).
- Uma MARCA pode ter **múltiplos compradores** vinculados — ou seja, várias pessoas da mesma empresa cliente podem fazer cotações e pedidos em nome dessa MARCA.
- **Visibilidade dentro da MARCA (definido):** um **Comprador Padrão** vê apenas as próprias cotações e pedidos. Um **Comprador Gerente** vê todas as cotações e pedidos de todos os compradores vinculados à sua MARCA, além de poder comprar normalmente como um comprador padrão.
- **Atribuição do subtipo Gerente (definido):** é o **Administrador** quem define se um comprador é Padrão ou Gerente, e essa definição é feita **depois** que o cadastro do cliente já existe (não no ato do cadastro) — ou seja, pode ser alterada posteriormente. Uma MARCA pode ter **mais de um Comprador Gerente**.
- Apenas o **Administrador** pode criar uma MARCA e vincular MARCAS a compradores, produtos, etc. (ver seção 4.1).

---

## 3. Autenticação

- **Sem senha.** O acesso é validado por:
  1. Usuário informa o e-mail cadastrado.
  2. Sistema envia um **token numérico de autenticação por e-mail**.
  3. Usuário informa o token para concluir o login.
- Aplica-se a todos os perfis (administrador, colaborador, visitante, comprador padrão, comprador gerente).

### 3.1 Regras do token (definido)

| Regra | Valor |
|---|---|
| Formato | Numérico |
| Validade | 5 minutos |
| Reenvio | Botão de reenvio liberado a cada 120 segundos |
| Bloqueio | Após 5 tentativas incorretas |
| Desbloqueio | Automático, após 15 minutos |

---

## 4. Painel Admin (backend)

Público: administradores e colaboradores da TPO Embalagens.

### 4.1 Funcionalidades principais

**Regra geral de permissões (definido):** o **Administrador pode fazer tudo** no Painel Admin — cadastrar e alterar Marcas, Produtos, Preços, Compradores, aprovar/recusar cadastros e mudar o status de qualquer cotação/pedido. O **Colaborador**, por ora, **só visualiza** essas telas — não cria nem altera nada. O Administrador poderá liberar mais permissões ao Colaborador aos poucos, conforme a operação evoluir (ver seção 9).

- **Cadastro de MARCAS**: criação e manutenção dos dados da empresa cliente. **Exclusivo do Administrador** — nem colaborador nem comprador podem criar uma MARCA.
- **Vinculação de compradores e produtos a MARCAS**: também exclusivo do Administrador, que associa cada comprador e cada produto à MARCA correspondente.
- **Cadastro de compradores**: vinculação obrigatória do comprador a uma MARCA existente; definição se o comprador é Padrão ou Gerente. Exclusivo do Administrador.
- **Cadastro de produtos**: vinculação obrigatória do produto a uma MARCA; especificações do produto (dimensões, material, acabamento, etc. — a detalhar). Exclusivo do Administrador.
- **Cadastro de preços**: tabela de preços por produto (e possivelmente por faixa de quantidade — a confirmar), usada no cálculo automático de cotações (ver seção 6). Exclusivo do Administrador.
- **Aprovação/recusa de cadastro de cliente novo**: quando um Visitante solicita acesso pelo portal (fluxo de autocadastro) ou quando um cadastro é iniciado diretamente pela equipe da TPO (ver seção 5.1), o **Administrador** revisa e aprova ou recusa a promoção do usuário para Comprador. O Colaborador pode visualizar a fila de cadastros pendentes, mas não aprovar/recusar por enquanto.
- **Gestão de cotações**: visualização das cotações recebidas por todos (Admin e Colaborador), com cálculo automático de preço sugerido (produto + quantidade — ver seção 6). A **revisão e o ajuste de preço são exclusivos do Administrador** por enquanto.
- **Gestão de pedidos**: visualização do status por todos (Admin e Colaborador); a **atualização manual do status** ao longo das 12 etapas do processo (seção 6.2) é **exclusiva do Administrador** por enquanto.

---

## 5. Painel de Cotação

Público: compradores (clientes novos ou existentes).

### 5.1 Fluxo

**Entrada de cliente novo — dois caminhos possíveis (definido):**

- **A) Autocadastro pelo portal**: o interessado preenche um formulário público e entra como **Visitante**, com acesso apenas ao Painel de Cotação, ainda sem poder efetivar cotações ou pedidos. **Campos do formulário (definido):**

  | Bloco | Campos |
  |---|---|
  | Dados do comprador | Nome completo, CPF, WhatsApp, E-mail |
  | Dados da empresa | Razão social, CNPJ, Marca (nome/indicação da MARCA pretendida), Endereço completo, Nicho do estabelecimento (múltipla escolha, mais de uma opção pode ser marcada) |

  **Opções do campo "Nicho do estabelecimento" (definido):** Oriental, Pizzaria, Hamburgueria, Confeitaria, Salgados, Esfiha, Refeições, Pastelaria, Marmitas, Padaria, Carnes.

- **B) Cadastro feito pela TPO**: a equipe cadastra o cliente diretamente pelo Painel Admin, já vinculando-o a uma MARCA.

Em ambos os casos, o **Administrador aprova** o cadastro (seção 4.1) para promover o usuário de Visitante para **Comprador** (Padrão ou Gerente), vinculado formalmente a uma MARCA.

**Solicitação de cotação (usuário já Comprador):**

1. Comprador acessa via login por token (seção 3).
2. Comprador preenche a **solicitação de cotação**, informando:
   - Produto desejado — **ambos os caminhos são permitidos (definido)**: a partir do catálogo já cadastrado para sua MARCA, **ou** especificação livre de um produto novo (sob medida).
   - Quantidade.
   - Demais especificações (dimensões, material, acabamento, prazo desejado, etc. — a detalhar).
   - **Anexos (definido, obrigatório):** o comprador deve anexar arquivos junto da solicitação — arte, logo, identidade da marca, foto da embalagem de referência. Vale tanto para produto do catálogo quanto para produto sob especificação. **Tipos aceitos:** todos os formatos de imagem e de documento. **Tamanho máximo:** 20MB por arquivo. **Armazenamento:** na infraestrutura Vercel, junto com o restante do sistema.
3. Sistema calcula automaticamente um **preço sugerido** quando o produto já está cadastrado com preço, com base em produto + quantidade (ver seção 6). Para produtos novos/sob especificação, ainda sem preço cadastrado, a precificação não pode ser automática — cai direto para avaliação manual do Admin, com retorno ao cliente em até **5 dias úteis** (ver nota na seção 6.1).
4. Cotação é enviada para revisão de um administrador/colaborador antes de ser confirmada ao cliente (ver seção 6).
5. Cada cotação recebe um **número sequencial** ao ser criada (formato definido na seção 6.1).

---

## 6. Fluxo de Cotação → Pedido

### 6.1 Regra definida

- O sistema **calcula automaticamente** um preço sugerido para a cotação, com base **apenas em produto + quantidade** (sem considerar prazo, acabamento, frete, etc. nesta fórmula).
- O **Administrador revisa** essa cotação (podendo ajustar o preço, prazo ou condições) antes de ela ser confirmada/enviada de volta ao cliente. O Colaborador pode visualizar a cotação, mas não alterar preço ou condições por enquanto.
- Após revisão e aprovação interna, a cotação é disponibilizada ao comprador, que pode aceitá-la e convertê-la em **pedido**.
- **Exceção — produto sob especificação (novo, sem cadastro prévio):** como o Painel de Cotação permite pedir um produto fora do catálogo (seção 5.1), nesses casos não há preço cadastrado para o cálculo automático rodar. A cotação segue direto para precificação manual do Admin, sem etapa de sugestão automática, com **retorno ao cliente em até 5 dias úteis**.
- **Faixas de preço por quantidade (definido):** cada produto do catálogo pode ter mais de uma faixa de preço conforme a quantidade — ex.: 1.000 unidades a R$ 1,00/un, 2.000 unidades a R$ 0,95/un. O cálculo automático usa a faixa correspondente à quantidade informada pelo comprador.
- **Número da cotação (definido):** prefixo fixo **"10"** + **5 dígitos sequenciais**, sem separador — ex.: `1000146`.

### 6.2 Estados definidos (fluxo único, da cotação ao recebimento) — v2

| Ordem | Fase | Status |
|---|---|---|
| 1 | Cotação | Em cotação |
| 2 | Cotação | Em cotação: Aguardando aprovação |
| 3 | Aprovação | Em aprovação: Protótipo 3D |
| 4 | Aprovação | Em aprovação: Protótipo físico |
| 5 | Financeiro | Financeiro: Aguardando liberação |
| 6 | Financeiro | Financeiro: Liberado |
| 7 | Produção | Pré produção |
| 8 | Produção | Em produção |
| 9 | Produção | Em expedição |
| 10 | Produção | Pronto para envio |
| 11 | Entrega | Enviado |
| 12 | Entrega | Recebido |

- **Alteração de status (definido):** sempre **manual**, feita pelo **Administrador** — o Colaborador pode visualizar o status, mas não alterá-lo por enquanto. Não há transição automática entre esses status.
- Esse é o mesmo status exibido ao comprador no Painel de Acompanhamento (seção 7).
- **Nota de leitura:** tratei os itens no formato "Fase: Etapa" (ex.: "Financeiro: Liberado") como o nome completo do status — mantendo os 12 como estados únicos em sequência, agrupados visualmente por fase. Se a intenção era outra (ex.: fase e etapa como dois campos independentes, com combinações possíveis), me avise para ajustar o modelo.

---

## 7. Painel de Acompanhamento

Público: compradores (Padrão e Gerente).

- Permite ao cliente consultar o status atual de suas cotações/pedidos (conforme os 12 estados definidos na seção 6.2).
- **Visibilidade (definido):** Comprador Padrão vê apenas os próprios pedidos; Comprador Gerente vê todos os pedidos da sua MARCA (ver seção 2.1).
- Deve refletir em tempo (quase) real as atualizações feitas pela equipe no Painel Admin.
- **Notificações por e-mail (definido):** todos os eventos relevantes disparam e-mail ao cliente — cotação calculada/pronta, cotação revisada, pedido confirmado, aprovado, mudança de status de produção, conclusão/expedição, etc. (lista exata de eventos e templates a detalhar na fase técnica).

---

## 8. Entidades de dados (visão inicial)

| Entidade | Descrição | Relacionamentos-chave |
|---|---|---|
| **Usuário** | Pessoa com acesso ao portal (e-mail, perfil de acesso) | Perfil: admin / colaborador / visitante / comprador (padrão ou gerente) |
| **Marca** | Empresa cliente da TPO. Só pode ser criada pelo Administrador. | 1:N com Compradores; 1:N com Produtos; 1:N com Cotações/Pedidos |
| **Comprador** | Usuário do tipo comprador, com subtipo Padrão ou Gerente | N:1 com Marca (obrigatório) |
| **Produto** | Embalagem personalizada cadastrada, ou solicitada sob especificação em uma cotação | N:1 com Marca (obrigatório quando cadastrado no catálogo); 1:N com Tabela de Preço |
| **Preço** | Regra de precificação de um produto (produto + quantidade) | N:1 com Produto |
| **Cotação** | Solicitação de orçamento feita por um comprador; pode referenciar um produto do catálogo ou uma especificação livre | N:1 com Comprador; N:1 com Marca; 1:N com Itens de Cotação |
| **Pedido** | Cotação convertida em pedido confirmado | 1:1 (origem) com Cotação; N:1 com Marca |

*(Modelo preliminar — a ser refinado em uma etapa de modelagem de dados dedicada.)*

---

## 9. Questões em aberto

Todas as questões levantadas ao longo do PRD foram **definidas** e incorporadas às seções acima — incluindo, por último, as permissões de Colaborador vs. Administrador (seção 4.1: Administrador faz tudo, Colaborador por ora só visualiza). Não há questões de escopo/regra de negócio em aberto neste momento; os pontos remanescentes são de detalhe técnico (ver modelo de dados, seção 4).

---

## 10. Próximos passos sugeridos

1. ~~Resolver as questões em aberto (seção 9)~~ — concluído nesta versão.
2. Detalhar o modelo de dados (entidades, atributos e regras de negócio) com mais profundidade, incluindo os subtipos de Comprador.
3. Produzir wireframes das telas principais de cada painel (incluindo a tela de autocadastro/Visitante e o login por token numérico).
4. Definir a stack técnica e a arquitetura do sistema (autenticação por token, envio de e-mail transacional, motor de precificação produto+quantidade). **Infraestrutura já indicada:** GitHub (versionamento/repositório) + Vercel (hospedagem, deploy e armazenamento dos anexos).
5. **Desenvolvimento por módulos (definido):** o projeto será dividido em módulos, desenvolvidos e implantados (deploy) um por um via GitHub + Vercel — ver o roadmap de módulos em documento próprio.
