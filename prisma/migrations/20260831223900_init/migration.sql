-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('administrador', 'colaborador', 'visitante', 'comprador');

-- CreateEnum
CREATE TYPE "SubtipoComprador" AS ENUM ('padrao', 'gerente');

-- CreateEnum
CREATE TYPE "OrigemCadastro" AS ENUM ('autocadastro', 'cadastro_tpo');

-- CreateEnum
CREATE TYPE "StatusCadastro" AS ENUM ('pendente_aprovacao', 'aprovado', 'recusado');

-- CreateEnum
CREATE TYPE "TipoPrecificacao" AS ENUM ('automatica', 'manual');

-- CreateEnum
CREATE TYPE "StatusCotacao" AS ENUM ('em_cotacao', 'em_cotacao_aguardando_aprovacao', 'em_aprovacao_prototipo_3d', 'em_aprovacao_prototipo_fisico', 'financeiro_aguardando_liberacao', 'financeiro_liberado', 'pre_producao', 'em_producao', 'em_expedicao', 'pronto_para_envio', 'enviado', 'recebido');

-- CreateEnum
CREATE TYPE "FaseCotacao" AS ENUM ('cotacao', 'aprovacao', 'financeiro', 'producao', 'entrega');

-- CreateEnum
CREATE TYPE "TipoEventoNotificacao" AS ENUM ('cadastro_aprovado', 'cadastro_recusado', 'cotacao_calculada', 'cotacao_revisada', 'mudanca_status');

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "nome_marca" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "endereco_completo" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "whatsapp" TEXT,
    "perfil" "Perfil" NOT NULL,
    "subtipo_comprador" "SubtipoComprador",
    "marca_id" TEXT,
    "origem_cadastro" "OrigemCadastro" NOT NULL,
    "status_cadastro" "StatusCadastro" NOT NULL DEFAULT 'pendente_aprovacao',
    "aprovado_por_id" TEXT,
    "data_aprovacao" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_cadastro" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "nome_marca_pretendida" TEXT NOT NULL,
    "endereco_completo" TEXT NOT NULL,
    "data_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacoes_cadastro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nichos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "nichos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_cadastro_nichos" (
    "solicitacao_cadastro_id" TEXT NOT NULL,
    "nicho_id" TEXT NOT NULL,

    CONSTRAINT "solicitacoes_cadastro_nichos_pkey" PRIMARY KEY ("solicitacao_cadastro_id","nicho_id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faixas_preco" (
    "id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade_minima" INTEGER NOT NULL,
    "quantidade_maxima" INTEGER,
    "preco_unitario" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "faixas_preco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotacoes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "comprador_id" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "status" "StatusCotacao" NOT NULL DEFAULT 'em_cotacao',
    "status_fase" "FaseCotacao" NOT NULL DEFAULT 'cotacao',
    "tipo_precificacao" "TipoPrecificacao" NOT NULL,
    "prazo_retorno_manual" TIMESTAMP(3),
    "valor_total_sugerido" DECIMAL(12,2),
    "valor_total_final" DECIMAL(12,2),
    "revisado_por_id" TEXT,
    "data_solicitacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_ultima_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_cotacao" (
    "id" TEXT NOT NULL,
    "cotacao_id" TEXT NOT NULL,
    "produto_id" TEXT,
    "descricao_livre" TEXT,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario_sugerido" DECIMAL(12,4),
    "preco_unitario_final" DECIMAL(12,4),

    CONSTRAINT "itens_cotacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status" (
    "id" TEXT NOT NULL,
    "cotacao_id" TEXT NOT NULL,
    "status_anterior" "StatusCotacao",
    "status_novo" "StatusCotacao" NOT NULL,
    "alterado_por_id" TEXT NOT NULL,
    "data_alteracao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anexos" (
    "id" TEXT NOT NULL,
    "cotacao_id" TEXT NOT NULL,
    "item_cotacao_id" TEXT,
    "nome_arquivo" TEXT NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "tamanho_bytes" INTEGER NOT NULL,
    "url_arquivo" TEXT NOT NULL,
    "enviado_por_id" TEXT NOT NULL,
    "data_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anexos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_autenticacao" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "tentativas_invalidas" INTEGER NOT NULL DEFAULT 0,
    "bloqueado_ate" TIMESTAMP(3),
    "reenviado_em" TIMESTAMP(3),

    CONSTRAINT "tokens_autenticacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes_email" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "cotacao_id" TEXT,
    "tipo_evento" "TipoEventoNotificacao" NOT NULL,
    "enviado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marcas_cnpj_key" ON "marcas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_cadastro_usuario_id_key" ON "solicitacoes_cadastro"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "nichos_nome_key" ON "nichos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "cotacoes_numero_key" ON "cotacoes"("numero");

-- AddForeignKey
ALTER TABLE "marcas" ADD CONSTRAINT "marcas_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_aprovado_por_id_fkey" FOREIGN KEY ("aprovado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_cadastro" ADD CONSTRAINT "solicitacoes_cadastro_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_cadastro_nichos" ADD CONSTRAINT "solicitacoes_cadastro_nichos_solicitacao_cadastro_id_fkey" FOREIGN KEY ("solicitacao_cadastro_id") REFERENCES "solicitacoes_cadastro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_cadastro_nichos" ADD CONSTRAINT "solicitacoes_cadastro_nichos_nicho_id_fkey" FOREIGN KEY ("nicho_id") REFERENCES "nichos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faixas_preco" ADD CONSTRAINT "faixas_preco_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_revisado_por_id_fkey" FOREIGN KEY ("revisado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cotacao" ADD CONSTRAINT "itens_cotacao_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_cotacao" ADD CONSTRAINT "itens_cotacao_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status" ADD CONSTRAINT "historico_status_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status" ADD CONSTRAINT "historico_status_alterado_por_id_fkey" FOREIGN KEY ("alterado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_item_cotacao_id_fkey" FOREIGN KEY ("item_cotacao_id") REFERENCES "itens_cotacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anexos" ADD CONSTRAINT "anexos_enviado_por_id_fkey" FOREIGN KEY ("enviado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_autenticacao" ADD CONSTRAINT "tokens_autenticacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes_email" ADD CONSTRAINT "notificacoes_email_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes_email" ADD CONSTRAINT "notificacoes_email_cotacao_id_fkey" FOREIGN KEY ("cotacao_id") REFERENCES "cotacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
