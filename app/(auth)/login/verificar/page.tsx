import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VerificarForm } from "./verificar-form";

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)] text-xl">
            Digite o código
          </CardTitle>
          <CardDescription>
            Enviamos um código de 6 dígitos para <strong>{email}</strong>. Ele vale
            por 5 minutos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerificarForm email={email} />
        </CardContent>
      </Card>
    </main>
  );
}
