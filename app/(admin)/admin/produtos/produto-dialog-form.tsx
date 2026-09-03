"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  criarProduto,
  atualizarProduto,
  type EstadoProduto,
} from "@/lib/admin/produtos-actions";

const ESTADO_INICIAL: EstadoProduto = null;

type MarcaOpcao = { id: string; nomeMarca: string };

type ProdutoExistente = {
  id: string;
  marcaId: string;
  nome: string;
  descricao: string | null;
};

export function ProdutoDialogForm({
  marcas,
  produto,
}: {
  marcas: MarcaOpcao[];
  produto?: ProdutoExistente;
}) {
  const acao = produto ? atualizarProduto : criarProduto;
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const [aberto, setAberto] = useState(false);
  const [marcaId, setMarcaId] = useState(produto?.marcaId ?? "");

  // Fecha o diálogo ao concluir com sucesso. Ajuste de estado durante a
  // renderização (em vez de useEffect) evita um render extra — ver
  // https://react.dev/learn/you-might-not-need-an-effect
  const [estadoAnterior, setEstadoAnterior] = useState(estado);
  if (estado !== estadoAnterior) {
    setEstadoAnterior(estado);
    if (estado?.ok) setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {produto ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button disabled={marcas.length === 0}>
            <PlusIcon /> Novo Produto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          {produto && <input type="hidden" name="id" value={produto.id} />}
          <input type="hidden" name="marcaId" value={marcaId} />

          <DialogHeader>
            <DialogTitle>{produto ? "Editar produto" : "Novo produto"}</DialogTitle>
            <DialogDescription>
              Todo produto do catálogo pertence obrigatoriamente a uma marca.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="marcaId">Marca</Label>
            <Select value={marcaId} onValueChange={setMarcaId} required>
              <SelectTrigger id="marcaId" className="w-full">
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((marca) => (
                  <SelectItem key={marca.id} value={marca.id}>
                    {marca.nomeMarca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome do produto</Label>
            <Input id="nome" name="nome" defaultValue={produto?.nome} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              name="descricao"
              defaultValue={produto?.descricao ?? ""}
              placeholder="Dimensões, material, acabamento..."
            />
          </div>

          {estado?.erro && (
            <p className="text-destructive text-sm" role="alert">
              {estado.erro}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pendente || !marcaId}>
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
