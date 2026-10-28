import type { ButtonHTMLAttributes } from "react";

export type VarianteBotao = "padrao" | "primario" | "perigo" | "discreto";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primario`: a ação principal da tela (uma por tela). `perigo`: apaga algo. `discreto`: ação rara, como um link. */
  variante?: VarianteBotao;
}

/** Botão do design system. O tipo é `button` por padrão, para não enviar um formulário sem querer. */
export function Botao({ variante = "padrao", type = "button", className = "", ...resto }: Props) {
  return <button type={type} className={`ds-botao ds-botao--${variante} ${className}`.trim()} {...resto} />;
}
