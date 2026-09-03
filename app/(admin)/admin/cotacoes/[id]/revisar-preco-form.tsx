"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revisarPreco, type EstadoCotacaoAdmin } from "@/lib/admin/cotacoes-actions";

const ESTADO_INICIAL: EstadoCotacaoAdmin = null;

function formatarValor(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function RevisarPrecoForm({
  cotacaoId,
  quantidade,
  precoInicial,
}: {
  cotacaoId: string;
  quantidade: number;
  precoInicial: string | null;
}) {
  const [estado, formAction, pendente] = useActionState(revisarPreco, ESTADO_INICIAL);
  const [preco, setPreco] = useState(precoInicial ?? "");

  const precoNumero = Number(preco);
  const total = precoNumero > 0 ? precoNumero * quantidade : null;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="cotacaoId" value={cotacaoId} />

      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="precoUnitarioFinal">Preço unitário final</Label>
          <Input
            id="precoUnitarioFinal"
            name="precoUnitarioFinal"
            type="number"
            min={0}
            step="0.0001"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-40"
            required
          />
        </div>
        <p className="text-muted-foreground pb-2 text-sm">
          × {quantidade} = <span className="text-foreground font-medium">
            {total !== null ? formatarValor(total) : "—"}
          </span>
        </p>
      </div>

      {estado?.erro && (
        <p className="text-destructive text-sm" role="alert">
          {estado.erro}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pendente}>
        {pendente ? "Salvando..." : "Salvar preço"}
      </Button>
    </form>
  );
}
