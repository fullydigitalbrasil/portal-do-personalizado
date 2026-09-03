import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { obterSessao } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // O proxy.ts já protege /admin/*; esta checagem é defesa em profundidade
  // (garante que nenhuma página deste grupo renderize sem sessão).
  const sessao = await obterSessao();
  if (!sessao) redirect("/login");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader sessao={sessao} />
      {children}
    </div>
  );
}
