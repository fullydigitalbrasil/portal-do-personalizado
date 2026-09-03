"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  criarFaixaPreco,
  atualizarFaixaPreco,
  type EstadoFaixa,
} from "@/lib/admin/faixas-actions";

const ESTADO_INICIAL: EstadoFaixa = null;

type FaixaExistente = {
  id: string;
  quantidadeMinima: number;
  quantidadeMaxima: number | null;
  precoUnitario: string;
};

export function FaixaDialogForm({
  produtoId,
  faixa,
}: {
  produtoId: string;
  faixa?: FaixaExistente;
}) {
  const acao = faixa ? atualizarFaixaPreco : criarFaixaPreco;
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const [aberto, setAberto] = useState(false);

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
        {faixa ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button>
            <PlusIcon /> Nova Faixa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          {faixa && <input type="hidden" name="id" value={faixa.id} />}
          <input type="hidden" name="produtoId" value={produtoId} />

          <DialogHeader>
            <DialogTitle>{faixa ? "Editar faixa de preço" : "Nova faixa de preço"}</DialogTitle>
            <DialogDescription>
              Defina a quantidade mínima e o preço unitário. Deixe a quantidade
              máxima em branco para uma faixa aberta (&ldquo;a partir de&rdquo;).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="quantidadeMinima">Quantidade mínima</Label>
            <Input
              id="quantidadeMinima"
              name="quantidadeMinima"
              type="number"
              min={1}
              step={1}
              defaultValue={faixa?.quantidadeMinima}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantidadeMaxima">Quantidade máxima (opcional)</Label>
            <Input
              id="quantidadeMaxima"
              name="quantidadeMaxima"
              type="number"
              min={1}
              step={1}
              defaultValue={faixa?.quantidadeMaxima ?? ""}
              placeholder="Sem limite"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precoUnitario">Preço unitário (R$)</Label>
            <Input
              id="precoUnitario"
              name="precoUnitario"
              type="number"
              min={0}
              step="0.0001"
              defaultValue={faixa?.precoUnitario}
              required
            />
          </div>

          {estado?.erro && (
            <p className="text-destructive text-sm" role="alert">
              {estado.erro}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pendente}>
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
