import { useState, type FormEvent } from "react";

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
      <label htmlFor="titulo">O que precisa ser feito?</label>
      <div className="linha">
        <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Escreva uma tarefa" autoComplete="off" />
        <button type="submit" className="primario">
          Adicionar
        </button>
      </div>
      {erro && (
        <p role="alert" className="erro">
          {erro}
        </p>
      )}
    </form>
  );
}
