"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { alternarAtivaMarca } from "@/lib/admin/marcas-actions";

export function ToggleAtivaMarcaButton({ id, ativa }: { id: string; ativa: boolean }) {
  const [pendente, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pendente}
      onClick={() => startTransition(() => alternarAtivaMarca(id, !ativa))}
    >
      {ativa ? "Desativar" : "Ativar"}
    </Button>
  );
}
