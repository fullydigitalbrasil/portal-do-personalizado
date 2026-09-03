import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { obterSessao } from "@/lib/auth/session";
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

export default async function AcompanhamentoPage() {
  const sessao = await obterSessao();
  if (!sessao) return null; // proxy.ts/layout já garantem sessão — só por segurança de tipos.

  if (sessao.perfil !== "comprador") {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Área exclusiva do Comprador</CardTitle>
            <CardDescription>
              O Acompanhamento mostra as cotações e pedidos de um Comprador
              aprovado. Este perfil não tem cotações para exibir aqui.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  // PRD v2.1, seção 2.1 e 7: Comprador Padrão vê só as próprias cotações;
  // Comprador Gerente vê todas as da sua Marca. Administrador/Colaborador
  // não usam este painel (é exclusivo do Comprador), mas se acessarem,
  // caem no filtro por comprador (nunca veem nada, pois não têm cotações).
  const filtro =
    sessao.subtipoComprador === "gerente"
      ? { marcaId: sessao.marcaId ?? "" }
      : { compradorId: sessao.usuarioId };

  const cotacoes = await prisma.cotacao.findMany({
    where: filtro,
    orderBy: { dataSolicitacao: "desc" },
    include: {
      comprador: { select: { nomeCompleto: true } },
      itens: { include: { produto: { select: { nome: true } } } },
    },
  });

  function tabela(lista: typeof cotacoes) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            {sessao?.subtipoComprador === "gerente" && <TableHead>Comprador</TableHead>}
            <TableHead>Produto</TableHead>
            <TableHead>Fase</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Atualizado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={sessao?.subtipoComprador === "gerente" ? 8 : 7}
                className="text-muted-foreground py-10 text-center"
              >
                Nenhuma cotação nesta fase.
              </TableCell>
            </TableRow>
          )}
          {lista.map((cotacao) => {
            const item = cotacao.itens[0];
            return (
              <TableRow key={cotacao.id}>
                <TableCell className="font-medium">{cotacao.numero}</TableCell>
                {sessao?.subtipoComprador === "gerente" && (
                  <TableCell>{cotacao.comprador.nomeCompleto}</TableCell>
                )}
                <TableCell>{item?.produto?.nome ?? item?.descricaoLivre ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{LABEL_FASE[cotacao.statusFase]}</Badge>
                </TableCell>
                <TableCell>{labelDoStatus(cotacao.status)}</TableCell>
                <TableCell>
                  {formatarValor(cotacao.valorTotalFinal ?? cotacao.valorTotalSugerido)}
                </TableCell>
                <TableCell>{formatarData(cotacao.dataUltimaAtualizacao)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/acompanhamento/${cotacao.id}`}>Ver</Link>
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
          Acompanhamento
        </h1>
        <p className="text-muted-foreground text-sm">
          {sessao.subtipoComprador === "gerente"
            ? "Cotações e pedidos de todos os compradores da sua Marca, do envio até a entrega."
            : "Suas cotações e pedidos, do envio até a entrega."}
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
