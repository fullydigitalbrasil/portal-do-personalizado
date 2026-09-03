"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { obterSessaoAdmin } from "@/lib/auth/session";
import { faseDoStatus, STATUS_COTACAO_ORDEM } from "@/lib/cotacao/status";

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
    include: { itens: true },
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

  // TODO (Módulo 7): disparar e-mail `cotacao_revisada` para o comprador.
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

  const cotacao = await prisma.cotacao.findUnique({ where: { id: cotacaoId } });
  if (!cotacao) {
    return { ok: false, erro: "Cotação não encontrada." };
  }
  if (cotacao.status === novoStatus) {
    return { ok: false, erro: "A cotação já está nesse status." };
  }

  await prisma.$transaction([
    prisma.cotacao.update({
      where: { id: cotacaoId },
      data: {
        status: novoStatus as typeof cotacao.status,
        statusFase: faseDoStatus(novoStatus as typeof cotacao.status),
      },
    }),
    prisma.historicoStatus.create({
      data: {
        cotacaoId,
        statusAnterior: cotacao.status,
        statusNovo: novoStatus as typeof cotacao.status,
        alteradoPorId: sessao.usuarioId,
      },
    }),
  ]);

  // TODO (Módulo 7): disparar e-mail `mudanca_status` para o comprador.
  caminhosCotacao(cotacaoId);
  return { ok: true };
}
