import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const indicadores = [
  { label: "Cadastros pendentes", valor: "—" },
  { label: "Cotações a revisar", valor: "—" },
  { label: "Pedidos em produção", valor: "—" },
  { label: "Entregas no mês", valor: "—" },
];

export default function AdminDashboardPage() {
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
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{item.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* TODO (Módulo 8): ligar os indicadores às consultas reais via Prisma. */}
    </main>
  );
}
