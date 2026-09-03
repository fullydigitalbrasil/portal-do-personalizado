import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

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
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { FaixaDialogForm } from "./faixa-dialog-form";
import { ExcluirFaixaButton } from "./excluir-faixa-button";

function formatarPreco(valor: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor));
}

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessao = await obterSessao();
  const ehAdmin = sessao?.perfil === "administrador";

  const produto = await prisma.produto.findUnique({
    where: { id },
    include: {
      marca: true,
      faixasPreco: { orderBy: { quantidadeMinima: "asc" } },
    },
  });

  if (!produto) {
    notFound();
  }

  const faixas = produto.faixasPreco.map((faixa) => ({
    id: faixa.id,
    quantidadeMinima: faixa.quantidadeMinima,
    quantidadeMaxima: faixa.quantidadeMaxima,
    precoUnitario: faixa.precoUnitario.toString(),
  }));

  return (
    <main className="flex-1 space-y-6 p-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin/produtos">
            <ArrowLeftIcon /> Voltar para Produtos
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              {produto.nome}
            </h1>
            <p className="text-muted-foreground text-sm">
              {produto.marca.nomeMarca}
              {produto.descricao ? ` · ${produto.descricao}` : ""}
            </p>
          </div>
          <Badge variant={produto.ativo ? "default" : "secondary"}>
            {produto.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Faixas de preço</h2>
          <p className="text-muted-foreground text-sm">
            {ehAdmin
              ? "Cadastro exclusivo do Administrador, por quantidade."
              : "Faixas de preço vigentes para este produto."}
          </p>
        </div>
        {ehAdmin && <FaixaDialogForm produtoId={produto.id} />}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quantidade mínima</TableHead>
            <TableHead>Quantidade máxima</TableHead>
            <TableHead>Preço unitário</TableHead>
            {ehAdmin && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {faixas.length === 0 && (
            <TableRow>
              <TableCell colSpan={ehAdmin ? 4 : 3} className="text-muted-foreground py-10 text-center">
                Nenhuma faixa de preço cadastrada ainda.
              </TableCell>
            </TableRow>
          )}
          {faixas.map((faixa) => (
            <TableRow key={faixa.id}>
              <TableCell className="font-medium">{faixa.quantidadeMinima}</TableCell>
              <TableCell>{faixa.quantidadeMaxima ?? "Sem limite"}</TableCell>
              <TableCell>{formatarPreco(faixa.precoUnitario)}</TableCell>
              {ehAdmin && (
                <TableCell className="flex justify-end gap-2 text-right">
                  <FaixaDialogForm produtoId={produto.id} faixa={faixa} />
                  <ExcluirFaixaButton id={faixa.id} produtoId={produto.id} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
