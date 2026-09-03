"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { obterSessaoAdmin } from "@/lib/auth/session";

export type EstadoCliente = {
  ok: boolean;
  erro?: string;
} | null;

const CAMINHO_CLIENTES = "/admin/clientes";

// ---------------------------------------------------------------------------
// Cadastro direto pela TPO (PRD v2.1, seção 5.1, caminho B).
// ---------------------------------------------------------------------------

const clienteTpoSchema = z.object({
  nomeCompleto: z.string().trim().min(1, "Informe o nome completo."),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  cpf: z.string().trim().min(1, "Informe o CPF."),
  whatsapp: z.string().trim().min(1, "Informe o WhatsApp."),
  marcaId: z.string().trim().min(1, "Selecione a marca."),
});

/**
 * Cadastro direto pela TPO — a equipe já sabe a qual Marca o cliente
 * pertence, então o vínculo é feito de cara. Ainda assim nasce como
 * `visitante` + `pendente_aprovacao` (mesma regra do autocadastro): o PRD
 * define que, em ambos os caminhos, é o Administrador quem aprova a
 * promoção para Comprador (seção 5.1) — aqui isso normalmente acontece
 * logo em seguida, na mesma fila de aprovação.
 */
export async function cadastrarClienteTPO(
  _estadoAnterior: EstadoCliente,
  formData: FormData
): Promise<EstadoCliente> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode cadastrar clientes." };
  }

  const parsed = clienteTpoSchema.safeParse({
    nomeCompleto: formData.get("nomeCompleto"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    whatsapp: formData.get("whatsapp"),
    marcaId: formData.get("marcaId"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await prisma.usuario.create({
      data: {
        ...parsed.data,
        perfil: "visitante",
        origemCadastro: "cadastro_tpo",
        statusCadastro: "pendente_aprovacao",
      },
    });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") {
      return { ok: false, erro: "Já existe um usuário com esse e-mail." };
    }
    throw erro;
  }

  revalidatePath(CAMINHO_CLIENTES);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Fila de aprovação/recusa.
// ---------------------------------------------------------------------------

const aprovarSchema = z.object({
  usuarioId: z.string().trim().min(1),
  marcaId: z.string().trim().min(1, "Selecione a marca."),
  subtipoComprador: z.enum(["padrao", "gerente"]),
});

/**
 * Aprova um cadastro pendente, promovendo o Usuario de `visitante` para
 * `comprador` (Modelo de Dados v1.5, seção 2.2 — regra de transição).
 * Vale tanto para autocadastro quanto para cadastro direto pela TPO.
 */
export async function aprovarCadastro(
  _estadoAnterior: EstadoCliente,
  formData: FormData
): Promise<EstadoCliente> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode aprovar cadastros." };
  }

  const parsed = aprovarSchema.safeParse({
    usuarioId: formData.get("usuarioId"),
    marcaId: formData.get("marcaId"),
    subtipoComprador: formData.get("subtipoComprador"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { usuarioId, marcaId, subtipoComprador } = parsed.data;

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      perfil: "comprador",
      statusCadastro: "aprovado",
      marcaId,
      subtipoComprador,
      aprovadoPorId: sessao.usuarioId,
      dataAprovacao: new Date(),
    },
  });

  // TODO (Módulo 7): disparar e-mail `cadastro_aprovado` para o cliente.
  revalidatePath(CAMINHO_CLIENTES);
  return { ok: true };
}

/** Recusa um cadastro pendente. Exclusivo do Administrador. */
export async function recusarCadastro(usuarioId: string) {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    throw new Error("Apenas o Administrador pode recusar cadastros.");
  }

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      statusCadastro: "recusado",
      ativo: false,
      aprovadoPorId: sessao.usuarioId,
      dataAprovacao: new Date(),
    },
  });

  // TODO (Módulo 7): disparar e-mail `cadastro_recusado` para o cliente.
  revalidatePath(CAMINHO_CLIENTES);
}

// ---------------------------------------------------------------------------
// Edição de Comprador já aprovado (subtipo e Marca podem mudar a qualquer
// momento — PRD v2.1, seção 2.1).
// ---------------------------------------------------------------------------

const atualizarCompradorSchema = z.object({
  usuarioId: z.string().trim().min(1),
  marcaId: z.string().trim().min(1, "Selecione a marca."),
  subtipoComprador: z.enum(["padrao", "gerente"]),
});

export async function atualizarComprador(
  _estadoAnterior: EstadoCliente,
  formData: FormData
): Promise<EstadoCliente> {
  const sessao = await obterSessaoAdmin();
  if (!sessao) {
    return { ok: false, erro: "Apenas o Administrador pode editar compradores." };
  }

  const parsed = atualizarCompradorSchema.safeParse({
    usuarioId: formData.get("usuarioId"),
    marcaId: formData.get("marcaId"),
    subtipoComprador: formData.get("subtipoComprador"),
  });
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { usuarioId, marcaId, subtipoComprador } = parsed.data;

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { marcaId, subtipoComprador },
  });

  revalidatePath(CAMINHO_CLIENTES);
  return { ok: true };
}
