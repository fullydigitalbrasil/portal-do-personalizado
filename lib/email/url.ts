/**
 * URL pública do portal, usada nos links dos e-mails. Usa
 * NEXT_PUBLIC_APP_URL se estiver definida (override manual); senão cai
 * para a URL de produção que a própria Vercel injeta automaticamente
 * (VERCEL_PROJECT_PRODUCTION_URL); por último, um valor fixo de
 * segurança para nunca gerar um link quebrado.
 */
export function urlBase(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://portal-do-personalizado.vercel.app";
}
