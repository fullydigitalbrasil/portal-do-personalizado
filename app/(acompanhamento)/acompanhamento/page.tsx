import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AcompanhamentoPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Acompanhamento
        </h1>
        <p className="text-muted-foreground text-sm">
          Suas cotações e pedidos, do envio até a entrega.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Fase</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Atualizado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-muted-foreground text-center py-10">
              Nenhuma cotação ainda.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      {/* TODO (Módulo 6): listar Cotacao do comprador logado (Padrão vê só
          as próprias; Gerente vê todas da MARCA), com filtro por
          status_fase e Badge colorido por fase (Cotação, Aprovação,
          Financeiro, Produção, Entrega). */}
    </main>
  );
}
