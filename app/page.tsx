import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">TPO Embalagens</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
          Portal do Personalizado
        </h1>
        <p className="text-muted-foreground max-w-md">
          Cotações e acompanhamento de pedidos de embalagens personalizadas,
          direto com a TPO Embalagens.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/autocadastro">Quero me cadastrar</Link>
        </Button>
      </div>
    </main>
  );
}
