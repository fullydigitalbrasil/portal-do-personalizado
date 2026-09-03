import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PaperclipIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { LABEL_FASE, labelDoStatus } from "@/lib/cotacao/status";
import { RevisarPrecoForm } from "./revisar-preco-form";
import { AlterarStatusForm } from "./alterar-status-form";

function formatarValor(valor: unknown) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor)
  );
}

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(data);
}

export default async function CotacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessao = await obterSessao();
  const ehAdmin = sessao?.perfil === "administrador";

  const cotacao = await prisma.cotacao.findUnique({
    where: { id },
    include: {
      comprador: { select: { nomeCompleto: true, email: true, whatsapp: true } },
      marca: { select: { nomeMarca: true } },
      itens: { include: { produto: { select: { nome: true, descricao: true } } } },
      anexos: { orderBy: { dataEnvio: "asc" } },
      historico: {
        orderBy: { dataAlteracao: "asc" },
        include: { alteradoPor: { select: { nomeCompleto: true } } },
      },
    },
  });

  if (!cotacao) notFound();

  const item = cotacao.itens[0];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/cotacoes">
            <ArrowLeftIcon /> Voltar para Cotações
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Cotação {cotacao.numero}
            </h1>
            <p className="text-muted-foreground text-sm">
              {cotacao.comprador.nomeCompleto} · {cotacao.marca.nomeMarca}
            </p>
          </div>
          <div className="text-right">
            <Badge>{LABEL_FASE[cotacao.statusFase]}</Badge>
            <p className="mt-1 text-sm font-medium">{labelDoStatus(cotacao.status)}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item solicitado</CardTitle>
          <CardDescription>
            {item?.produto
              ? "Produto do catálogo."
              : "Produto sob especificação (fora do catálogo)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Produto: </span>
            {item?.produto?.nome ?? item?.descricaoLivre ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Quantidade: </span>
            {item?.quantidade ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Comprador: </span>
            {cotacao.comprador.email}
            {cotacao.comprador.whatsapp ? ` · ${cotacao.comprador.whatsapp}` : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
        </CardHeader>
        <CardContent>
          {cotacao.anexos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum anexo.</p>
          ) : (
            <ul className="space-y-2">
              {cotacao.anexos.map((anexo) => (
                <li key={anexo.id} className="flex items-center gap-2 text-sm">
                  <PaperclipIcon className="text-muted-foreground size-4 shrink-0" />
                  <a
                    href={anexo.urlArquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary truncate underline"
                  >
                    {anexo.nomeArquivo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precificação</CardTitle>
          <CardDescription>
            {cotacao.tipoPrecificacao === "automatica"
              ? "Calculada automaticamente pela faixa de preço do produto. O Administrador pode ajustar antes de confirmar."
              : `Produto sob especificação (ou fora de qualquer faixa cadastrada) — precificação manual. ${
                  cotacao.prazoRetornoManual
                    ? `Retorno até ${formatarDataHora(cotacao.prazoRetornoManual)}.`
                    : ""
                }`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            <span className="text-muted-foreground">Preço unitário sugerido: </span>
            {formatarValor(item?.precoUnitarioSugerido)}
          </p>
          <p>
            <span className="text-muted-foreground">Valor total sugerido: </span>
            {formatarValor(cotacao.valorTotalSugerido)}
          </p>
          <p>
            <span className="text-muted-foreground">Valor total final: </span>
            {formatarValor(cotacao.valorTotalFinal)}
          </p>

          {ehAdmin && item && (
            <RevisarPrecoForm
              cotacaoId={cotacao.id}
              quantidade={item.quantidade}
              precoInicial={
                (item.precoUnitarioFinal ?? item.precoUnitarioSugerido)?.toString() ?? null
              }
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>
            Alteração sempre manual, feita pelo Administrador — não há
            transição automática entre os 12 status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ehAdmin && (
            <AlterarStatusForm cotacaoId={cotacao.id} statusAtual={cotacao.status} />
          )}

          {cotacao.historico.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhuma alteração de status registrada ainda.
            </p>
          ) : (
            <ul className="space-y-2 border-l pl-4 text-sm">
              {cotacao.historico.map((h) => (
                <li key={h.id}>
                  <span className="text-muted-foreground">
                    {formatarDataHora(h.dataAlteracao)} —{" "}
                  </span>
                  {h.statusAnterior ? `${labelDoStatus(h.statusAnterior)} → ` : ""}
                  <span className="font-medium">{labelDoStatus(h.statusNovo)}</span>
                  <span className="text-muted-foreground"> por {h.alteradoPor.nomeCompleto}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
