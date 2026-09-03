import type { FaseCotacao, StatusCotacao } from "@prisma/client";

// PRD v2.1, seção 6.2 — 12 status em sequência, agrupados em 5 fases.
// Compartilhado entre o Painel Admin (Módulo 5) e o Painel de
// Acompanhamento do Comprador (Módulo 6, futuro).
export const STATUS_COTACAO_ORDEM: {
  status: StatusCotacao;
  fase: FaseCotacao;
  label: string;
}[] = [
  { status: "em_cotacao", fase: "cotacao", label: "Em cotação" },
  {
    status: "em_cotacao_aguardando_aprovacao",
    fase: "cotacao",
    label: "Em cotação: Aguardando aprovação",
  },
  {
    status: "em_aprovacao_prototipo_3d",
    fase: "aprovacao",
    label: "Em aprovação: Protótipo 3D",
  },
  {
    status: "em_aprovacao_prototipo_fisico",
    fase: "aprovacao",
    label: "Em aprovação: Protótipo físico",
  },
  {
    status: "financeiro_aguardando_liberacao",
    fase: "financeiro",
    label: "Financeiro: Aguardando liberação",
  },
  { status: "financeiro_liberado", fase: "financeiro", label: "Financeiro: Liberado" },
  { status: "pre_producao", fase: "producao", label: "Pré produção" },
  { status: "em_producao", fase: "producao", label: "Em produção" },
  { status: "em_expedicao", fase: "producao", label: "Em expedição" },
  { status: "pronto_para_envio", fase: "producao", label: "Pronto para envio" },
  { status: "enviado", fase: "entrega", label: "Enviado" },
  { status: "recebido", fase: "entrega", label: "Recebido" },
];

export const LABEL_FASE: Record<FaseCotacao, string> = {
  cotacao: "Cotação",
  aprovacao: "Aprovação",
  financeiro: "Financeiro",
  producao: "Produção",
  entrega: "Entrega",
};

const MAPA_STATUS = new Map(STATUS_COTACAO_ORDEM.map((s) => [s.status, s]));

export function faseDoStatus(status: StatusCotacao): FaseCotacao {
  const item = MAPA_STATUS.get(status);
  if (!item) throw new Error(`Status desconhecido: ${status}`);
  return item.fase;
}

export function labelDoStatus(status: StatusCotacao): string {
  return MAPA_STATUS.get(status)?.label ?? status;
}
