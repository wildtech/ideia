# Guia: slides (estilos, imagens e setup)

Um guia de como transformar uma ideia, um documento ou uma apresentação existente em slides bons, em Markdown. Complementa a seção "Apresentações" do `AGENTS.md` e segue as regras dele (Markdown como fonte da verdade, **(?)**, "A definir", não inventar informação). O estilo Presentation Zen e método Lessig tem um guia próprio: `guias/slides-zen-lessig.md`.

## Dois estilos

O **estilo** das apresentações vem do **tema**: o `tema.json` declara `"estilo": "padrao"` (o padrão, se faltar) ou `"estilo": "zen-lessig"`. O estilo muda o que um slide sem `**Layout:**` vira e os avisos do compilador.

| | `padrao` | `zen-lessig` |
| :--- | :--- | :--- |
| Ideia | Slides de título e conteúdo, com listas e tabelas | Um slide, uma ideia: frases curtas e imagens com função |
| Slide sem `**Layout:**` | Conteúdo (título, texto e listas) | Frase (o título é a frase, grande e centralizada) |
| Slide com `**Imagem:**` e sem layout | A imagem não aparece (o compilador avisa) | Imagem ao lado do texto |
| Capa | Clara | Escura |
| Quantidade de slides | Poucos, com mais texto cada um | Muitos, com poucas palavras cada um |
| Quando usar | Reunião de decisão, relatório, apresentação que também é lida | Palestra, aula, pitch de uma ideia, apresentação falada |
| Guia | Este | `guias/slides-zen-lessig.md` |

Os layouts de frase e de imagem funcionam nos dois estilos, quando pedidos com `**Layout:**`. O estilo só define o que acontece **quando você não pede nada**.

### Como escolher

- A plateia vai **ler** o que está no slide, ou **ouvir** quem fala? Ler: padrão. Ouvir: zen-lessig.
- O slide precisa **servir de documento** depois? Padrão (ou, melhor, escreva um documento e faça uma apresentação à parte).
- Você fala **sem olhar para o slide**? Zen-lessig dá o ritmo, e as notas do apresentador guardam o que o slide não diz.

## Do documento à apresentação

1. **Comece pelo resumo (TL;DR)** do documento. A apresentação é escrita a partir dele, e não copiada do documento inteiro.
2. **Escolha o ponto de cada slide.** O que a plateia deve levar deste slide? Se há duas coisas, são dois slides.
3. **Reduza ao essencial.** Deixe no slide o que sustenta a fala. O resto vai para as notas ou para o documento.
4. **Dê a cada imagem uma função** (abaixo) ou não a use.
5. **Escreva as notas.** Aponte a seção do documento que serve de fonte e o que o apresentador diz. A fala é do apresentador: **não a invente**.
6. **Gere e leia os avisos** do compilador (frase longa, imagem pesada, ausente ou sem layout que a mostre).

## As imagens

### Para que serve cada imagem

| Função | O que faz | Como tratar |
| :--- | :--- | :--- |
| **Metáfora e emoção** (foto) | Dá o clima da ideia sem explicá-la | `imagem-cheia` com a frase em um degradê, ou `imagem-direita` com o texto ao lado |
| **Evidência** (print) | Mostra que a coisa existe e funciona | `evidencia`, inteira, com legenda; **recorte** quando a interface é pequena |
| **Modelo e referência** (livro, canvas, diagrama) | Apresenta uma ideia de terceiros | `evidencia`, com legenda e crédito |
| **Identidade** (foto de quem fala, QR) | Quem fala e como achar | Um só slide, e o contato no fim |

Antes de usar uma imagem, pergunte: **ela reforça a ideia?** Se a resposta é "enfeita", retire.

### Regras práticas

- **Texto sobre foto:** só com o degradê (`imagem-cheia`) ou com a foto de um lado e o texto do outro. Nunca a frase direto sobre uma foto movimentada.
- **Prints do próprio protótipo:** gere-os por uma jornada do Playwright (`npm run capturas`, no protótipo) em vez de à mão. Assim eles saem iguais sempre, e podem ser refeitos quando a tela mudar. Tire o ponteiro do mouse da tela antes da foto, para nenhum botão aparecer em "hover".
- **Print com interface minúscula** não se lê de longe: recorte o trecho que importa ou use uma legenda que diga o que olhar.
- **Resolução:** uma imagem que ocupa o slide inteiro precisa de pelo menos 1280 px de largura. Abaixo de uns 800 px, ela fica borrada.
- **Peso:** otimize antes (por exemplo, 1600 px de largura, em JPEG). O compilador avisa quando uma imagem passa de 700 KB.
- **Crédito:** `**Crédito:**` mostra uma linha pequena no canto. Registre a **autoria, o link e a licença** de cada foto de terceiros nas notas ou no documento. "Flickr" sozinho não é um crédito.
- **Crédito com link:** o crédito aceita `[texto](url)`. Ele é branco, sobre uma faixa escura translúcida no canto, e por isso se lê em qualquer fundo.
- **Repetição:** a mesma imagem em vários slides só deve repetir quando a ideia repete.
- **Imagens ficam em `imagens/`**, no projeto, com o número do slide ou uma descrição no nome.

### Citações, slides ocultos e numeração

Valem para os dois estilos.

- **Citação:** `**Layout:** quote` faz do título do slide a citação, grande e em fundo escuro (até 25 palavras). A assinatura vem de `**Autor:** Nome`. Use para a fala de alguém, não para uma frase sua (para essa, use `frase`).
- **Slide oculto:** `**Oculto:** sim` mantém o slide no Markdown, mas ele não entra na apresentação nem no PDF. É o jeito de guardar uma ideia sem apagá-la; para trazê-lo de volta, apague a linha. O compilador avisa quais slides estão ocultos.
- **Numeração:** `"numerarSlides": true` no tema, ou em `ajustes` do `projeto.json`, mostra o número no canto inferior esquerdo, na tela e no PDF. Serve para apontar ajustes ("no slide 23..."). Os ocultos não entram na conta, então os números mudam quando você oculta ou mostra um slide; peça os ajustes sempre olhando a versão gerada mais recente.

### Aproveitar uma apresentação existente (`.pptx`)

O `.pptx` é um arquivo zip. Dele dá para tirar quase tudo:

1. **Texto e notas de cada slide:** `ppt/slides/slideN.xml` e `ppt/notesSlides/`. A ordem real dos slides está em `ppt/presentation.xml`.
2. **Imagens:** `ppt/media/`. Para saber qual imagem é de qual slide, leia `ppt/slides/_rels/slideN.xml.rels`.
3. **Cores e fontes:** `ppt/theme/theme1.xml` e o que os slides usam de fato.
4. **Olhe o PDF** da mesma apresentação, em miniaturas, para ver o resultado final.
5. **Confira cada imagem de perto** antes de nomear ou legendar. Nomes dados por aproximação enganam.
6. **Otimize** (largura máxima, JPEG) e nomeie com o slide de origem.

Mantenha o texto do autor como ele escreveu, apenas dividido. Onde você interpretar (uma legenda, uma troca de ordem), marque com **(?)** e registre a origem nas notas.

## Cores, fonte e opiniões para o setup

Estas são **sugestões deste repositório**, para usar quando a pessoa não souber ou não tiver definido. O assistente deve **propor**, mostrar o resultado e deixar a pessoa confirmar ou trocar. Se ela já tem a marca, as cores dela vêm primeiro; confira o contraste.

### Regras que valem para os dois estilos

- **Contraste:** o texto precisa de pelo menos **4,5:1** com o fundo (**3:1** para letras grandes). Confira antes de aceitar uma cor.
- **Uma cor de destaque só.** Duas já disputam a atenção.
- **Fonte sem serifa**, legível de longe. Use a da marca, se houver; senão, Helvetica ou Arial funcionam em qualquer máquina. Uma fonte que o computador não tem cai para outra, e o visual muda.
- **Formato 16:9.** É o do compilador.
- **Logo pequeno, no canto** (ou só na capa e no encerramento). Ele nunca deve competir com a ideia do slide.
- Tema simples: o `tema.json` herda do `neutro`, e as cores que você não declarar vêm de lá.

### Paleta sugerida para o estilo `padrao`

Fundo branco, com uma cor de marca. É o que o tema `neutro` já traz.

| Papel | Sugestão | Contraste com o fundo branco |
| :--- | :--- | :--- |
| Texto (`text`) | `222222` | 15,9:1 |
| Título (`titleBlue`) | `1F2937` | 14,7:1 |
| Principal (`primary`): cabeçalho de tabela e marcadores | `2B5C8A` | 7,0:1 (com texto branco) |
| Apoio (`accent`) | `6B7280` | 4,8:1 |

Troque o `primary` pela cor da marca, se tiver contraste de pelo menos 4,5:1 com o branco (o texto do cabeçalho da tabela é branco).

### Paleta sugerida para o estilo `zen-lessig`

Preto e branco, e uma cor de destaque usada com parcimônia. Veja os detalhes em `guias/slides-zen-lessig.md`.

| Papel | Sugestão | Observação |
| :--- | :--- | :--- |
| Fundo escuro (`fundoEscuro`) | `000000` | Branco sobre preto tem 21:1 |
| Fundo claro | `FFFFFF` | Texto `212121` ou `000000` |
| Destaque sobre o escuro (`destaque`): a cor dos links | `FFFFFF` com sublinhado (padrão), ou uma cor viva da marca, como o laranja `FFAB40` | Branco: 21:1 sobre o preto. O laranja: 11,2:1 sobre o preto, mas **só 1,9:1 sobre o branco**, então não serve nos slides claros |
| Destaque sobre o claro (`accent`) | `B26A00` | 4,2:1 sobre o branco: serve para letra grande, e não para texto pequeno |
| Links nos slides claros | A cor `primary` do tema, com sublinhado | Escolha um `primary` com pelo menos 4,5:1 sobre o branco |

Se a marca tem uma cor viva, ela costuma servir de destaque nos slides escuros: troque o `destaque` por ela. Para os claros, escureça o tom até ter o contraste. **Os links são sempre sublinhados**, para não dependerem só da cor.

## Checklist

- [ ] O estilo (`padrao` ou `zen-lessig`) combina com a forma como a apresentação será usada?
- [ ] Cada slide tem um ponto claro?
- [ ] Cada imagem tem uma função (e a resolução para isso)?
- [ ] Os prints de interface estão legíveis, ou legendados, ou recortados?
- [ ] Os créditos e as licenças das fotos de terceiros estão registrados?
- [ ] O que é detalhe foi para o documento?
- [ ] Há uma nota por slide, com a origem?
- [ ] O texto tem contraste de 4,5:1 ou mais com o fundo?
