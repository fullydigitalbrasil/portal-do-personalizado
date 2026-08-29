import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NovaCotacaoPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
          Nova cotação
        </h1>
        <p className="text-muted-foreground text-sm">
          Escolha um produto do catálogo ou descreva um produto sob
          especificação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produto</CardTitle>
          <CardDescription>
            Catálogo da sua marca ou "sob especificação" (produto novo).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO (Módulo 4): seletor de produto do catálogo (filtrado pela
              MARCA do comprador logado) + opção "sob especificação" com
              descrição livre. */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anexos (obrigatório)</CardTitle>
          <CardDescription>
            Arte, logo, identidade da marca ou foto de referência — imagem ou
            documento, até 20MB por arquivo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO (Módulo 4): dropzone de upload direto para o Vercel Blob
              (client upload), validando tipo e tamanho (máx. 20MB). */}
        </CardContent>
      </Card>

      <Button type="submit" size="lg">
        Enviar cotação
      </Button>
      {/* TODO (Módulo 4): Server Action que cria Cotacao (numero sequencial
          "10" + 5 dígitos) + ItemCotacao + Anexo, calcula
          valor_total_sugerido via FaixaPreco quando aplicável, e define
          prazo_retorno_manual (5 dias úteis) para produtos sob
          especificação. */}
    </main>
  );
}
