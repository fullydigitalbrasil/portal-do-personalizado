"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { PaperclipIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { criarCotacao } from "@/lib/cotacao/actions";

const TAMANHO_MAXIMO_BYTES = 20 * 1024 * 1024;
const TIPOS_ACEITOS =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip";

type ProdutoOpcao = { id: string; nome: string; descricao: string | null };

function formatarTamanho(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function NovaCotacaoForm({ produtos }: { produtos: ProdutoOpcao[] }) {
  const [modo, setModo] = useState<"catalogo" | "especificacao">(
    produtos.length > 0 ? "catalogo" : "especificacao"
  );
  const [produtoId, setProdutoId] = useState("");
  const [descricaoLivre, setDescricaoLivre] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [progresso, setProgresso] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ numero: string } | null>(null);
  const [enviando, startTransition] = useTransition();
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  function adicionarArquivos(lista: FileList | null) {
    if (!lista) return;
    const novos = Array.from(lista);
    const grandeDemais = novos.find((f) => f.size > TAMANHO_MAXIMO_BYTES);
    if (grandeDemais) {
      setErro(`"${grandeDemais.name}" tem mais de 20MB — remova ou escolha outro arquivo.`);
      return;
    }
    setErro(null);
    setArquivos((atual) => [...atual, ...novos]);
    if (inputArquivoRef.current) inputArquivoRef.current.value = "";
  }

  function removerArquivo(index: number) {
    setArquivos((atual) => atual.filter((_, i) => i !== index));
  }

  function enviar() {
    setErro(null);

    if (modo === "catalogo" && !produtoId) {
      setErro("Selecione um produto do catálogo.");
      return;
    }
    if (modo === "especificacao" && !descricaoLivre.trim()) {
      setErro("Descreva o produto sob especificação.");
      return;
    }
    const quantidadeNumero = Number(quantidade);
    if (!quantidadeNumero || quantidadeNumero <= 0) {
      setErro("Informe uma quantidade válida.");
      return;
    }
    if (arquivos.length === 0) {
      setErro("Anexe ao menos um arquivo (arte, logo, identidade da marca ou referência).");
      return;
    }

    startTransition(async () => {
      try {
        const anexos = [];
        for (let i = 0; i < arquivos.length; i++) {
          const arquivo = arquivos[i];
          setProgresso(`Enviando anexo ${i + 1} de ${arquivos.length}...`);
          const blob = await upload(arquivo.name, arquivo, {
            access: "public",
            handleUploadUrl: "/api/cotacao-upload",
          });
          anexos.push({
            nomeArquivo: arquivo.name,
            tipoArquivo: arquivo.type || "application/octet-stream",
            tamanhoBytes: arquivo.size,
            urlArquivo: blob.url,
          });
        }

        setProgresso("Salvando cotação...");
        const resultadoAcao = await criarCotacao({
          produtoId: modo === "catalogo" ? produtoId : undefined,
          descricaoLivre: modo === "especificacao" ? descricaoLivre.trim() : undefined,
          quantidade: quantidadeNumero,
          anexos,
        });

        if (!resultadoAcao.ok) {
          setErro(resultadoAcao.erro);
          return;
        }

        setResultado({ numero: resultadoAcao.numero });
      } catch {
        setErro("Não foi possível enviar a cotação. Tente novamente.");
      } finally {
        setProgresso(null);
      }
    });
  }

  if (resultado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-display)]">
            Cotação {resultado.numero} enviada!
          </CardTitle>
          <CardDescription>
            Recebemos sua solicitação. A equipe da TPO Embalagens vai revisar
            e você será avisado por e-mail assim que a cotação estiver
            pronta.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Produto</CardTitle>
          <CardDescription>
            Catálogo da sua marca ou &ldquo;sob especificação&rdquo; (produto novo).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={modo === "catalogo" ? "default" : "outline"}
              size="sm"
              disabled={produtos.length === 0}
              onClick={() => setModo("catalogo")}
            >
              Produto do catálogo
            </Button>
            <Button
              type="button"
              variant={modo === "especificacao" ? "default" : "outline"}
              size="sm"
              onClick={() => setModo("especificacao")}
            >
              Sob especificação
            </Button>
          </div>

          {modo === "catalogo" ? (
            produtos.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Ainda não há produtos cadastrados para sua Marca. Escolha
                &ldquo;Sob especificação&rdquo; para descrever o que você precisa.
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="produtoId">Produto</Label>
                <Select value={produtoId} onValueChange={setProdutoId}>
                  <SelectTrigger id="produtoId" className="w-full">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          ) : (
            <div className="space-y-2">
              <Label htmlFor="descricaoLivre">Descrição do produto</Label>
              <Textarea
                id="descricaoLivre"
                value={descricaoLivre}
                onChange={(e) => setDescricaoLivre(e.target.value)}
                placeholder="Dimensões, material, acabamento, prazo desejado etc."
                rows={4}
              />
              <p className="text-muted-foreground text-xs">
                Produtos sob especificação vão direto para precificação
                manual, com retorno em até 5 dias úteis.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min={1}
              step={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="max-w-40"
            />
          </div>
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
        <CardContent className="space-y-3">
          <Input
            ref={inputArquivoRef}
            type="file"
            multiple
            accept={TIPOS_ACEITOS}
            onChange={(e) => adicionarArquivos(e.target.files)}
          />
          {arquivos.length > 0 && (
            <ul className="space-y-2">
              {arquivos.map((arquivo, index) => (
                <li
                  key={`${arquivo.name}-${index}`}
                  className="bg-muted flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <PaperclipIcon className="text-muted-foreground size-4 shrink-0" />
                    <span className="truncate">{arquivo.name}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatarTamanho(arquivo.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removerArquivo(index)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    aria-label={`Remover ${arquivo.name}`}
                  >
                    <XIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {erro && (
        <p className="text-destructive text-sm" role="alert">
          {erro}
        </p>
      )}

      <Button type="button" size="lg" disabled={enviando} onClick={enviar}>
        {enviando ? progresso ?? "Enviando..." : "Enviar cotação"}
      </Button>
    </div>
  );
}
