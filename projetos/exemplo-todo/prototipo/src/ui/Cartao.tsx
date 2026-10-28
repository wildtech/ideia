import type { ReactNode } from "react";

interface Props {
  /** O elemento HTML: um item de lista, uma seção da página ou um bloco. */
  como?: "li" | "section" | "div";
  /** `bloco` é o cartão cinza que agrupa itens, com uma faixa no topo; `item` é o cartão branco de um item da lista. */
  tipo?: "bloco" | "item";
  /** A faixa do `bloco`: a cor da marca, ou neutra. */
  faixa?: "primaria" | "neutra";
  children: ReactNode;
  className?: string;
  "aria-labelledby"?: string;
}

/** Cartão do design system. */
export function Cartao({ como: Tag = "div", tipo = "item", faixa = "primaria", className = "", children, ...resto }: Props) {
  const classes = ["ds-cartao", `ds-cartao--${tipo}`, tipo === "bloco" ? `ds-cartao--faixa-${faixa}` : "", className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} {...resto}>
      {children}
    </Tag>
  );
}
