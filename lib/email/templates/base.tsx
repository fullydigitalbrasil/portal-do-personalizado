import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export const AZUL_TPO = "#17B4E8";

type EmailShellProps = {
  preview: string;
  titulo: string;
  children: ReactNode;
  /** Texto do link de call-to-action no rodapé (ex.: "Acessar o portal"). Omitido se não houver href. */
  cta?: { texto: string; href: string };
};

/**
 * Layout compartilhado por todos os e-mails do portal (mesmo visual do
 * token-login.tsx do Módulo 1: cabeçalho da marca + card branco).
 */
export function EmailShell({ preview, titulo, children, cta }: EmailShellProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "40px auto",
            padding: "32px",
            borderRadius: "12px",
            maxWidth: "480px",
          }}
        >
          <Text style={{ color: AZUL_TPO, fontWeight: 700, fontSize: "14px", margin: 0 }}>
            TPO Embalagens
          </Text>
          <Heading style={{ fontSize: "20px", margin: "8px 0 16px" }}>{titulo}</Heading>

          {children}

          {cta && (
            <Text style={{ fontSize: "14px", margin: "24px 0 0" }}>
              <Link
                href={cta.href}
                style={{
                  backgroundColor: AZUL_TPO,
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 700,
                  display: "inline-block",
                }}
              >
                {cta.texto}
              </Link>
            </Text>
          )}

          <Text style={{ fontSize: "12px", color: "#888", marginTop: "24px" }}>
            Portal do Personalizado — TPO Embalagens
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
