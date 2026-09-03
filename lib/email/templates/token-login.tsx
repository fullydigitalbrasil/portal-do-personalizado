import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const AZUL_TPO = "#17B4E8";

type TokenLoginEmailProps = {
  nome: string;
  codigo: string;
};

/**
 * E-mail de login (PRD v2.1, seção 3.1): token numérico, válido por 5
 * minutos. Renderizado com React Email e enviado via Resend
 * (lib/email/resend.ts).
 */
export default function TokenLoginEmail({ nome, codigo }: TokenLoginEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Seu código de acesso: {codigo}</Preview>
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "32px",
            borderRadius: "12px",
            maxWidth: "420px",
          }}
        >
          <Text style={{ color: AZUL_TPO, fontWeight: 700, fontSize: "14px", margin: 0 }}>
            TPO Embalagens
          </Text>
          <Heading style={{ fontSize: "20px", margin: "8px 0 16px" }}>
            Portal do Personalizado
          </Heading>
          <Text style={{ fontSize: "14px", color: "#333" }}>Olá, {nome},</Text>
          <Text style={{ fontSize: "14px", color: "#333" }}>
            Use o código abaixo para entrar no portal. Ele vale por 5 minutos.
          </Text>
          <Section
            style={{
              backgroundColor: "#f0faff",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              margin: "24px 0",
            }}
          >
            <Text
              style={{
                fontSize: "32px",
                fontWeight: 700,
                letterSpacing: "8px",
                color: AZUL_TPO,
                margin: 0,
              }}
            >
              {codigo}
            </Text>
          </Section>
          <Text style={{ fontSize: "12px", color: "#888" }}>
            Se você não pediu esse código, pode ignorar este e-mail com segurança.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
