import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";
import { obterSessao } from "@/lib/auth/session";
import { NovaCotacaoForm } from "./nova-cotacao-form";

export default async function NovaCotacaoPage() {
  const sessao = await obterSessao();

  if (!sessao || sessao.perfil !== "comprador") {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Aguardando aprovação</CardTitle>
            <CardDescription>
              Esta área é exclusiva para Compradores já aprovados pela TPO
              Embalagens. Assim que seu cadastro for aprovado, você será
              avisado por e-mail e poderá solicitar cotações por aqui.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const produtos = await prisma.produto.findMany({
    where: { marcaId: sessao.marcaId ?? undefined, ativo: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, descricao: true },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Nova cotação
        </h1>
        <p className="text-muted-foreground text-sm">
          Escolha um produto do catálogo ou descreva um produto sob
          especificação.
        </p>
      </div>

      <NovaCotacaoForm produtos={produtos} />
    </main>
  );
}
