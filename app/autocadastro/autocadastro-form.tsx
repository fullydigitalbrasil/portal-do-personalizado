"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NichoSelect } from "@/components/nicho-select";
import { enviarAutocadastro, type EstadoAutocadastro } from "@/lib/cadastro/actions";

const ESTADO_INICIAL: EstadoAutocadastro = null;

type NichoOpcao = { id: string; nome: string };

export function AutocadastroForm({ nichos }: { nichos: NichoOpcao[] }) {
  const [estado, formAction, pendente] = useActionState(enviarAutocadastro, ESTADO_INICIAL);

  if (estado?.ok) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)]">
            Cadastro enviado!
          </CardTitle>
          <CardDescription>
            Recebemos seus dados. A equipe da TPO Embalagens vai analisar seu
            cadastro e você será avisado por e-mail assim que ele for
            aprovado — a partir daí, você já pode fazer login com seu e-mail
            para acompanhar suas cotações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Dados do comprador</CardTitle>
          <CardDescription>Nome completo, CPF, WhatsApp e e-mail.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nomeCompleto">Nome completo</Label>
            <Input id="nomeCompleto" name="nomeCompleto" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
          <CardDescription>
            Razão social, CNPJ, marca, endereço e nicho do estabelecimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="razaoSocial">Razão social</Label>
            <Input id="razaoSocial" name="razaoSocial" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nomeMarcaPretendida">Marca</Label>
            <Input id="nomeMarcaPretendida" name="nomeMarcaPretendida" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="enderecoCompleto">Endereço completo</Label>
            <Input id="enderecoCompleto" name="enderecoCompleto" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Nicho do estabelecimento</Label>
            <p className="text-muted-foreground text-xs">
              Pode marcar mais de uma opção.
            </p>
            <NichoSelect nichos={nichos} />
          </div>
        </CardContent>
      </Card>

      {estado?.erro && (
        <p className="text-destructive text-sm" role="alert">
          {estado.erro}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pendente}>
        {pendente ? "Enviando..." : "Enviar cadastro"}
      </Button>
    </form>
  );
}
