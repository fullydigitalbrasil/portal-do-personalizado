import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { ClienteTpoDialogForm } from "./cliente-tpo-dialog-form";
import { AprovarDialogForm } from "./aprovar-dialog-form";
import { RecusarButton } from "./recusar-button";
import { EditarCompradorDialogForm } from "./editar-comprador-dialog-form";

const LABEL_ORIGEM: Record<string, string> = {
  autocadastro: "Autocadastro",
  cadastro_tpo: "Cadastro TPO",
};

const LABEL_SUBTIPO: Record<string, string> = {
  padrao: "Padrão",
  gerente: "Gerente",
};

export default async function ClientesPage() {
  const sessao = await obterSessao();
  const ehAdmin = sessao?.perfil === "administrador";

  const [usuarios, marcas] = await Promise.all([
    prisma.usuario.findMany({
      where: { perfil: { in: ["visitante", "comprador"] } },
      orderBy: { dataCriacao: "desc" },
      include: {
        marca: true,
        solicitacaoCadastro: {
          include: { nichos: { include: { nicho: true } } },
        },
      },
    }),
    prisma.marca.findMany({ where: { ativa: true }, orderBy: { nomeMarca: "asc" } }),
  ]);

  const pendentes = usuarios.filter((u) => u.statusCadastro === "pendente_aprovacao");
  const compradores = usuarios.filter((u) => u.perfil === "comprador" && u.statusCadastro === "aprovado");
  const recusados = usuarios.filter((u) => u.statusCadastro === "recusado");

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            Clientes
          </h1>
          <p className="text-muted-foreground text-sm">
            {ehAdmin
              ? "Aprovação de cadastros e gestão dos compradores por Marca."
              : "Visualização da fila de aprovação e dos compradores. Aprovar, recusar e editar são exclusivos do Administrador."}
          </p>
        </div>
        {ehAdmin && <ClienteTpoDialogForm marcas={marcas} />}
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="compradores">Compradores ({compradores.length})</TabsTrigger>
          <TabsTrigger value="recusados">Recusados ({recusados.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Marca</TableHead>
                {ehAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={ehAdmin ? 5 : 4} className="text-muted-foreground py-10 text-center">
                    Nenhum cadastro pendente de aprovação.
                  </TableCell>
                </TableRow>
              )}
              {pendentes.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nomeCompleto}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LABEL_ORIGEM[usuario.origemCadastro]}</Badge>
                  </TableCell>
                  <TableCell>
                    {usuario.marca?.nomeMarca ??
                      usuario.solicitacaoCadastro?.nomeMarcaPretendida ??
                      "—"}
                  </TableCell>
                  {ehAdmin && (
                    <TableCell className="flex justify-end gap-2 text-right">
                      <AprovarDialogForm
                        cadastro={{
                          id: usuario.id,
                          nomeCompleto: usuario.nomeCompleto,
                          email: usuario.email,
                          cpf: usuario.cpf,
                          whatsapp: usuario.whatsapp,
                          origemCadastro: usuario.origemCadastro,
                          marcaId: usuario.marcaId,
                          solicitacaoCadastro: usuario.solicitacaoCadastro,
                        }}
                        marcas={marcas}
                      />
                      <RecusarButton id={usuario.id} nome={usuario.nomeCompleto} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="compradores">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Tipo</TableHead>
                {ehAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {compradores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={ehAdmin ? 5 : 4} className="text-muted-foreground py-10 text-center">
                    Nenhum comprador aprovado ainda.
                  </TableCell>
                </TableRow>
              )}
              {compradores.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nomeCompleto}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.marca?.nomeMarca ?? "—"}</TableCell>
                  <TableCell>
                    {usuario.subtipoComprador ? (
                      <Badge variant="outline">{LABEL_SUBTIPO[usuario.subtipoComprador]}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  {ehAdmin && (
                    <TableCell className="text-right">
                      <EditarCompradorDialogForm
                        comprador={{
                          id: usuario.id,
                          nomeCompleto: usuario.nomeCompleto,
                          marcaId: usuario.marcaId,
                          subtipoComprador: usuario.subtipoComprador,
                        }}
                        marcas={marcas}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="recusados">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recusados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground py-10 text-center">
                    Nenhum cadastro recusado.
                  </TableCell>
                </TableRow>
              )}
              {recusados.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nomeCompleto}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{LABEL_ORIGEM[usuario.origemCadastro]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </main>
  );
}
