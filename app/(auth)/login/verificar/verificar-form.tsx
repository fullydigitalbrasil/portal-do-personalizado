"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  solicitarToken,
  verificarToken,
  type EstadoSolicitarToken,
  type EstadoVerificarToken,
} from "@/lib/auth/actions";

const TAMANHO_CODIGO = 6;
const COOLDOWN_REENVIO_SEGUNDOS = 120;

const ESTADO_VERIFICAR_INICIAL: EstadoVerificarToken = null;
const ESTADO_REENVIAR_INICIAL: EstadoSolicitarToken = null;

export function VerificarForm({ email }: { email: string }) {
  const [estado, formAction, pendente] = useActionState(
    verificarToken,
    ESTADO_VERIFICAR_INICIAL
  );
  const [estadoReenvio, reenviarAction, reenviando] = useActionState(
    solicitarToken,
    ESTADO_REENVIAR_INICIAL
  );

  const [digitos, setDigitos] = useState<string[]>(Array(TAMANHO_CODIGO).fill(""));
  const [cooldown, setCooldown] = useState(COOLDOWN_REENVIO_SEGUNDOS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const intervalo = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(intervalo);
  }, [cooldown]);

  // Um reenvio bem-sucedido redireciona para esta mesma página (a Server
  // Action chama redirect()), o que remonta o componente e já reinicia o
  // cooldown pelo valor inicial do useState acima — sem precisar de efeito.

  function handleChange(index: number, valor: string) {
    const char = valor.replace(/\D/g, "").slice(-1);
    setDigitos((atual) => {
      const proximo = [...atual];
      proximo[index] = char;
      return proximo;
    });
    if (char && index < TAMANHO_CODIGO - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const colado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, TAMANHO_CODIGO);
    if (!colado) return;
    e.preventDefault();
    setDigitos((atual) => {
      const proximo = [...atual];
      for (let i = 0; i < TAMANHO_CODIGO; i++) proximo[i] = colado[i] ?? "";
      return proximo;
    });
    inputsRef.current[Math.min(colado.length, TAMANHO_CODIGO - 1)]?.focus();
  }

  const codigo = digitos.join("");

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="codigo" value={codigo} />

        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digitos.map((digito, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={digito}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="border-input focus-visible:ring-ring/50 h-12 w-10 rounded-md border text-center text-lg shadow-xs outline-none focus-visible:ring-2"
              aria-label={`Dígito ${i + 1} do código`}
            />
          ))}
        </div>

        {estado?.erro && (
          <p className="text-destructive text-sm" role="alert">
            {estado.erro}
          </p>
        )}

        <Button className="w-full" type="submit" disabled={pendente || codigo.length < TAMANHO_CODIGO}>
          {pendente ? "Verificando..." : "Confirmar"}
        </Button>
      </form>

      <form action={reenviarAction}>
        <input type="hidden" name="email" value={email} />
        {estadoReenvio?.erro && (
          <p className="text-destructive mb-2 text-sm" role="alert">
            {estadoReenvio.erro}
          </p>
        )}
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="w-full"
          disabled={cooldown > 0 || reenviando}
        >
          {cooldown > 0 ? `Reenviar código em ${cooldown}s` : "Reenviar código"}
        </Button>
      </form>
    </div>
  );
}
