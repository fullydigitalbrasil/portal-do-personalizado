import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PaperclipIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { LABEL_FASE, labelDoStatus } from "@/lib/cotacao/status";

function formatarValor(valor: unknown) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor)
  );
}

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(data);
}

export default async function AcompanhamentoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessao = await obterSessao();

  if (!sessao || sessao.perfil !== "comprador") {
    notFound();
  }

  const cotacao = await prisma.cotacao.findUnique({
    where: { id },
    include: {
      marca: { select: { nomeMarca: true } },
      itens: { include: { produto: { select: { nome: true } } } },
      anexos: { orderBy: { dataEnvio: "asc" } },
      historico: { orderBy: { dataAlteracao: "asc" } },
    },
  });

  if (!cotacao) notFound();

  // Padrão só vê a própria cotação; Gerente vê qualquer uma da sua Marca.
  const podeVer =
    sessao.subtipoComprador === "gerente"
      ? cotacao.marcaId === sessao.marcaId
      : cotacao.compradorId === sessao.usuarioId;
  if (!podeVer) notFound();

  const item = cotacao.itens[0];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/acompanhamento">
            <ArrowLeftIcon /> Voltar para Acompanhamento
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Cotação {cotacao.numero}
            </h1>
            <p className="text-muted-foreground text-sm">{cotacao.marca.nomeMarca}</p>
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
            <span className="text-muted-foreground">Valor: </span>
            {formatarValor(cotacao.valorTotalFinal ?? cotacao.valorTotalSugerido)}
            {!cotacao.valorTotalFinal && cotacao.tipoPrecificacao === "manual" && (
              <span className="text-muted-foreground">
                {" "}
                (em precificação manual — retorno em até 5 dias úteis)
              </span>
            )}
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
          <CardTitle>Andamento</CardTitle>
          <CardDescription>Histórico de atualizações desta cotação.</CardDescription>
        </CardHeader>
        <CardContent>
          {cotacao.historico.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Ainda sem atualizações de status.
            </p>
          ) : (
            <ul className="space-y-2 border-l pl-4 text-sm">
              {cotacao.historico.map((h) => (
                <li key={h.id}>
                  <span className="text-muted-foreground">
                    {formatarDataHora(h.dataAlteracao)} —{" "}
                  </span>
                  <span className="font-medium">{labelDoStatus(h.statusNovo)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
