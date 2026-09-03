import { Label } from "@/components/ui/label";

type Nicho = { id: string; nome: string };

// Sem "use client" de propósito: são checkboxes HTML nativos, então
// funcionam normalmente dentro de qualquer <form action={...}> — o
// FormData.getAll("nichoIds") já devolve os ids marcados, sem precisar de
// estado controlado nem de JS no cliente.
export function NichoSelect({ nichos }: { nichos: Nicho[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {nichos.map((nicho) => (
        <div key={nicho.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`nicho-${nicho.id}`}
            name="nichoIds"
            value={nicho.id}
            className="border-input accent-primary h-4 w-4 rounded"
          />
          <Label htmlFor={`nicho-${nicho.id}`} className="font-normal">
            {nicho.nome}
          </Label>
        </div>
      ))}
    </div>
  );
}
