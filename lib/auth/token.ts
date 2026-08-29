import { randomInt } from "crypto";

/** Regras do token (PRD v2.1, seção 3.1 / Modelo de Dados v1.5, 2.12). */
export const TOKEN_VALIDADE_MINUTOS = 5;
export const TOKEN_REENVIO_COOLDOWN_SEGUNDOS = 120;
export const TOKEN_MAX_TENTATIVAS = 5;
export const TOKEN_BLOQUEIO_MINUTOS = 15;

/** Gera um token numérico de 6 dígitos (com zero à esquerda, se necessário). */
export function gerarCodigoToken(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function calcularExpiracao(criadoEm: Date): Date {
  return new Date(criadoEm.getTime() + TOKEN_VALIDADE_MINUTOS * 60_000);
}

export function calcularDesbloqueio(bloqueadoEm: Date): Date {
  return new Date(bloqueadoEm.getTime() + TOKEN_BLOQUEIO_MINUTOS * 60_000);
}

export function podeReenviar(reenviadoEm: Date | null): boolean {
  if (!reenviadoEm) return true;
  const decorridos = (Date.now() - reenviadoEm.getTime()) / 1000;
  return decorridos >= TOKEN_REENVIO_COOLDOWN_SEGUNDOS;
}

// TODO (Módulo 1): persistir/consultar TokenAutenticacao via Prisma,
// enviar o código por e-mail (Resend) e implementar a sessão (JWT com `jose`).
