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
import { atualizarComprador, type EstadoCliente } from "@/lib/admin/clientes-actions";

const ESTADO_INICIAL: EstadoCliente = null;

type MarcaOpcao = { id: string; nomeMarca: string };

type Comprador = {
  id: string;
  nomeCompleto: string;
  marcaId: string | null;
  subtipoComprador: "padrao" | "gerente" | null;
};

export function EditarCompradorDialogForm({
  comprador,
  marcas,
}: {
  comprador: Comprador;
  marcas: MarcaOpcao[];
}) {
  const [estado, formAction, pendente] = useActionState(atualizarComprador, ESTADO_INICIAL);
  const [aberto, setAberto] = useState(false);
  const [marcaId, setMarcaId] = useState(comprador.marcaId ?? "");
  const [subtipo, setSubtipo] = useState<"padrao" | "gerente">(
    comprador.subtipoComprador ?? "padrao"
  );

  const [estadoAnterior, setEstadoAnterior] = useState(estado);
  if (estado !== estadoAnterior) {
    setEstadoAnterior(estado);
    if (estado?.ok) setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="usuarioId" value={comprador.id} />
          <input type="hidden" name="marcaId" value={marcaId} />
          <input type="hidden" name="subtipoComprador" value={subtipo} />

          <DialogHeader>
            <DialogTitle>Editar {comprador.nomeCompleto}</DialogTitle>
            <DialogDescription>
              A Marca e o tipo de comprador podem ser alterados a qualquer
              momento pelo Administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="marcaSelectEdicao">Marca</Label>
            <Select value={marcaId} onValueChange={setMarcaId} required>
              <SelectTrigger id="marcaSelectEdicao" className="w-full">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtipoSelectEdicao">Tipo de comprador</Label>
            <Select
              value={subtipo}
              onValueChange={(v) => setSubtipo(v as "padrao" | "gerente")}
            >
              <SelectTrigger id="subtipoSelectEdicao" className="w-full">
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
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
