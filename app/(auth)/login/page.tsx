import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)] text-xl">
            Entrar
          </CardTitle>
          <CardDescription>
            Informe seu e-mail cadastrado para receber o código de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@empresa.com.br" />
          </div>
          <Button className="w-full" type="submit">
            Enviar código
          </Button>
          {/* TODO (Módulo 1): Server Action que gera o TokenAutenticacao,
              envia por e-mail via Resend e redireciona para a tela de
              digitação do código (5 min de validade, reenvio a cada 120s,
              bloqueio após 5 tentativas). */}
        </CardContent>
      </Card>
    </main>
  );
}
