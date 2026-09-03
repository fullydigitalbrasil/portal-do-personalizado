"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alterarStatusCotacao, type EstadoCotacaoAdmin } from "@/lib/admin/cotacoes-actions";
import { STATUS_COTACAO_ORDEM } from "@/lib/cotacao/status";
import type { StatusCotacao } from "@prisma/client";

const ESTADO_INICIAL: EstadoCotacaoAdmin = null;

export function AlterarStatusForm({
  cotacaoId,
  statusAtual,
}: {
  cotacaoId: string;
  statusAtual: StatusCotacao;
}) {
  const [estado, formAction, pendente] = useActionState(alterarStatusCotacao, ESTADO_INICIAL);
  const [novoStatus, setNovoStatus] = useState<string>(statusAtual);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="cotacaoId" value={cotacaoId} />
      <input type="hidden" name="novoStatus" value={novoStatus} />

      <div className="space-y-2">
        <Label htmlFor="novoStatusSelect">Status</Label>
        <Select value={novoStatus} onValueChange={setNovoStatus}>
          <SelectTrigger id="novoStatusSelect" className="w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_COTACAO_ORDEM.map((s) => (
              <SelectItem key={s.status} value={s.status}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="sm" disabled={pendente || novoStatus === statusAtual}>
        {pendente ? "Salvando..." : "Atualizar status"}
      </Button>

      {estado?.erro && (
        <p className="text-destructive text-sm" role="alert">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
