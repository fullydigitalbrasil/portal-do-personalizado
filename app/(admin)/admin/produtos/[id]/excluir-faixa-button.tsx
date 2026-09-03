"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { excluirFaixaPreco } from "@/lib/admin/faixas-actions";

export function ExcluirFaixaButton({
  id,
  produtoId,
}: {
  id: string;
  produtoId: string;
}) {
  const [pendente, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pendente}
      onClick={() => {
        if (window.confirm("Excluir esta faixa de preço? Essa ação não pode ser desfeita.")) {
          startTransition(() => excluirFaixaPreco(id, produtoId));
        }
      }}
    >
      {pendente ? "Excluindo..." : "Excluir"}
    </Button>
  );
}
