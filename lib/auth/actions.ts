"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db/client";
import { sendLoginToken } from "@/lib/email/resend";
import { criarSessao, encerrarSessao } from "@/lib/auth/session";
import { rotaPosLogin } from "@/lib/auth/constants";
import {
  TOKEN_MAX_TENTATIVAS,
  calcularDesbloqueio,
  calcularExpiracao,
  gerarCodigoToken,
  podeReenviar,
} from "@/lib/auth/token";

export type EstadoSolicitarToken = {
  ok: boolean;
  erro?: string;
} | null;

export type EstadoVerificarToken = {
  ok: boolean;
  erro?: string;
} | null;

const emailSchema = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

function segundosRestantes(alvo: Date): number {
  return Math.max(0, Math.ceil((alvo.getTime() - Date.now()) / 1000));
}

/**
 * Passo 1 do login: recebe o e-mail, gera (ou reenvia) o token e dispara o
 * e-mail. Regras (PRD v2.1, 3.1): validade de 5 min, reenvio a cada 120s,
 * bloqueio após 5 tentativas inválidas com desbloqueio automático em 15 min.
 */
export async function solicitarToken(
  _estadoAnterior: EstadoSolicitarToken,
  formData: FormData
): Promise<EstadoSolicitarToken> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "E-mail inválido." };
  }
  const email = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo) {
    return {
      ok: false,
      erro: "Não encontramos um cadastro ativo com esse e-mail.",
    };
  }

  const tokenAtual = await prisma.tokenAutenticacao.findFirst({
    where: { usuarioId: usuario.id },
    orderBy: { criadoEm: "desc" },
  });

  const agora = new Date();

  if (tokenAtual?.bloqueadoAte && tokenAtual.bloqueadoAte > agora) {
    const min = Math.ceil((tokenAtual.bloqueadoAte.getTime() - agora.getTime()) / 60_000);
    return {
      ok: false,
      erro: `Muitas tentativas incorretas. Tente novamente em ${min} minuto(s).`,
    };
  }

  const tokenAindaValido = tokenAtual && tokenAtual.expiraEm > agora;

  if (tokenAindaValido) {
    // Já existe um código pendente — isso é um "reenviar", sujeito ao cooldown de 120s.
    const ultimoEnvio = tokenAtual.reenviadoEm ?? tokenAtual.criadoEm;
    if (!podeReenviar(ultimoEnvio)) {
      return {
        ok: false,
        erro: `Aguarde ${segundosRestantes(
          new Date(ultimoEnvio.getTime() + 120_000)
        )}s para reenviar o código.`,
      };
    }

    const novoCodigo = gerarCodigoToken();
    await prisma.tokenAutenticacao.update({
      where: { id: tokenAtual.id },
      data: {
        codigo: novoCodigo,
        expiraEm: calcularExpiracao(agora),
        reenviadoEm: agora,
        tentativasInvalidas: 0,
      },
    });
    await sendLoginToken({ to: usuario.email, nome: usuario.nomeCompleto, codigo: novoCodigo });
  } else {
    // Sem token pendente (primeiro pedido, ou o anterior expirou) — cria um novo.
    const novoCodigo = gerarCodigoToken();
    await prisma.tokenAutenticacao.create({
      data: {
        usuarioId: usuario.id,
        codigo: novoCodigo,
        expiraEm: calcularExpiracao(agora),
      },
    });
    await sendLoginToken({ to: usuario.email, nome: usuario.nomeCompleto, codigo: novoCodigo });
  }

  redirect(`/login/verificar?email=${encodeURIComponent(email)}`);
}

const codigoSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "O código tem 6 dígitos.");

/** Passo 2 do login: confirma o código de 6 dígitos e abre a sessão. */
export async function verificarToken(
  _estadoAnterior: EstadoVerificarToken,
  formData: FormData
): Promise<EstadoVerificarToken> {
  const emailParsed = emailSchema.safeParse(formData.get("email"));
  const codigoParsed = codigoSchema.safeParse(formData.get("codigo"));

  if (!emailParsed.success) {
    return { ok: false, erro: "Sessão de login inválida — volte e informe o e-mail de novo." };
  }
  if (!codigoParsed.success) {
    return { ok: false, erro: codigoParsed.error.issues[0]?.message ?? "Código inválido." };
  }

  const email = emailParsed.data;
  const codigo = codigoParsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo) {
    return { ok: false, erro: "Não encontramos um cadastro ativo com esse e-mail." };
  }

  const tokenAtual = await prisma.tokenAutenticacao.findFirst({
    where: { usuarioId: usuario.id },
    orderBy: { criadoEm: "desc" },
  });

  const agora = new Date();

  if (!tokenAtual) {
    return { ok: false, erro: "Nenhum código pendente. Solicite um novo." };
  }

  if (tokenAtual.bloqueadoAte && tokenAtual.bloqueadoAte > agora) {
    const min = Math.ceil((tokenAtual.bloqueadoAte.getTime() - agora.getTime()) / 60_000);
    return {
      ok: false,
      erro: `Muitas tentativas incorretas. Tente novamente em ${min} minuto(s).`,
    };
  }

  if (tokenAtual.expiraEm <= agora) {
    return { ok: false, erro: "O código expirou. Solicite um novo." };
  }

  if (tokenAtual.codigo !== codigo) {
    const tentativas = tokenAtual.tentativasInvalidas + 1;
    const bloqueado = tentativas >= TOKEN_MAX_TENTATIVAS;

    await prisma.tokenAutenticacao.update({
      where: { id: tokenAtual.id },
      data: {
        tentativasInvalidas: tentativas,
        bloqueadoAte: bloqueado ? calcularDesbloqueio(agora) : null,
      },
    });

    if (bloqueado) {
      return {
        ok: false,
        erro: "Muitas tentativas incorretas. Tente novamente em 15 minutos.",
      };
    }
    return {
      ok: false,
      erro: `Código incorreto. Tentativa ${tentativas} de ${TOKEN_MAX_TENTATIVAS}.`,
    };
  }

  // Código correto: invalida o token (evita reuso) e abre a sessão.
  await prisma.tokenAutenticacao.update({
    where: { id: tokenAtual.id },
    data: { expiraEm: agora },
  });

  await criarSessao({
    usuarioId: usuario.id,
    perfil: usuario.perfil,
    subtipoComprador: usuario.subtipoComprador,
    marcaId: usuario.marcaId,
    nomeCompleto: usuario.nomeCompleto,
    email: usuario.email,
  });

  redirect(rotaPosLogin(usuario.perfil));
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}
