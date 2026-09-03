"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";

export type EstadoAutocadastro = {
  ok: boolean;
  erro?: string;
} | null;

const autocadastroSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe o nome completo."),
  cpf: z.string().trim().min(1, "Informe o CPF."),
  whatsapp: z.string().trim().min(1, "Informe o WhatsApp."),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  razaoSocial: z.string().trim().min(1, "Informe a razão social."),
  cnpj: z.string().trim().min(1, "Informe o CNPJ."),
  nomeMarcaPretendida: z.string().trim().min(1, "Informe o nome da marca."),
  enderecoCompleto: z.string().trim().min(1, "Informe o endereço completo."),
  nichoIds: z
    .array(z.string().trim().min(1))
    .min(1, "Selecione ao menos um nicho do estabelecimento."),
});

/**
 * Autocadastro público (PRD v2.1, seção 5.1, caminho A). Sem sessão — é a
 * porta de entrada de qualquer novo cliente. Cria o Usuario como
 * `visitante` + `pendente_aprovacao` (Modelo de Dados v1.5, seção 2.2) e a
 * SolicitacaoCadastro com os dados da empresa e os nichos selecionados.
 * A vinculação a uma MARCA de verdade só acontece quando o Administrador
 * aprovar o cadastro (Módulo 3 — fila de aprovação).
 */
export async function enviarAutocadastro(
  _estadoAnterior: EstadoAutocadastro,
  formData: FormData
): Promise<EstadoAutocadastro> {
  const parsed = autocadastroSchema.safeParse({
    nomeCompleto: formData.get("nomeCompleto"),
    cpf: formData.get("cpf"),
    whatsapp: formData.get("whatsapp"),
    email: formData.get("email"),
    razaoSocial: formData.get("razaoSocial"),
    cnpj: formData.get("cnpj"),
    nomeMarcaPretendida: formData.get("nomeMarcaPretendida"),
    enderecoCompleto: formData.get("enderecoCompleto"),
    nichoIds: formData.getAll("nichoIds"),
  });

  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const {
    nomeCompleto,
    cpf,
    whatsapp,
    email,
    razaoSocial,
    cnpj,
    nomeMarcaPretendida,
    enderecoCompleto,
    nichoIds,
  } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nomeCompleto,
          cpf,
          whatsapp,
          email,
          perfil: "visitante",
          origemCadastro: "autocadastro",
          statusCadastro: "pendente_aprovacao",
        },
      });

      const solicitacao = await tx.solicitacaoCadastro.create({
        data: {
          usuarioId: usuario.id,
          razaoSocial,
          cnpj,
          nomeMarcaPretendida,
          enderecoCompleto,
        },
      });

      await tx.solicitacaoCadastroNicho.createMany({
        data: nichoIds.map((nichoId) => ({
          solicitacaoCadastroId: solicitacao.id,
          nichoId,
        })),
      });
    });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return { ok: false, erro: "Já existe um cadastro com esse e-mail." };
    }
    throw erro;
  }

  // Nenhum e-mail é disparado aqui: o PRD v2.1 (seção 7) escopa as
  // notificações por e-mail do Módulo 7 para eventos voltados ao cliente
  // (aprovação/recusa de cadastro, cotação calculada/revisada, mudança de
  // status) — um alerta interno para o Administrador sobre novo cadastro
  // pendente não está no escopo definido.
  return { ok: true };
}
