import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db/client";
import { LABEL_FASE, labelDoStatus } from "@/lib/cotacao/status";
import type { FaseCotacao } from "@prisma/client";

const FASES: FaseCotacao[] = ["cotacao", "aprovacao", "financeiro", "producao", "entrega"];

function formatarValor(valor: unknown) {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(valor)
  );
}

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(data);
}

export default async function CotacoesPage() {
  const cotacoes = await prisma.cotacao.findMany({
    orderBy: { dataSolicitacao: "desc" },
    include: {
      comprador: { select: { nomeCompleto: true } },
      marca: { select: { nomeMarca: true } },
      itens: { include: { produto: { select: { nome: true } } } },
    },
  });

  function tabela(lista: typeof cotacoes) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Comprador / Marca</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Qtd.</TableHead>
            <TableHead>Precificação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-muted-foreground py-10 text-center">
                Nenhuma cotação nesta fase.
              </TableCell>
            </TableRow>
          )}
          {lista.map((cotacao) => {
            const item = cotacao.itens[0];
            return (
              <TableRow key={cotacao.id}>
                <TableCell className="font-medium">{cotacao.numero}</TableCell>
                <TableCell>
                  {cotacao.comprador.nomeCompleto}
                  <span className="text-muted-foreground block text-xs">
                    {cotacao.marca.nomeMarca}
                  </span>
                </TableCell>
                <TableCell>{item?.produto?.nome ?? item?.descricaoLivre ?? "—"}</TableCell>
                <TableCell>{item?.quantidade ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={cotacao.tipoPrecificacao === "automatica" ? "outline" : "secondary"}>
                    {cotacao.tipoPrecificacao === "automatica" ? "Automática" : "Manual"}
                  </Badge>
                </TableCell>
                <TableCell>{labelDoStatus(cotacao.status)}</TableCell>
                <TableCell>
                  {formatarValor(cotacao.valorTotalFinal ?? cotacao.valorTotalSugerido)}
                </TableCell>
                <TableCell>{formatarData(cotacao.dataSolicitacao)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/cotacoes/${cotacao.id}`}>Ver</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Cotações
        </h1>
        <p className="text-muted-foreground text-sm">
          Revisão de preço e acompanhamento das 12 etapas de status. A
          revisão de preço e a mudança de status são exclusivas do
          Administrador — o Colaborador só visualiza.
        </p>
      </div>

      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">Todas ({cotacoes.length})</TabsTrigger>
          {FASES.map((fase) => (
            <TabsTrigger key={fase} value={fase}>
              {LABEL_FASE[fase]} ({cotacoes.filter((c) => c.statusFase === fase).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todas">{tabela(cotacoes)}</TabsContent>
        {FASES.map((fase) => (
          <TabsContent key={fase} value={fase}>
            {tabela(cotacoes.filter((c) => c.statusFase === fase))}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
