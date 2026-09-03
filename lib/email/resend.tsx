import { Resend } from "resend";

import TokenLoginEmail from "@/lib/email/templates/token-login";

// A chave vem da integração Resend adicionada pelo marketplace da Vercel
// (variável de ambiente RESEND_API_KEY criada automaticamente).
export const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANTE: o Resend só permite enviar de um domínio verificado na sua
// conta. Até você verificar "tpoembalagens.com.br" no painel do Resend,
// use o remetente de teste deles (onboarding@resend.dev) — funciona sem
// verificação, mas só entrega para o e-mail cadastrado na sua conta Resend.
export const EMAIL_REMETENTE =
  process.env.EMAIL_REMETENTE ?? "Portal do Personalizado <onboarding@resend.dev>";

type EnviarTokenLoginParams = {
  to: string;
  nome: string;
  codigo: string;
};

/** Envia o e-mail com o token numérico de login (PRD v2.1, seção 3.1). */
export async function sendLoginToken({ to, nome, codigo }: EnviarTokenLoginParams) {
  return resend.emails.send({
    from: EMAIL_REMETENTE,
    to,
    subject: `${codigo} é o seu código de acesso — Portal do Personalizado`,
    react: <TokenLoginEmail nome={nome} codigo={codigo} />,
  });
}

// Os demais 5 tipos de evento de NOTIFICACAO_EMAIL (cadastro_aprovado,
// cadastro_recusado, cotacao_calculada, cotacao_revisada, mudanca_status)
// têm seus templates em lib/email/templates e são enviados por
// lib/email/notificacoes.ts (Módulo 7), que também grava o log de
// auditoria em NotificacaoEmail — em vez de funções soltas aqui, para
// manter o envio e o registro de auditoria juntos num único lugar.
