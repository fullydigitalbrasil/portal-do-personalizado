"use client";

import { useActionState, useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cadastrarClienteTPO, type EstadoCliente } from "@/lib/admin/clientes-actions";

const ESTADO_INICIAL: EstadoCliente = null;

type MarcaOpcao = { id: string; nomeMarca: string };

export function ClienteTpoDialogForm({ marcas }: { marcas: MarcaOpcao[] }) {
  const [estado, formAction, pendente] = useActionState(cadastrarClienteTPO, ESTADO_INICIAL);
  const [aberto, setAberto] = useState(false);
  const [marcaId, setMarcaId] = useState("");

  const [estadoAnterior, setEstadoAnterior] = useState(estado);
  if (estado !== estadoAnterior) {
    setEstadoAnterior(estado);
    if (estado?.ok) setAberto(false);
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={marcas.length === 0}>
          <PlusIcon /> Cadastrar cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="marcaId" value={marcaId} />

          <DialogHeader>
            <DialogTitle>Cadastrar cliente pela TPO</DialogTitle>
            <DialogDescription>
              Use quando o cadastro é feito diretamente pela equipe, já
              vinculado a uma Marca. O cadastro ainda passa pela fila de
              aprovação antes de virar Comprador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="marcaId">Marca</Label>
            <Select value={marcaId} onValueChange={setMarcaId} required>
              <SelectTrigger id="marcaId" className="w-full">
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
            <Label htmlFor="nomeCompleto">Nome completo</Label>
            <Input id="nomeCompleto" name="nomeCompleto" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" required />
          </div>

          {estado?.erro && (
            <p className="text-destructive text-sm" role="alert">
              {estado.erro}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pendente || !marcaId}>
              {pendente ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
