# Guia: design system do protótipo

Todo protótipo nasce com um **design system pequeno**: as cores e a fonte vêm do **tema** do projeto, e as telas são montadas com poucos componentes. Este guia complementa a seção "Protótipos" do `AGENTS.md` e usa como exemplo o `projetos/exemplo-todo/prototipo/`. Ele é uma **sugestão padrão** do template: a pessoa pode dispensá-lo, e o `AGENTS-extra.md` pode trocar por outro.

## Por que ter um

- **Coerência.** Documento, slides, carrossel e protótipo têm a mesma cara, porque leem as mesmas cores do mesmo tema.
- **Trocar de marca sem reescrever.** Para outra identidade, troca-se o tema e gera-se de novo. Os componentes não mudam.
- **Acessibilidade desde o começo.** O contraste é conferido na geração, e o foco e o alvo de toque já vêm resolvidos nos componentes.
- **Migração mais barata.** O protótipo mostra à plataforma de destino quais componentes e quais estados existem.

## As três camadas

| Camada | Onde | O que faz |
| :--- | :--- | :--- |
| **Identidade** | `temas/<tema>/tema.json` | Cores, fonte e logo. É a **única fonte**: vale para documento, slides, carrossel e protótipo |
| **Tokens** | `src/tokens.css` | As variáveis CSS (`--primaria`, `--texto`, `--fundo-escuro`...), **geradas do tema** por `npm run tokens`. Não se edita à mão |
| **Componentes** | `src/ui/` | `Botao`, `Campo`, `Cartao`, `EstadoVazio` e `Alerta`, escritos só com os tokens |

O CSS de layout da página (`src/styles.css`) fica separado: só grade e margens, sem cor escrita à mão.

## Como usar

1. **O tema é o ponto de partida.** Se o projeto ainda não tem um tema, crie um tema simples (ver "Temas" no `AGENTS.md`), com as cores da marca. Para os slides e o carrossel, declare também `fundoEscuro` e `destaque` (o fundo escuro e a cor dos links sobre ele): sem isso, saem preto e branco.
2. **Gere os tokens:** `npm run tokens`. O arquivo é versionado, para o protótipo rodar sem precisar das ferramentas do repositório. `npm run tokens:conferir` (que o `npm run build` já roda) falha se ele ficar desatualizado em relação ao tema.
3. **Monte as telas com `src/ui/`.** Nada de `<button>` solto nem de cor escrita à mão nas telas.
4. **Crie um componente só quando uma tela precisar dele**, e escreva-o só com tokens. É um protótipo: o suficiente para ser coerente, e não uma biblioteca para manter.
5. **Olhe o catálogo:** com o `npm run dev`, abra `/ds`. Ele mostra os tokens, o contraste de cada par de cores e os componentes nos seus estados. Só existe no desenvolvimento (o `build` não o inclui).

## O contraste

Texto precisa de pelo menos **4,5:1** com o fundo. O gerador de tokens confere os pares e avisa quando algum fica abaixo. Para os botões preenchidos (texto branco sobre a cor), ele **escurece a cor do tema só até ter 4,5:1**: a marca nos documentos e nos slides continua a mesma, e o botão passa. No `exemplo-todo`, a cor `#1F8A70` (4,26:1) vira `#1E846B` (4,60:1) no botão.

## O que cada componente garante

- **Foco visível** em tudo que se opera (um contorno de 3 px na cor da marca).
- **Alvo de toque** de pelo menos 44 px no celular ou em tela estreita.
- **Rótulo sempre visível** no campo; o placeholder não o substitui.
- **Erro anunciado** a leitores de tela (`role="alert"`).
- **Botão com variante:** `primario` (a ação principal, uma por tela), `padrao`, `perigo` (apaga algo, com confirmação) e `discreto`.

## O que o design system não é

- Não é uma biblioteca para manter: o protótipo existe para ser jogado fora.
- Não substitui o design system da plataforma de destino, que pode ser outro. O que ele entrega é a **intenção** (cores, estados, regras de contraste e de toque), e não o código final.
- Não resolve desenho de interface. Quem decide como a tela se organiza continua sendo o pitch (o esboço de traço grosso).

## Checklist

- [ ] O protótipo tem um tema (e `fundoEscuro` e `destaque`, se vai ter slides ou carrossel)?
- [ ] `npm run tokens:conferir` passa?
- [ ] Nenhuma cor nem fonte escrita à mão fora de `tokens.css`?
- [ ] Os pares de cores do catálogo (`/ds`) passam no contraste?
- [ ] O foco aparece ao navegar com a tecla Tab?
- [ ] Os botões têm 44 px de altura no celular?
