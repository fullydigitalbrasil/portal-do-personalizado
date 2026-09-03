"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { obterSessaoAdmin } from "@/lib/auth/session";

export type EstadoProduto = {
  ok: boolean;
  erro?: string;
} | null;

const produtoSchema = z.object({
  marcaId: z.string().trim().min(1, "Selecione a marca."),
  nome: z.string().trim().min(1, "Informe o nome do produto."),
  descricao: z.string().trim().optional(),
});

function parseProdutoForm(formData: FormData) {
  return produtoSchema.safeParse({
    marcaId: formData.get("marcaId"),
    nome: formData.get("nome"),
    descricao: formData.get("descricao") || undefined,
  });
}

/** Cadastro de PRODUTO — exclusivo do Administrador, sempre vinculado a uma MARCA. */
export async function criarProduto(
  _estadoAnterior: EstadoProduto,
  formData: FormData
): Promise<EstadoProduto> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode cadastrar produtos." };
  }

  const parsed = parseProdutoForm(formData);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.produto.create({ data: parsed.data });

  revalidatePath("/admin/produtos");
  return { ok: true };
}

/** Edição de PRODUTO — exclusiva do Administrador. */
export async function atualizarProduto(
  _estadoAnterior: EstadoProduto,
  formData: FormData
): Promise<EstadoProduto> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode editar produtos." };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, erro: "Produto inválido." };
  }

  const parsed = parseProdutoForm(formData);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.produto.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  return { ok: true };
}

/** Ativa/desativa um PRODUTO — exclusiva do Administrador. */
export async function alternarAtivoProduto(id: string, ativo: boolean) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    throw new Error("Apenas o Administrador pode ativar/desativar produtos.");
  }

  await prisma.produto.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
}
