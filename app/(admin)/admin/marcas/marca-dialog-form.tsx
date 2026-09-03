"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { criarMarca, atualizarMarca, type EstadoMarca } from "@/lib/admin/marcas-actions";

const ESTADO_INICIAL: EstadoMarca = null;

type MarcaExistente = {
  id: string;
  nomeMarca: string;
  razaoSocial: string;
  cnpj: string;
  enderecoCompleto: string;
};

export function MarcaDialogForm({ marca }: { marca?: MarcaExistente }) {
  const acao = marca ? atualizarMarca : criarMarca;
  const [estado, formAction, pendente] = useActionState(acao, ESTADO_INICIAL);
  const [aberto, setAberto] = useState(false);

  // Fecha o diálogo ao concluir com sucesso. Ajuste de estado durante a
  // renderização (em vez de useEffect) evita um render extra — ver
  // https://react.dev/learn/you-might-not-need-an-effect
  const [estadoAnterior, setEstadoAnterior] = useState(estado);
  if (estado !== estadoAnterior) {
    setEstadoAnterior(estado);
    if (estado?.ok) setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        {marca ? (
          <Button variant="outline" size="sm">
            Editar
          </Button>
        ) : (
          <Button>
            <PlusIcon /> Nova Marca
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          {marca && <input type="hidden" name="id" value={marca.id} />}

          <DialogHeader>
            <DialogTitle>{marca ? "Editar marca" : "Nova marca"}</DialogTitle>
            <DialogDescription>
              Só o Administrador pode criar ou vincular compradores/produtos a
              uma marca.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="nomeMarca">Nome da marca</Label>
            <Input
              id="nomeMarca"
              name="nomeMarca"
              defaultValue={marca?.nomeMarca}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="razaoSocial">Razão social</Label>
            <Input
              id="razaoSocial"
              name="razaoSocial"
              defaultValue={marca?.razaoSocial}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" defaultValue={marca?.cnpj} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enderecoCompleto">Endereço completo</Label>
            <Input
              id="enderecoCompleto"
              name="enderecoCompleto"
              defaultValue={marca?.enderecoCompleto}
              required
            />
          </div>

          {estado?.erro && (
            <p className="text-destructive text-sm" role="alert">
              {estado.erro}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pendente}>
              {pendente ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
