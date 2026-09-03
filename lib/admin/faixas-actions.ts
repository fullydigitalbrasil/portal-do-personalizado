"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { obterSessaoAdmin } from "@/lib/auth/session";

export type EstadoFaixa = {
  ok: boolean;
  erro?: string;
} | null;

const faixaSchema = z
  .object({
    produtoId: z.string().trim().min(1),
    quantidadeMinima: z.coerce.number().int().positive("A quantidade mínima deve ser maior que zero."),
    quantidadeMaxima: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? Number(v) : null)),
    precoUnitario: z.coerce.number().positive("O preço deve ser maior que zero."),
  })
  .refine(
    (d) => d.quantidadeMaxima === null || d.quantidadeMaxima > d.quantidadeMinima,
    { message: "A quantidade máxima deve ser maior que a mínima.", path: ["quantidadeMaxima"] }
  );

function parseFaixaForm(formData: FormData) {
  return faixaSchema.safeParse({
    produtoId: formData.get("produtoId"),
    quantidadeMinima: formData.get("quantidadeMinima"),
    quantidadeMaxima: formData.get("quantidadeMaxima"),
    precoUnitario: formData.get("precoUnitario"),
  });
}

/**
 * Faixas de preço por quantidade (PRD v2.1, regra #11 / Modelo de Dados 2.7).
 * Ex.: 1.000un a R$1,00; 2.000un a R$0,95. Cadastro exclusivo do Administrador.
 */
export async function criarFaixaPreco(
  _estadoAnterior: EstadoFaixa,
  formData: FormData
): Promise<EstadoFaixa> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode cadastrar faixas de preço." };
  }

  const parsed = parseFaixaForm(formData);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { produtoId, quantidadeMinima, quantidadeMaxima, precoUnitario } = parsed.data;

  await prisma.faixaPreco.create({
    data: { produtoId, quantidadeMinima, quantidadeMaxima, precoUnitario },
  });

  revalidatePath(`/admin/produtos/${produtoId}`);
  return { ok: true };
}

export async function atualizarFaixaPreco(
  _estadoAnterior: EstadoFaixa,
  formData: FormData
): Promise<EstadoFaixa> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode editar faixas de preço." };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, erro: "Faixa de preço inválida." };
  }

  const parsed = parseFaixaForm(formData);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { produtoId, quantidadeMinima, quantidadeMaxima, precoUnitario } = parsed.data;

  await prisma.faixaPreco.update({
    where: { id },
    data: { quantidadeMinima, quantidadeMaxima, precoUnitario },
  });

  revalidatePath(`/admin/produtos/${produtoId}`);
  return { ok: true };
}

export async function excluirFaixaPreco(id: string, produtoId: string) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    throw new Error("Apenas o Administrador pode excluir faixas de preço.");
  }

  await prisma.faixaPreco.delete({ where: { id } });
  revalidatePath(`/admin/produtos/${produtoId}`);
}
