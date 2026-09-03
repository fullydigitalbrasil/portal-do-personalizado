"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { obterSessaoAdmin } from "@/lib/auth/session";
import { faseDoStatus, labelDoStatus, LABEL_FASE, STATUS_COTACAO_ORDEM } from "@/lib/cotacao/status";
import { notificarCotacaoRevisada, notificarMudancaStatus } from "@/lib/email/notificacoes";

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export type EstadoCotacaoAdmin = {
  ok: boolean;
  erro?: string;
} | null;

const STATUS_VALIDOS = STATUS_COTACAO_ORDEM.map((s) => s.status) as [string, ...string[]];

function caminhosCotacao(id: string) {
  revalidatePath("/admin/cotacoes");
  revalidatePath(`/admin/cotacoes/${id}`);
}

// ---------------------------------------------------------------------------
// Revisão/ajuste de preço (PRD v2.1, seção 6.1) — exclusiva do Administrador.
// ---------------------------------------------------------------------------

const revisarPrecoSchema = z.object({
  cotacaoId: z.string().trim().min(1),
  precoUnitarioFinal: z.coerce.number().positive("Informe um preço válido."),
});

export async function revisarPreco(
  _estadoAnterior: EstadoCotacaoAdmin,
  formData: FormData
): Promise<EstadoCotacaoAdmin> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode revisar preços." };
  }

  const parsed = revisarPrecoSchema.safeParse({
    cotacaoId: formData.get("cotacaoId"),
    precoUnitarioFinal: formData.get("precoUnitarioFinal"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { cotacaoId, precoUnitarioFinal } = parsed.data;

  const cotacao = await prisma.cotacao.findUnique({
    where: { id: cotacaoId },
    include: { itens: true, comprador: { select: { nomeCompleto: true, email: true } } },
  });
  if (!cotacao) {
    return { ok: false, erro: "Cotação não encontrada." };
  }
  const item = cotacao.itens[0];
  if (!item) {
    return { ok: false, erro: "Cotação sem item — não é possível precificar." };
  }

  const valorTotalFinal = precoUnitarioFinal * item.quantidade;

  await prisma.$transaction([
    prisma.itemCotacao.update({
      where: { id: item.id },
      data: { precoUnitarioFinal },
    }),
    prisma.cotacao.update({
      where: { id: cotacaoId },
      data: {
        valorTotalFinal,
        revisadoPorId: sessao.usuarioId,
      },
    }),
  ]);

  await notificarCotacaoRevisada({
    usuarioId: cotacao.compradorId,
    cotacaoId,
    to: cotacao.comprador.email,
    nome: cotacao.comprador.nomeCompleto,
    numero: cotacao.numero,
    valorFormatado: formatarMoeda(valorTotalFinal),
  });

  caminhosCotacao(cotacaoId);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Mudança manual de status (PRD v2.1, seção 6.2) — exclusiva do
// Administrador; nunca automática. Toda mudança fica registrada em
// HistoricoStatus.
// ---------------------------------------------------------------------------

const alterarStatusSchema = z.object({
  cotacaoId: z.string().trim().min(1),
  novoStatus: z.enum(STATUS_VALIDOS),
});

export async function alterarStatusCotacao(
  _estadoAnterior: EstadoCotacaoAdmin,
  formData: FormData
): Promise<EstadoCotacaoAdmin> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode alterar o status." };
  }

  const parsed = alterarStatusSchema.safeParse({
    cotacaoId: formData.get("cotacaoId"),
    novoStatus: formData.get("novoStatus"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { cotacaoId, novoStatus } = parsed.data;

  const cotacao = await prisma.cotacao.findUnique({
    where: { id: cotacaoId },
    include: { comprador: { select: { nomeCompleto: true, email: true } } },
  });
  if (!cotacao) {
    return { ok: false, erro: "Cotação não encontrada." };
  }
  if (cotacao.status === novoStatus) {
    return { ok: false, erro: "A cotação já está nesse status." };
  }

  const novoStatusTipado = novoStatus as typeof cotacao.status;

  await prisma.$transaction([
    prisma.cotacao.update({
      where: { id: cotacaoId },
      data: {
        status: novoStatusTipado,
        statusFase: faseDoStatus(novoStatusTipado),
      },
    }),
    prisma.historicoStatus.create({
      data: {
        cotacaoId,
        statusAnterior: cotacao.status,
        statusNovo: novoStatusTipado,
        alteradoPorId: sessao.usuarioId,
      },
    }),
  ]);

  await notificarMudancaStatus({
    usuarioId: cotacao.compradorId,
    cotacaoId,
    to: cotacao.comprador.email,
    nome: cotacao.comprador.nomeCompleto,
    numero: cotacao.numero,
    statusLabel: labelDoStatus(novoStatusTipado),
    faseLabel: LABEL_FASE[faseDoStatus(novoStatusTipado)],
  });

  caminhosCotacao(cotacaoId);
  return { ok: true };
}
