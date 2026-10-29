# Guia: design system do protótipo

Todo protótipo nasce com um **design system pequeno**: as cores, a fonte e as medidas vêm do **tema** do projeto, e as telas são montadas com poucos componentes. Este guia complementa a seção "Protótipos" do `AGENTS.md` e usa como exemplo o `projetos/exemplo-todo/prototipo/`. Ele é uma **sugestão padrão** do template: a pessoa pode dispensá-lo, e o `AGENTS-extra.md` pode trocar por outro.

## Por que ter um

- **Coerência.** Documento, slides, carrossel e protótipo têm a mesma cara, porque leem as mesmas cores do mesmo tema.
- **Trocar de marca sem reescrever.** Para outra identidade, troca-se o tema e gera-se de novo. Os componentes não mudam.
- **Acessibilidade desde o começo.** O contraste é conferido na geração, e o foco e o alvo de toque já vêm resolvidos nos componentes.
- **Migração mais barata.** O protótipo mostra à plataforma de destino quais componentes e quais estados existem.

## O modelo: de onde vem cada valor

Para entender o design system, vale olhar por dois modelos conhecidos. O primeiro diz **de onde vem cada valor** e o que muda quando o tema muda. O segundo diz **como as peças se montam**, das menores até as telas.

### Camadas de tokens: primitivo, semântico e componente

| Camada | O que é | Onde fica | No `exemplo-todo` |
| :--- | :--- | :--- | :--- |
| **Primitivo** | O valor em si, sem dizer para que serve | `temas/<tema>/tema.json` | A cor `1F8A70` em `colors.primary`, o raio `8` em `tokens.raio` |
| **Semântico** | Para que o valor serve, com um nome de uso | `src/tokens.css`, **gerado** do tema por `npm run tokens` | `--primaria`, `--primaria-acao` (a primária escurecida até ter 4,5:1 com o branco), `--raio-g` (o raio × 1,4), `--espaco-3` |
| **Componente** | Onde o valor é usado | `src/ui/` (e `ui.css`) | O botão usa `--primaria-acao`, `--raio` e `--duracao-rapida`; o cartão usa `--cartao` e `--raio-g` |

A cadeia vai sempre nesta ordem: **tema → token → componente → tela**. Quem quer mudar a cara do protótipo muda o tema, nunca o componente. Quem quer mudar o comportamento de um componente (o estado desligado, o foco) muda o componente, sem escrever valor à mão.

- **O tema é a única fonte.** O mesmo `tools/tokens.js` lê o tema para o protótipo, para os cards e o reel (`tools/md2cards.js`) e para o vídeo (`tools/md2video.js`). Por isso eles mudam juntos.
- **Cada token diz de onde vem.** No `tokens.css`, um comentário em cada linha mostra a chave do tema (`tema: colors.primary`), o padrão usado quando o tema não declara nada (`padrão: tokens.espaco × 1,5`) ou a regra que o calcula (`--primaria (colors.primary), escurecida até 4,5:1 com o branco`).
- **Não há tokens de componente.** Em sistemas grandes, cada componente tem os seus (`--botao-raio`). Num protótipo, isso é mais coisa para manter, então o componente usa os semânticos direto. Se um dia um componente precisar fugir da regra, crie o token dele em `ui.css`, a partir de um semântico.

### Atomic Design: átomos, moléculas, organismos e telas

O modelo de Brad Frost ([Atomic Design](https://atomicdesign.bradfrost.com/)) separa as peças pelo tamanho. Combina com a regra do template: crie uma peça maior só quando uma tela precisar dela.

| Nível | O que é | No `exemplo-todo` |
| :--- | :--- | :--- |
| **Átomos** | O menor pedaço com sentido | Os tokens: cor, fonte, raio, espaço, tipo, movimento |
| **Moléculas** | Um componente simples, com uma função | `Botao`, `Campo`, `Alerta`, `EstadoVazio` |
| **Organismos** | Um bloco da tela, feito de moléculas | `Cartao` com uma lista de tarefas, a coluna do quadro (`src/components/Coluna.tsx`), o formulário de nova tarefa |
| **Telas** | A página, com dados de exemplo | O quadro com as colunas "A fazer" e "Feito" (`src/App.tsx`) |

Os **layouts dos cards** (`tools/cards/layouts/`) estão no mesmo nível dos organismos: são blocos feitos só com os átomos, e por isso funcionam em qualquer tema.

### Ver as camadas no catálogo

O catálogo (`/ds`) abre com a seção **Camadas**: as quatro etapas da cadeia e uma tabela com cada token, o valor, **de onde vem no tema** (marcado como *tema*, *padrão* ou *derivado*) e **quem o usa** (os componentes e as telas). Logo abaixo, **Por componente** faz o caminho inverso: cada componente com os tokens que usa. Quem usa o quê é lido do CSS carregado na página, então a tabela não fica desatualizada. Um token **não usado no protótipo** não é um erro: ele pode servir aos cards, ao reel ou ao vídeo, ou ficar à espera de uma tela que precise dele.

O CSS de layout da página (`src/styles.css`) fica separado dos componentes: só grade e margens, sem cor nem medida escrita à mão.

## Os tokens

| Grupo | Variáveis | No `tema.json` |
| :--- | :--- | :--- |
| **Cor** | `--fundo`, `--texto`, `--titulo`, `--suave`, `--cartao`, `--borda`, `--primaria`, `--acento`, `--primaria-acao`, `--acento-acao`, `--fundo-escuro`, `--destaque` | `"colors"` (e `"prototipo"` para `fundo` e `suave`) |
| **Fonte** | `--fonte` | `"font"` |
| **Forma** | `--raio-p`, `--raio`, `--raio-g` e `--sombra` | `"tokens": { "raio": 6, "sombra": "..." }` |
| **Espaço** | `--espaco-1` a `--espaco-6` (meio, 1, 1,5, 2, 3 e 4 vezes a base) | `"tokens": { "espaco": 8 }` |
| **Tipo** | `--tipo-p`, `--tipo-m`, `--tipo-g`, `--tipo-gg` e `--tipo-ggg` (uma escala a partir de 1rem) | `"tokens": { "escalaTipo": 1.25 }` |
| **Toque** | `--alvo-toque` | `"tokens": { "alvoToque": 44 }` |
| **Movimento** | `--duracao-rapida`, `--duracao`, `--duracao-lenta` e `--curva` | `"tokens": { "movimento": { "rapido": 150, "normal": 300, "lento": 600, "curva": "cubic-bezier(.2,.7,.2,1)" } }` |

Tudo em `"tokens"` é opcional: o que o tema não declara usa o padrão de `tools/tokens.js`. O movimento é o mesmo nos componentes (transições de botão, entrada dos itens), nos **reels** e nas **cenas do vídeo**, e os componentes respeitam `prefers-reduced-motion`. Os layouts dos cards (`tools/cards/layouts/`) usam as mesmas variáveis, então um layout novo funciona em qualquer tema (veja `guias/cards.md`).

## Como usar

1. **O tema é o ponto de partida.** Se o projeto ainda não tem um tema, crie um tema simples (ver "Temas" no `AGENTS.md`), com as cores da marca. Para os slides e o carrossel, declare também `fundoEscuro` e `destaque` (o fundo escuro e a cor dos links sobre ele): sem isso, saem preto e branco.
2. **Gere os tokens:** `npm run tokens`. O arquivo é versionado, para o protótipo rodar sem precisar das ferramentas do repositório. `npm run tokens:conferir` (que o `npm run build` já roda) falha se ele ficar desatualizado em relação ao tema.
3. **Monte as telas com `src/ui/`.** Nada de `<button>` solto nem de cor escrita à mão nas telas.
4. **Crie um componente só quando uma tela precisar dele**, e escreva-o só com tokens. É um protótipo: o suficiente para ser coerente, e não uma biblioteca para manter.
5. **Olhe o catálogo:** com o `npm run dev`, abra `/ds`. Ele mostra as camadas (de onde vem cada token e quem o usa), as cores, o espaçamento, a escala de tipo, a forma, o movimento, o contraste de cada par de cores e os componentes nos seus estados. Só existe no desenvolvimento (o `build` não o inclui).

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
- [ ] Nenhuma cor, fonte, raio, espaço ou duração escritos à mão fora de `tokens.css`?
- [ ] Os pares de cores do catálogo (`/ds`) passam no contraste?
- [ ] Na seção Camadas do `/ds`, cada valor que a marca pede vem do tema (*tema*), e não do padrão?
- [ ] O foco aparece ao navegar com a tecla Tab?
- [ ] Os botões têm 44 px de altura no celular?
