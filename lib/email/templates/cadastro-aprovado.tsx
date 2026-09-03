import { Text } from "@react-email/components";

import { EmailShell } from "./base";

type Props = {
  nome: string;
  nomeMarca: string;
  urlLogin: string;
};

/** cadastro_aprovado (PRD v2.1, seção 5.1 e 7). */
export default function CadastroAprovadoEmail({ nome, nomeMarca, urlLogin }: Props) {
  return (
    <EmailShell
      preview="Seu cadastro foi aprovado!"
      titulo="Cadastro aprovado"
      cta={{ texto: "Acessar o portal", href: urlLogin }}
    >
      <Text style={{ fontSize: "14px", color: "#333" }}>Olá, {nome},</Text>
      <Text style={{ fontSize: "14px", color: "#333" }}>
        Seu cadastro na <strong>{nomeMarca}</strong> foi aprovado pela TPO
        Embalagens. Você já pode entrar no Portal do Personalizado com seu
        e-mail e solicitar suas cotações.
      </Text>
    </EmailShell>
  );
}
