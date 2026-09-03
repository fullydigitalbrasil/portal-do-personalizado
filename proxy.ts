import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { SESSION_COOKIE_NAME, rotaPosLogin, type SessionPayload } from "@/lib/auth/constants";

// Next.js 16 renomeou middleware.ts para proxy.ts (mesmo comportamento).
// Roda antes de renderizar as rotas protegidas — ver `matcher` no fim do
// arquivo. Não importa lib/auth/session.ts aqui de propósito: aquele
// arquivo usa `cookies()` de "next/headers" (Server Components/Actions);
// o Proxy lê o cookie direto do NextRequest.

async function lerSessao(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const ROTAS_ADMIN = ["/admin"];
const ROTAS_AUTENTICADAS = ["/admin", "/nova-cotacao", "/acompanhamento"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessao = await lerSessao(request);

  const precisaAuth = ROTAS_AUTENTICADAS.some((rota) => pathname.startsWith(rota));
  if (precisaAuth && !sessao) {
    const destino = new URL("/login", request.url);
    return NextResponse.redirect(destino);
  }

  const somenteAdmin = ROTAS_ADMIN.some((rota) => pathname.startsWith(rota));
  if (somenteAdmin && sessao && sessao.perfil !== "administrador" && sessao.perfil !== "colaborador") {
    // Comprador/Visitante autenticado tentando abrir o Painel Admin.
    return NextResponse.redirect(new URL(rotaPosLogin(sessao.perfil), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/nova-cotacao/:path*", "/acompanhamento/:path*"],
};
