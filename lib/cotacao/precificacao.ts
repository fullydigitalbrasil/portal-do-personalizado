import { Prisma } from "@prisma/client";

type Faixa = {
  quantidadeMinima: number;
  quantidadeMaxima: number | null;
  precoUnitario: Prisma.Decimal;
};

/**
 * Encontra a faixa de preço aplicável a uma quantidade (Modelo de Dados
 * v1.5, seção 2.7): a faixa vale a partir de `quantidadeMinima` até a
 * `quantidadeMinima` da próxima faixa cadastrada (ou até `quantidadeMaxima`,
 * se preenchida). Usa a faixa de maior `quantidadeMinima` que ainda seja
 * `<= quantidade`. Retorna `null` se a quantidade for menor que a menor
 * faixa cadastrada (sem preço automático possível para esse caso).
 */
export function encontrarFaixaAplicavel<T extends Faixa>(
  faixas: T[],
  quantidade: number
): T | null {
  const elegiveis = faixas
    .filter((f) => f.quantidadeMinima <= quantidade)
    .filter((f) => f.quantidadeMaxima === null || quantidade <= f.quantidadeMaxima)
    .sort((a, b) => b.quantidadeMinima - a.quantidadeMinima);

  return elegiveis[0] ?? null;
}

/**
 * PRD v2.1, seção 6.1: produtos sob especificação (ou sem faixa de preço
 * aplicável) vão para precificação manual, com retorno ao cliente em até
 * 5 dias úteis. Conta dias úteis simples (segunda a sexta) a partir de
 * agora — sem calendário de feriados por enquanto.
 */
export function calcularPrazoRetornoManual(dataBase: Date = new Date()): Date {
  const prazo = new Date(dataBase);
  let diasUteisRestantes = 5;

  while (diasUteisRestantes > 0) {
    prazo.setDate(prazo.getDate() + 1);
    const diaDaSemana = prazo.getDay(); // 0 = domingo, 6 = sábado
    if (diaDaSemana !== 0 && diaDaSemana !== 6) {
      diasUteisRestantes -= 1;
    }
  }

  return prazo;
}
