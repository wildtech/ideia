import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** O rótulo fica sempre visível: o placeholder não substitui o rótulo. */
  rotulo: string;
  /** Algo ao lado do campo, normalmente o botão que envia (por exemplo, "Adicionar"). */
  acao?: ReactNode;
}

/** Campo de texto com rótulo ligado a ele (o `id` é gerado) e, se quiser, uma ação ao lado. */
export function Campo({ rotulo, acao, className = "", ...resto }: Props) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="ds-rotulo">
        {rotulo}
      </label>
      <div className="ds-campo-linha">
        <input id={id} className={`ds-campo ${className}`.trim()} {...resto} />
        {acao}
      </div>
    </>
  );
}
