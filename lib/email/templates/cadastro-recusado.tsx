import { Text } from "@react-email/components";

import { EmailShell } from "./base";

type Props = {
  nome: string;
};

/** cadastro_recusado (PRD v2.1, seção 5.1 e 7). */
export default function CadastroRecusadoEmail({ nome }: Props) {
  return (
    <EmailShell preview="Sobre seu cadastro no Portal do Personalizado" titulo="Cadastro não aprovado">
      <Text style={{ fontSize: "14px", color: "#333" }}>Olá, {nome},</Text>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        Depois de analisar seu cadastro no Portal do Personalizado, não foi
        possível aprová-lo neste momento.
      </Text>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        Se quiser entender melhor ou enviar novas informações, fale com a
        equipe da TPO Embalagens pelos canais de sempre.
      </Text>
    </EmailShell>
  );
}
