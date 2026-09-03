import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { obterSessao } from "@/lib/auth/session";

// Rota de "client upload": os arquivos vão direto do navegador do
// Comprador para o Vercel Blob, sem passar pelo corpo desta função (que
// tem limite de tamanho bem menor que os 20MB permitidos por anexo —
// PRD v2.1, seção 5.1). Esta rota só troca um token de upload de curta
// duração depois de confirmar a sessão.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const sessao = await obterSessao();
        if (!sessao || sessao.perfil !== "comprador") {
          throw new Error("Apenas Compradores aprovados podem enviar anexos.");
        }

        return {
          access: "public",
          addRandomSuffix: true,
          // "Todos os formatos de imagem e de documento" (PRD v2.1, 5.1).
          allowedContentTypes: [
            "image/*",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "application/zip",
          ],
          // Máximo 20MB por arquivo (definido no PRD).
          maximumSizeInBytes: 20 * 1024 * 1024,
          tokenPayload: JSON.stringify({ usuarioId: sessao.usuarioId }),
        };
      },
      onUploadCompleted: async () => {
        // Sem efeito colateral aqui de propósito: o registro do Anexo no
        // banco é criado por criarCotacao() (lib/cotacao/actions.ts) só
        // depois que TODOS os arquivos da solicitação terminaram de subir
        // e o Comprador confirma o envio — evita anexo órfão sem Cotacao.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (erro) {
    return NextResponse.json(
      { error: (erro as Error).message },
      { status: 400 }
    );
  }
}
