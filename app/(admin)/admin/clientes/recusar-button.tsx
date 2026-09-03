"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { recusarCadastro } from "@/lib/admin/clientes-actions";

export function RecusarButton({ id, nome }: { id: string; nome: string }) {
  const [pendente, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pendente}
      onClick={() => {
        if (window.confirm(`Recusar o cadastro de ${nome}? Essa ação não pode ser desfeita.`)) {
          startTransition(() => recusarCadastro(id));
        }
      }}
    >
      {pendente ? "Recusando..." : "Recusar"}
    </Button>
  );
}
