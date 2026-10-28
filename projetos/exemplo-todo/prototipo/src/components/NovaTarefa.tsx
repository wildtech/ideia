import { useState, type FormEvent } from "react";
import { Alerta, Botao, Campo } from "../ui";

interface Props {
  onCriar: (titulo: string) => Promise<string | null>;
}

/** Campo e botão para anotar uma tarefa nova. `onCriar` devolve a mensagem de erro, ou `null` se deu certo. */
export function NovaTarefa({ onCriar }: Props) {
  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const msg = await onCriar(titulo);
    setErro(msg);
    if (!msg) setTitulo("");
  }

  return (
    <form className="nova" onSubmit={enviar}>
      <Campo
        rotulo="O que precisa ser feito?"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Escreva uma tarefa"
        autoComplete="off"
        acao={
          <Botao variante="primario" type="submit">
            Adicionar
          </Botao>
        }
      />
      {erro && <Alerta>{erro}</Alerta>}
    </form>
  );
}
