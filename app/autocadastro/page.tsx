import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AutocadastroPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Cadastro de novo cliente
        </h1>
        <p className="text-muted-foreground text-sm">
          Seu cadastro fica pendente de aprovação da TPO Embalagens antes de
          liberar cotações.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do comprador</CardTitle>
          <CardDescription>Nome completo, CPF, WhatsApp e e-mail.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" name="cpf" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
          <CardDescription>
            Razão social, CNPJ, marca, endereço e nicho do estabelecimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="razao_social">Razão social</Label>
            <Input id="razao_social" name="razao_social" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" name="marca" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="endereco">Endereço completo</Label>
            <Input id="endereco" name="endereco" required />
          </div>
          {/* TODO (Módulo 3): campo "Nicho do estabelecimento" como seleção
              múltipla (Oriental, Pizzaria, Hamburgueria, Confeitaria,
              Salgados, Esfiha, Refeições, Pastelaria, Marmitas, Padaria,
              Carnes) — componente a criar em components/nicho-select.tsx. */}
        </CardContent>
      </Card>

      <Button type="submit" size="lg">
        Enviar cadastro
      </Button>
      {/* TODO (Módulo 3): Server Action que cria Usuario (perfil=visitante,
          status_cadastro=pendente_aprovacao) + SolicitacaoCadastro +
          SolicitacaoCadastroNicho, e dispara notificação para o Admin. */}
    </main>
  );
}
