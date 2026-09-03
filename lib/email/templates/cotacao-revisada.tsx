import { Section, Text } from "@react-email/components";

import { AZUL_TPO, EmailShell } from "./base";

type Props = {
  nome: string;
  numero: string;
  valorFormatado: string;
  urlLogin: string;
};

/** cotacao_revisada (PRD v2.1, seção 6.1 e 7) — preço final definido/ajustado pelo Administrador. */
export default function CotacaoRevisadaEmail({ nome, numero, valorFormatado, urlLogin }: Props) {
  return (
    <EmailShell
      preview={`Cotação ${numero} revisada: ${valorFormatado}`}
      titulo="Sua cotação foi revisada"
      cta={{ texto: "Ver detalhes no portal", href: urlLogin }}
    >
      <Text style={{ fontSize: "14px", color: "#333" }}>Olá, {nome},</Text>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        A cotação <strong>{numero}</strong> foi revisada pela nossa equipe.
        Valor final:
      </Text>
      <Section
        style={{
          backgroundColor: "#f0faff",
          borderRadius: "8px",
          padding: "16px",
          textAlign: "center",
          margin: "16px 0",
        }}
      >
        <Text style={{ fontSize: "24px", fontWeight: 700, color: AZUL_TPO, margin: 0 }}>
          {valorFormatado}
        </Text>
      </Section>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        Acesse o portal para conferir todos os detalhes.
      </Text>
    </EmailShell>
  );
}
