import { Resend } from "resend";

// A chave vem da integração Resend adicionada pelo marketplace da Vercel
// (variável de ambiente RESEND_API_KEY criada automaticamente).
export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_REMETENTE =
  process.env.EMAIL_REMETENTE ?? "Portal do Personalizado <nao-responda@tpoembalagens.com.br>";

// TODO (Módulo 7): criar um template em lib/email/templates para cada
// tipo_evento de NOTIFICACAO_EMAIL (cadastro_aprovado, cadastro_recusado,
// cotacao_calculada, cotacao_revisada, mudanca_status) usando React Email.
