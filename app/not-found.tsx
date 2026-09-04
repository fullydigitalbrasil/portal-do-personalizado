import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * 404 do App Router (node_modules/next/dist/docs/.../not-found.md) —
 * cobre tanto `notFound()` chamado explicitamente (ex.: cotação de
 * outra Marca/comprador) quanto qualquer URL sem rota correspondente,
 * já que só existe um layout raiz neste projeto.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <SearchXIcon className="text-muted-foreground size-10" aria-hidden />
      <div className="space-y-1">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          O endereço acessado não existe ou você não tem acesso a ele.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
