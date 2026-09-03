import { Text } from "@react-email/components";

import { EmailShell } from "./base";

type Props = {
  nome: string;
  numero: string;
  statusLabel: string;
  faseLabel: string;
  urlLogin: string;
};

/** mudanca_status (PRD v2.1, seção 6.2 e 7) — um e-mail por mudança manual de status. */
export default function MudancaStatusEmail({
  nome,
  numero,
  statusLabel,
  faseLabel,
  urlLogin,
}: Props) {
  return (
    <EmailShell
      preview={`Cotação ${numero}: ${statusLabel}`}
      titulo="Atualização da sua cotação"
      cta={{ texto: "Acompanhar no portal", href: urlLogin }}
    >
      <Text style={{ fontSize: "14px", color: "#333" }}>Olá, {nome},</Text>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        A cotação <strong>{numero}</strong> avançou para uma nova etapa:
      </Text>
      <Text style={{ fontSize: "18px", fontWeight: 700, color: "#333", margin: "8px 0" }}>
        {statusLabel}
      </Text>
      <Text style={{ fontSize: "14px", color: "#888" }}>Fase: {faseLabel}</Text>
    </EmailShell>
  );
}
