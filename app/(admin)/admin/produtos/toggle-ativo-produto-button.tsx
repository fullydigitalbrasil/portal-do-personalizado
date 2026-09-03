"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { alternarAtivoProduto } from "@/lib/admin/produtos-actions";

export function ToggleAtivoProdutoButton({ id, ativo }: { id: string; ativo: boolean }) {
  const [pendente, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pendente}
      onClick={() => startTransition(() => alternarAtivoProduto(id, !ativo))}
    >
      {ativo ? "Desativar" : "Ativar"}
    </Button>
  );
}
