import { Loader2Icon } from "lucide-react";

/**
 * Loading UI global (App Router — ver node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/loading.md). Como só existe este
 * `layout.tsx` raiz (nenhuma outra rota tem um `loading.tsx` mais
 * específico), este arquivo cobre a navegação em todas as áreas do
 * portal (login, autocadastro, painéis admin/comprador) com um estado
 * de carregamento leve, em vez de uma tela em branco enquanto os dados
 * (Server Components com consultas ao Prisma) são buscados.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Loader2Icon className="text-primary size-6 animate-spin" aria-hidden />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
