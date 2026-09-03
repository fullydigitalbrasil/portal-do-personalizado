import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { MarcaDialogForm } from "./marca-dialog-form";
import { ToggleAtivaMarcaButton } from "./toggle-ativa-marca-button";

export default async function MarcasPage() {
  const sessao = await obterSessao();
  const ehAdmin = sessao?.perfil === "administrador";

  const marcas = await prisma.marca.findMany({ orderBy: { nomeMarca: "asc" } });

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Marcas
          </h1>
          <p className="text-muted-foreground text-sm">
            {ehAdmin
              ? "Cadastro exclusivo do Administrador. Compradores e produtos são sempre vinculados a uma marca."
              : "Você pode visualizar as marcas cadastradas. Cadastro e edição são exclusivos do Administrador."}
          </p>
        </div>
        {ehAdmin && <MarcaDialogForm />}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Razão social</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Status</TableHead>
            {ehAdmin && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {marcas.length === 0 && (
            <TableRow>
              <TableCell colSpan={ehAdmin ? 5 : 4} className="text-muted-foreground py-10 text-center">
                Nenhuma marca cadastrada ainda.
              </TableCell>
            </TableRow>
          )}
          {marcas.map((marca) => (
            <TableRow key={marca.id}>
              <TableCell className="font-medium">{marca.nomeMarca}</TableCell>
              <TableCell>{marca.razaoSocial}</TableCell>
              <TableCell>{marca.cnpj}</TableCell>
              <TableCell>
                <Badge variant={marca.ativa ? "default" : "secondary"}>
                  {marca.ativa ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
              {ehAdmin && (
                <TableCell className="flex justify-end gap-2 text-right">
                  <MarcaDialogForm marca={marca} />
                  <ToggleAtivaMarcaButton id={marca.id} ativa={marca.ativa} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
