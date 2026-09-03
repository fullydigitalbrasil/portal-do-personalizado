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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { aprovarCadastro, type EstadoCliente } from "@/lib/admin/clientes-actions";

const ESTADO_INICIAL: EstadoCliente = null;

type MarcaOpcao = { id: string; nomeMarca: string };

type CadastroPendente = {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf: string | null;
  whatsapp: string | null;
  origemCadastro: "autocadastro" | "cadastro_tpo";
  marcaId: string | null;
  solicitacaoCadastro: {
    razaoSocial: string;
    cnpj: string;
    nomeMarcaPretendida: string;
    enderecoCompleto: string;
    nichos: { nicho: { nome: string } }[];
  } | null;
};

export function AprovarDialogForm({
  cadastro,
  marcas,
}: {
  cadastro: CadastroPendente;
  marcas: MarcaOpcao[];
}) {
  const [estado, formAction, pendente] = useActionState(aprovarCadastro, ESTADO_INICIAL);
  const [aberto, setAberto] = useState(false);
  const [marcaId, setMarcaId] = useState(cadastro.marcaId ?? "");
  const [subtipo, setSubtipo] = useState<"padrao" | "gerente">("padrao");

  const [estadoAnterior, setEstadoAnterior] = useState(estado);
  if (estado !== estadoAnterior) {
    setEstadoAnterior(estado);
    if (estado?.ok) setAberto(false);
  }

  const solicitacao = cadastro.solicitacaoCadastro;

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm">Aprovar</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="usuarioId" value={cadastro.id} />
          <input type="hidden" name="marcaId" value={marcaId} />
          <input type="hidden" name="subtipoComprador" value={subtipo} />

          <DialogHeader>
            <DialogTitle>Aprovar cadastro</DialogTitle>
            <DialogDescription>
              {cadastro.nomeCompleto} ({cadastro.email}) vai virar Comprador,
              vinculado à Marca selecionada.
            </DialogDescription>
          </DialogHeader>

          {solicitacao && (
            <div className="bg-muted space-y-1 rounded-md p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Razão social: </span>
                {solicitacao.razaoSocial}
              </p>
              <p>
                <span className="text-muted-foreground">CNPJ: </span>
                {solicitacao.cnpj}
              </p>
              <p>
                <span className="text-muted-foreground">Marca informada: </span>
                {solicitacao.nomeMarcaPretendida}
              </p>
              <p>
                <span className="text-muted-foreground">Endereço: </span>
                {solicitacao.enderecoCompleto}
              </p>
              <p>
                <span className="text-muted-foreground">Nicho(s): </span>
                {solicitacao.nichos.map((n) => n.nicho.nome).join(", ")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="marcaSelect">Vincular à Marca</Label>
            <Select value={marcaId} onValueChange={setMarcaId} required>
              <SelectTrigger id="marcaSelect" className="w-full">
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
            {solicitacao && !marcas.some((m) => m.id === marcaId) && (
              <p className="text-muted-foreground text-xs">
                Nenhuma marca cadastrada bate com &ldquo;{solicitacao.nomeMarcaPretendida}
                &rdquo;? Cadastre-a primeiro em Marcas e volte aqui.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtipoSelect">Tipo de comprador</Label>
            <Select
              value={subtipo}
              onValueChange={(v) => setSubtipo(v as "padrao" | "gerente")}
            >
              <SelectTrigger id="subtipoSelect" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padrao">Padrão</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {estado?.erro && (
            <p className="text-destructive text-sm" role="alert">
              {estado.erro}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pendente || !marcaId}>
              {pendente ? "Aprovando..." : "Aprovar e vincular"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
