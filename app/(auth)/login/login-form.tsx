"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { solicitarToken, type EstadoSolicitarToken } from "@/lib/auth/actions";

const ESTADO_INICIAL: EstadoSolicitarToken = null;

export function LoginForm() {
  const [estado, formAction, pendente] = useActionState(solicitarToken, ESTADO_INICIAL);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@empresa.com.br"
          required
          autoFocus
        />
      </div>

      {estado?.erro && (
        <p className="text-destructive text-sm" role="alert">
          {estado.erro}
        </p>
      )}

      <Button className="w-full" type="submit" disabled={pendente}>
        {pendente ? "Enviando..." : "Enviar código"}
      </Button>
    </form>
  );
}
