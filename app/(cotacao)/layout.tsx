import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { obterSessao } from "@/lib/auth/session";

export default async function CotacaoLayout({ children }: { children: React.ReactNode }) {
  const sessao = await obterSessao();
  if (!sessao) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader sessao={sessao} />
      {children}
    </div>
  );
}
