"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { encontrarFaixaAplicavel, calcularPrazoRetornoManual } from "@/lib/cotacao/precificacao";
import { notificarCotacaoCalculada } from "@/lib/email/notificacoes";

export type ResultadoCotacao =
  | { ok: true; numero: string }
  | { ok: false; erro: string };

const anexoSchema = z.object({
  nomeArquivo: z.string().trim().min(1),
  tipoArquivo: z.string().trim().min(1),
  tamanhoBytes: z
    .number()
    .int()
    .positive()
    .max(20 * 1024 * 1024, "Cada anexo deve ter no máximo 20MB."),
  urlArquivo: z.string().trim().url(),
});

const criarCotacaoSchema = z
  .object({
    produtoId: z.string().trim().min(1).optional(),
    descricaoLivre: z.string().trim().min(1).optional(),
    quantidade: z.coerce.number().int().positive("Informe uma quantidade válida."),
    anexos: z.array(anexoSchema).min(1, "Anexe ao menos um arquivo."),
  })
  .refine((d) => Boolean(d.produtoId) !== Boolean(d.descricaoLivre), {
    message: "Escolha um produto do catálogo OU descreva um produto sob especificação.",
    path: ["produtoId"],
  });

export type CriarCotacaoInput = z.input<typeof criarCotacaoSchema>;

/** Gera o próximo número sequencial da Cotacao — "10" + 5 dígitos (PRD v2.1, 6.1). */
async function gerarProximoNumero(tx: Prisma.TransactionClient): Promise<string> {
  // Trava a tabela para serializar a geração do número dentro da
  // transação — evita duas cotações concorrentes gerando o mesmo número.
  // Volume esperado (portal B2B) não justifica uma sequência dedicada.
  await tx.$executeRawUnsafe(`LOCK TABLE cotacoes IN SHARE ROW EXCLUSIVE MODE`);

  const ultima = await tx.cotacao.findFirst({
    orderBy: { numero: "desc" },
    select: { numero: true },
  });

  const ultimoSequencial = ultima ? parseInt(ultima.numero.slice(2), 10) : 0;
  const proximoSequencial = ultimoSequencial + 1;
  return `10${String(proximoSequencial).padStart(5, "0")}`;
}

/**
 * Cria uma nova Cotacao a partir do Painel de Cotação (PRD v2.1, seção 5.1).
 * Chamada diretamente do cliente (useTransition), não via <form action>,
 * porque os anexos já foram enviados ao Vercel Blob antes desta chamada —
 * ver app/api/cotacao-upload/route.ts.
 */
export async function criarCotacao(dados: CriarCotacaoInput): Promise<ResultadoCotacao> {
  const sessao = await obterSessao();
  if (!sessao || sessao.perfil !== "comprador" || !sessao.marcaId) {
    return { ok: false, erro: "Apenas Compradores aprovados podem solicitar cotações." };
  }

  const parsed = criarCotacaoSchema.safeParse(dados);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { produtoId, descricaoLivre, quantidade, anexos } = parsed.data;
  const marcaId = sessao.marcaId;

  let precoUnitarioSugerido: string | null = null;
  let valorTotalSugerido: string | null = null;
  let tipoPrecificacao: "automatica" | "manual" = "manual";
  let prazoRetornoManual: Date | null = null;
  let nomeProduto = descricaoLivre ?? "";

  if (produtoId) {
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      include: { faixasPreco: true },
    });

    if (!produto || !produto.ativo || produto.marcaId !== marcaId) {
      return { ok: false, erro: "Produto inválido para a sua Marca." };
    }

    nomeProduto = produto.nome;

    const faixa = encontrarFaixaAplicavel(produto.faixasPreco, quantidade);
    if (faixa) {
      tipoPrecificacao = "automatica";
      precoUnitarioSugerido = faixa.precoUnitario.toString();
      valorTotalSugerido = faixa.precoUnitario.times(quantidade).toString();
    } else {
      // Sem faixa cadastrada para essa quantidade — cai para manual.
      prazoRetornoManual = calcularPrazoRetornoManual();
    }
  } else {
    // Produto sob especificação: sempre precificação manual.
    prazoRetornoManual = calcularPrazoRetornoManual();
  }

  const cotacaoCriada = await prisma.$transaction(async (tx) => {
    const numeroGerado = await gerarProximoNumero(tx);

    const cotacao = await tx.cotacao.create({
      data: {
        numero: numeroGerado,
        compradorId: sessao.usuarioId,
        marcaId,
        tipoPrecificacao,
        prazoRetornoManual,
        valorTotalSugerido,
        itens: {
          create: {
            produtoId: produtoId ?? null,
            descricaoLivre: descricaoLivre ?? null,
            quantidade,
            precoUnitarioSugerido,
          },
        },
        anexos: {
          create: anexos.map((anexo) => ({
            nomeArquivo: anexo.nomeArquivo,
            tipoArquivo: anexo.tipoArquivo,
            tamanhoBytes: anexo.tamanhoBytes,
            urlArquivo: anexo.urlArquivo,
            enviadoPorId: sessao.usuarioId,
          })),
        },
      },
    });

    return cotacao;
  });

  // cotacao_calculada só faz sentido quando já existe um valor sugerido de
  // cara (precificação automática) — no caso manual, o "momento e-mail" é
  // mais adiante, quando o Administrador revisa o preço (cotacao_revisada).
  if (tipoPrecificacao === "automatica" && valorTotalSugerido) {
    await notificarCotacaoCalculada({
      usuarioId: sessao.usuarioId,
      cotacaoId: cotacaoCriada.id,
      to: sessao.email,
      nome: sessao.nomeCompleto,
      numero: cotacaoCriada.numero,
      nomeProduto,
      quantidade,
      valorFormatado: formatarMoeda(valorTotalSugerido),
    });
  }

  return { ok: true, numero: cotacaoCriada.numero };
}

function formatarMoeda(valor: string): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor)
  );
}
