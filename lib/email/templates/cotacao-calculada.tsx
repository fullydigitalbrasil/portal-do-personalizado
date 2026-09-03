import { Section, Text } from "@react-email/components";

import { AZUL_TPO, EmailShell } from "./base";

type Props = {
  nome: string;
  numero: string;
  nomeProduto: string;
  quantidade: number;
  valorFormatado: string;
  urlLogin: string;
};

/** cotacao_calculada (PRD v2.1, seção 6.1 e 7) — precificação automática. */
export default function CotacaoCalculadaEmail({
  nome,
  numero,
  nomeProduto,
  quantidade,
  valorFormatado,
  urlLogin,
}: Props) {
  return (
    <EmailShell
      preview={`Cotação ${numero}: valor sugerido ${valorFormatado}`}
      titulo="Sua cotação já tem um valor sugerido"
      cta={{ texto: "Acompanhar no portal", href: urlLogin }}
    >
      <Text style={{ fontSize: "14px", color: "#333" }}>Olá, {nome},</Text>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        Recebemos sua cotação <strong>{numero}</strong> ({nomeProduto}, qtd.{" "}
        {quantidade}) e já calculamos um valor sugerido:
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
        Nossa equipe ainda vai revisar antes da confirmação final — você
        será avisado se o valor mudar.
      </Text>
    </EmailShell>
  );
}
