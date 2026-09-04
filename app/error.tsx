"use client"; // Error boundaries do App Router precisam ser Client Components.

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary global (App Router — node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/error.md). Nesta versão do Next.js
 * (16.3.3) a prop estável para tentar de novo é `retry` (estabilizada na
 * v16.3.0) — `reset` ainda funciona, mas os docs recomendam `retry`;
 * seguimos a recomendação atual em vez do nome mais antigo, que é o que
 * o conhecimento de treinamento tende a sugerir por padrão.
 */
export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertTriangleIcon className="text-destructive size-10" aria-hidden />
      <div className="space-y-1">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold">
          Algo deu errado
        </h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          Tente novamente em instantes. Se o problema continuar, avise a
          equipe.
        </p>
      </div>
      <Button onClick={() => retry()}>Tentar de novo</Button>
    </main>
  );
}
