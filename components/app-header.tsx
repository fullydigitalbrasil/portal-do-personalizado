import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppNavLinks } from "@/components/app-nav-links";
import { sair } from "@/lib/auth/actions";
import type { SessionPayload } from "@/lib/auth/constants";

const LABEL_PERFIL: Record<SessionPayload["perfil"], string> = {
  administrador: "Administrador",
  colaborador: "Colaborador",
  visitante: "Visitante",
  comprador: "Comprador",
};

export function AppHeader({ sessao }: { sessao: SessionPayload }) {
  const podeVerNavAdmin = sessao.perfil === "administrador" || sessao.perfil === "colaborador";

  return (
    <header className="flex items-center justify-between gap-6 border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="font-[family-name:var(--font-display)] text-primary font-semibold">
          Portal do Personalizado
        </span>
        {podeVerNavAdmin && <AppNavLinks />}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm">
          {sessao.nomeCompleto}{" "}
          <Badge variant="secondary">{LABEL_PERFIL[sessao.perfil]}</Badge>
        </span>
        <form action={sair}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
