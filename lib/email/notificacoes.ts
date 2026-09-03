import type { TipoEventoNotificacao } from "@prisma/client";

import { prisma } from "@/lib/db/client";
import { EMAIL_REMETENTE, resend } from "@/lib/email/resend";
import CadastroAprovadoEmail from "@/lib/email/templates/cadastro-aprovado";
import CadastroRecusadoEmail from "@/lib/email/templates/cadastro-recusado";
import CotacaoCalculadaEmail from "@/lib/email/templates/cotacao-calculada";
import CotacaoRevisadaEmail from "@/lib/email/templates/cotacao-revisada";
import MudancaStatusEmail from "@/lib/email/templates/mudanca-status";
import { urlBase } from "@/lib/email/url";

/**
 * Funções de notificação por e-mail (PRD v2.1, seção 7).
 *
 * Cada função corresponde a um dos 5 valores fixos do enum
 * TipoEventoNotificacao e é chamada diretamente (com `await`) pelas Server
 * Actions existentes, logo após a escrita principal no banco ter sido
 * confirmada. Deliberadamente NÃO usamos `after()` do Next.js aqui: dado que
 * esta versão do Next.js tem APIs que podem divergir do conhecimento de
 * treinamento (ver AGENTS.md), preferimos o padrão mais simples e previsível
 * de aguardar o envio inline, dentro de um try/catch que nunca deixa uma
 * falha do Resend quebrar a ação principal do usuário (aprovar cadastro,
 * criar cotação, etc.) — na pior das hipóteses, o e-mail não é enviado, mas
 * a ação em si é concluída normalmente.
 *
 * Cada envio bem-sucedido também grava uma linha em NotificacaoEmail, como
 * log de auditoria de que a notificação foi disparada.
 */

async function registrarNotificacao(params: {
  usuarioId: string;
  cotacaoId?: string;
  tipoEvento: TipoEventoNotificacao;
}) {
  await prisma.notificacaoEmail.create({
    data: {
      usuarioId: params.usuarioId,
      cotacaoId: params.cotacaoId,
      tipoEvento: params.tipoEvento,
    },
  });
}

type NotificarCadastroAprovadoParams = {
  usuarioId: string;
  to: string;
  nome: string;
  nomeMarca: string;
};

/** cadastro_aprovado — disparado por `aprovarCadastro`. */
export async function notificarCadastroAprovado({
  usuarioId,
  to,
  nome,
  nomeMarca,
}: NotificarCadastroAprovadoParams) {
  try {
    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to,
      subject: "Seu cadastro foi aprovado — Portal do Personalizado",
      react: CadastroAprovadoEmail({ nome, nomeMarca, urlLogin: urlBase() }),
    });
    await registrarNotificacao({ usuarioId, tipoEvento: "cadastro_aprovado" });
  } catch (erro) {
    console.error("[notificacoes] falha ao enviar e-mail cadastro_aprovado:", erro);
  }
}

type NotificarCadastroRecusadoParams = {
  usuarioId: string;
  to: string;
  nome: string;
};

/** cadastro_recusado — disparado por `recusarCadastro`. */
export async function notificarCadastroRecusado({
  usuarioId,
  to,
  nome,
}: NotificarCadastroRecusadoParams) {
  try {
    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to,
      subject: "Sobre seu cadastro — Portal do Personalizado",
      react: CadastroRecusadoEmail({ nome }),
    });
    await registrarNotificacao({ usuarioId, tipoEvento: "cadastro_recusado" });
  } catch (erro) {
    console.error("[notificacoes] falha ao enviar e-mail cadastro_recusado:", erro);
  }
}

type NotificarCotacaoCalculadaParams = {
  usuarioId: string;
  cotacaoId: string;
  to: string;
  nome: string;
  numero: string;
  nomeProduto: string;
  quantidade: number;
  valorFormatado: string;
};

/** cotacao_calculada — disparado por `criarCotacao` quando a precificação é automática. */
export async function notificarCotacaoCalculada({
  usuarioId,
  cotacaoId,
  to,
  nome,
  numero,
  nomeProduto,
  quantidade,
  valorFormatado,
}: NotificarCotacaoCalculadaParams) {
  try {
    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to,
      subject: `Cotação ${numero}: valor sugerido ${valorFormatado}`,
      react: CotacaoCalculadaEmail({
        nome,
        numero,
        nomeProduto,
        quantidade,
        valorFormatado,
        urlLogin: urlBase(),
      }),
    });
    await registrarNotificacao({ usuarioId, cotacaoId, tipoEvento: "cotacao_calculada" });
  } catch (erro) {
    console.error("[notificacoes] falha ao enviar e-mail cotacao_calculada:", erro);
  }
}

type NotificarCotacaoRevisadaParams = {
  usuarioId: string;
  cotacaoId: string;
  to: string;
  nome: string;
  numero: string;
  valorFormatado: string;
};

/** cotacao_revisada — disparado por `revisarPreco`. */
export async function notificarCotacaoRevisada({
  usuarioId,
  cotacaoId,
  to,
  nome,
  numero,
  valorFormatado,
}: NotificarCotacaoRevisadaParams) {
  try {
    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to,
      subject: `Cotação ${numero} revisada: ${valorFormatado}`,
      react: CotacaoRevisadaEmail({ nome, numero, valorFormatado, urlLogin: urlBase() }),
    });
    await registrarNotificacao({ usuarioId, cotacaoId, tipoEvento: "cotacao_revisada" });
  } catch (erro) {
    console.error("[notificacoes] falha ao enviar e-mail cotacao_revisada:", erro);
  }
}

type NotificarMudancaStatusParams = {
  usuarioId: string;
  cotacaoId: string;
  to: string;
  nome: string;
  numero: string;
  statusLabel: string;
  faseLabel: string;
};

/** mudanca_status — disparado por `alterarStatusCotacao`. */
export async function notificarMudancaStatus({
  usuarioId,
  cotacaoId,
  to,
  nome,
  numero,
  statusLabel,
  faseLabel,
}: NotificarMudancaStatusParams) {
  try {
    await resend.emails.send({
      from: EMAIL_REMETENTE,
      to,
      subject: `Cotação ${numero}: ${statusLabel}`,
      react: MudancaStatusEmail({ nome, numero, statusLabel, faseLabel, urlLogin: urlBase() }),
    });
    await registrarNotificacao({ usuarioId, cotacaoId, tipoEvento: "mudanca_status" });
  } catch (erro) {
    console.error("[notificacoes] falha ao enviar e-mail mudanca_status:", erro);
  }
}
