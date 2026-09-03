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
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { ProdutoDialogForm } from "./produto-dialog-form";
import { ToggleAtivoProdutoButton } from "./toggle-ativo-produto-button";

export default async function ProdutosPage() {
  const sessao = await obterSessao();
  const ehAdmin = sessao?.perfil === "administrador";

  const [produtos, marcas] = await Promise.all([
    prisma.produto.findMany({
      orderBy: { nome: "asc" },
      include: { marca: true, _count: { select: { faixasPreco: true } } },
    }),
    prisma.marca.findMany({ where: { ativa: true }, orderBy: { nomeMarca: "asc" } }),
  ]);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Produtos
          </h1>
          <p className="text-muted-foreground text-sm">
            {ehAdmin
              ? "Cadastro exclusivo do Administrador. Todo produto pertence a uma marca."
              : "Você pode visualizar o catálogo. Cadastro e edição são exclusivos do Administrador."}
          </p>
        </div>
        {ehAdmin && <ProdutoDialogForm marcas={marcas} />}
      </div>

      {ehAdmin && marcas.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Cadastre uma marca antes de criar produtos —{" "}
          <Link href="/admin/marcas" className="text-primary underline">
            ir para Marcas
          </Link>
          .
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Faixas de preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                Nenhum produto cadastrado ainda.
              </TableCell>
            </TableRow>
          )}
          {produtos.map((produto) => (
            <TableRow key={produto.id}>
              <TableCell className="font-medium">{produto.nome}</TableCell>
              <TableCell>{produto.marca.nomeMarca}</TableCell>
              <TableCell>{produto._count.faixasPreco}</TableCell>
              <TableCell>
                <Badge variant={produto.ativo ? "default" : "secondary"}>
                  {produto.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/produtos/${produto.id}`}>Faixas de preço</Link>
                </Button>
                {ehAdmin && (
                  <>
                    <ProdutoDialogForm marcas={marcas} produto={produto} />
                    <ToggleAtivoProdutoButton id={produto.id} ativo={produto.ativo} />
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
