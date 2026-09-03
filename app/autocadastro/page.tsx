import Link from "next/link";

import { prisma } from "@/lib/db/client";
import { AutocadastroForm } from "./autocadastro-form";

export default async function AutocadastroPage() {
  const nichos = await prisma.nicho.findMany({ orderBy: { nome: "asc" } });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 p-6">
      <div>
        <span className="font-[family-name:var(--font-display)] text-primary font-semibold">
          Portal do Personalizado
        </span>
        <h1 className="font-[family-name:var(--font-display)] mt-2 text-2xl font-bold">
          Cadastro de novo cliente
        </h1>
        <p className="text-muted-foreground text-sm">
          Seu cadastro fica pendente de aprovação da TPO Embalagens antes de
          liberar cotações. Já é cliente?{" "}
          <Link href="/login" className="text-primary underline">
            Entrar
          </Link>
          .
        </p>
      </div>

      <AutocadastroForm nichos={nichos} />
    </main>
  );
}
