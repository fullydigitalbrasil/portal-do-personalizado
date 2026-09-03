import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { SESSION_COOKIE_NAME, type SessionPayload } from "@/lib/auth/constants";

const SESSION_DURATION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET não está definida. Configure-a nas variáveis de ambiente."
    );
  }
  return new TextEncoder().encode(secret);
}

/** Assina o JWT da sessão e grava no cookie httpOnly. Chame a partir de uma Server Action. */
export async function criarSessao(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SEGUNDOS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SEGUNDOS,
  });
}

/** Lê e valida a sessão atual. Retorna null se não houver sessão ou se o token for inválido/expirado. */
export async function obterSessao(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    // Token inválido, adulterado ou expirado.
    return null;
  }
}

/** Remove o cookie de sessão (logout). Chame a partir de uma Server Action. */
export async function encerrarSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Exige uma sessão de Administrador. Regra definida no PRD v2.1 (seção 4.1):
 * por ora, cadastro de Marca/Produto/Preço é exclusivo do Administrador —
 * o Colaborador só visualiza. Use no início de toda Server Action de
 * escrita nessas áreas; retorna null (em vez de lançar) para o chamador
 * devolver um estado de erro amigável ao invés de estourar um Error.
 */
export async function obterSessaoAdmin(): Promise<SessionPayload | null> {
  const sessao = await obterSessao();
  if (!sessao || sessao.perfil !== "administrador") return null;
  return sessao;
}
