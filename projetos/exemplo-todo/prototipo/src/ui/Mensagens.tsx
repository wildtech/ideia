import type { ReactNode } from "react";

/** Quando não há nada para mostrar: diga o que aconteceu e, se der, o próximo passo. */
export function EstadoVazio({ children }: { children: ReactNode }) {
  return <p className="ds-vazio">{children}</p>;
}

/** Erro que a pessoa precisa ver (por exemplo, uma regra que não deixou salvar). É anunciado por leitores de tela. */
export function Alerta({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="ds-alerta">
      {children}
    </p>
  );
}
