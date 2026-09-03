import type { Perfil, SubtipoComprador } from "@prisma/client";

// Compartilhado entre lib/auth/session.ts (Server Actions/Components, via
// next/headers) e proxy.ts (roda em Edge, lê o cookie direto do request) —
// por isso fica num arquivo neutro, sem "server-only" nem "next/headers".
export const SESSION_COOKIE_NAME = "portal_session";

export type SessionPayload = {
  usuarioId: string;
  perfil: Perfil;
  subtipoComprador: SubtipoComprador | null;
  marcaId: string | null;
  nomeCompleto: string;
  email: string;
};

/** Rota de destino após login, ou ao tentar acessar uma área sem permissão. */
export function rotaPosLogin(perfil: Perfil): string {
  switch (perfil) {
    case "administrador":
    case "colaborador":
      return "/admin/dashboard";
    case "visitante":
      // PRD 2.1: Visitante só tem acesso ao Painel de Cotação até ser aprovado.
      return "/nova-cotacao";
    case "comprador":
    default:
      return "/acompanhamento";
  }
}
