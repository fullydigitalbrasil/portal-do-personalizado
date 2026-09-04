import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/client";

/**
 * Início do mês corrente, à meia-noite — usado para "Entregas no mês".
 * Cotacao não tem um campo dedicado de "data de entrega"; usamos
 * `dataUltimaAtualizacao` (@updatedAt) no momento em que o status vira
 * `recebido`, já que a mudança de status atualiza a própria linha da
 * Cotacao (ver `alterarStatusCotacao`, Módulo 5).
 */
function inicioDoMes(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  const [cadastrosPendentes, cotacoesARevisar, pedidosEmProducao, entregasNoMes] =
    await Promise.all([
      prisma.usuario.count({ where: { statusCadastro: "pendente_aprovacao" } }),
      // "A revisar" = ainda na fase inicial de Cotação (antes do Admin
      // definir/confirmar o preço e avançar o status) — cobre tanto a
      // precificação manual pendente quanto a automática ainda não revisada.
      prisma.cotacao.count({ where: { statusFase: "cotacao" } }),
      prisma.cotacao.count({ where: { statusFase: "producao" } }),
      prisma.cotacao.count({
        where: { status: "recebido", dataUltimaAtualizacao: { gte: inicioDoMes() } },
      }),
    ]);

  const indicadores = [
    { label: "Cadastros pendentes", valor: cadastrosPendentes, href: "/admin/clientes" },
    { label: "Cotações a revisar", valor: cotacoesARevisar, href: "/admin/cotacoes" },
    { label: "Pedidos em produção", valor: pedidosEmProducao, href: "/admin/cotacoes" },
    { label: "Entregas no mês", valor: entregasNoMes, href: "/admin/cotacoes" },
  ];

  return (
    <main className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Painel Admin
        </h1>
        <p className="text-muted-foreground text-sm">
          Visão geral de cadastros, cotações e pedidos.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {indicadores.map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{item.valor}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
