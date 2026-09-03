"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { obterSessaoAdmin } from "@/lib/auth/session";

export type EstadoMarca = {
  ok: boolean;
  erro?: string;
} | null;

const marcaSchema = z.object({
  nomeMarca: z.string().trim().min(1, "Informe o nome da marca."),
  razaoSocial: z.string().trim().min(1, "Informe a razão social."),
  cnpj: z.string().trim().min(1, "Informe o CNPJ."),
  enderecoCompleto: z.string().trim().min(1, "Informe o endereço completo."),
});

function parseMarcaForm(formData: FormData) {
  return marcaSchema.safeParse({
    nomeMarca: formData.get("nomeMarca"),
    razaoSocial: formData.get("razaoSocial"),
    cnpj: formData.get("cnpj"),
    enderecoCompleto: formData.get("enderecoCompleto"),
  });
}

/** Criação de MARCA — exclusiva do Administrador (PRD v2.1, regra de negócio #2). */
export async function criarMarca(
  _estadoAnterior: EstadoMarca,
  formData: FormData
): Promise<EstadoMarca> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode cadastrar marcas." };
  }

  const parsed = parseMarcaForm(formData);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const cnpjEmUso = await prisma.marca.findUnique({ where: { cnpj: parsed.data.cnpj } });
  if (cnpjEmUso) {
    return { ok: false, erro: "Já existe uma marca cadastrada com esse CNPJ." };
  }

  await prisma.marca.create({
    data: { ...parsed.data, criadoPorId: sessao.usuarioId },
  });

  revalidatePath("/admin/marcas");
  return { ok: true };
}

/** Edição de MARCA — exclusiva do Administrador. */
export async function atualizarMarca(
  _estadoAnterior: EstadoMarca,
  formData: FormData
): Promise<EstadoMarca> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode editar marcas." };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, erro: "Marca inválida." };
  }

  const parsed = parseMarcaForm(formData);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const cnpjEmUso = await prisma.marca.findFirst({
    where: { cnpj: parsed.data.cnpj, NOT: { id } },
  });
  if (cnpjEmUso) {
    return { ok: false, erro: "Já existe outra marca cadastrada com esse CNPJ." };
  }

  await prisma.marca.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/marcas");
  return { ok: true };
}

/** Ativa/desativa uma MARCA — exclusiva do Administrador. */
export async function alternarAtivaMarca(id: string, ativa: boolean) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    throw new Error("Apenas o Administrador pode ativar/desativar marcas.");
  }

  await prisma.marca.update({ where: { id }, data: { ativa } });
  revalidatePath("/admin/marcas");
}
