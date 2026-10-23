# Guia: slides no estilo Presentation Zen e método Lessig

O estilo `zen-lessig` para apresentações **faladas**. Parte do guia geral (`guias/slides.md`, que traz também as regras de imagens, as cores sugeridas e o setup) e segue as regras do `AGENTS.md`. Para usá-lo, o tema declara `"estilo": "zen-lessig"`.

## Duas referências, em uma linha cada

- **Presentation Zen (Garr Reynolds).** Uma abordagem apoiada em **comedimento** na preparação, **simplicidade** no design e **naturalidade** na apresentação. Poucas palavras, **um ponto de ênfase por slide**, o detalhe fora do slide (no material de apoio) e imagens, texto e espaço vazio usados com intenção.
- **Método Lessig.** O nome vem de quem viu as apresentações do professor Lawrence Lessig. Cada slide traz **uma palavra, uma frase, uma citação ou uma imagem**, em geral em texto claro sobre fundo escuro, e os slides mudam **no ritmo da fala**, o que leva a muitos slides.

As duas descrições vêm de fontes secundárias (resenhas e artigos sobre os autores). Leia-as como apoio, e não como citação. Não há, nelas, uma recomendação específica sobre imagens que ocupam o slide inteiro: esse desenho é uma escolha do repositório.

## O que o estilo muda

Com `"estilo": "zen-lessig"` no tema:

- o slide sem `**Layout:**` é de **frase**: o título é a frase, grande e centralizada;
- o slide com `**Imagem:**` e sem layout usa **imagem-direita**;
- a **capa é escura**;
- os avisos do compilador esperam **frases curtas** (até 14 palavras).

## Como o repositório aplica

| Ideia | No Markdown de slides |
| :--- | :--- |
| Um ponto por slide | Um `###` para cada ideia ou pergunta; listas longas viram vários slides |
| Frase curta, no ritmo da fala | `**Layout:** frase` (ou `frase-escura`), até 14 palavras |
| Alternar o fundo | Intercale `frase` (claro) e `frase-escura` (escuro) para dar ritmo |
| Seções que respiram | `**Layout:** secao`: o número e o título da parte, em fundo escuro |
| Imagem com função | `imagem-cheia`, `imagem-direita` ou `imagem-esquerda`, com `**Imagem:**` |
| Mostrar que a coisa existe | `**Layout:** evidencia`: print ou diagrama inteiro, com uma legenda de uma linha |
| Detalhe fora do slide | Vai para o documento completo, e o slide só aponta |
| A fala não está no slide | Notas do apresentador (`> Notas: ...`), uma por slide |

## Opiniões para escrever bem neste estilo

- **Quebre as listas.** Uma lista de quatro itens vira quatro slides, um por item, e cada um respira.
- **Divida as frases longas** no meio, sem mudar as palavras: "A automação vem para potencializar o trabalho" e "ou terminar com o trabalho de pessoas?" funcionam como duas batidas.
- **Alterne o fundo** a cada um ou dois slides. O contraste de claro e escuro marca o ritmo.
- **Pause com uma seção** (`secao`) a cada bloco de ideias: um número e uma pergunta.
- **Pergunta no slide, resposta na fala.** Se a pergunta basta, a resposta fica nas notas.
- **Imagem só onde reforça.** Uma foto que não dialoga com a frase atrapalha mais do que ajuda.
- **Menos de 14 palavras.** Se a frase não cabe, o ponto ainda não está claro.
- **O anexo vai para o documento.** Tabelas e fluxos densos não pertencem a este estilo.
- **Ritmo:** esse estilo gera muitos slides, o que não é problema (cada um dura pouco). Se for demais, agrupe duas frases em um.

## Cores e fonte

Veja a paleta sugerida em `guias/slides.md`: preto e branco, e uma cor de destaque usada com parcimônia, de preferência sobre o fundo escuro. Fonte sem serifa, de peso leve para o apoio e negrito para as frases.

## Checklist

- [ ] Cada slide tem uma só ideia, em até 14 palavras?
- [ ] Alternei o fundo claro e o escuro?
- [ ] Cada imagem reforça a frase, e há degradê ou espaço para o texto ser lido?
- [ ] Os prints de interface estão legíveis, legendados ou recortados?
- [ ] As frases longas foram divididas em vez de encolhidas?
- [ ] Há uma nota por slide, com a origem?
- [ ] O detalhe foi para o documento?

## Fontes

- [Presentation Zen: simples ideias sobre design e entrega de apresentações](https://jalt-publications.org/node/567) (resenha do livro de Garr Reynolds).
- [Lições de Garr Reynolds](https://www.antoinebuteau.com/lessons-from-garr-reynolds/).
- [Presenting the Lessig Way](https://ethos3.com/designstyles-and-approachespresenting-lessig-way/).
- [Takahashi method](https://en.wikipedia.org/wiki/Takahashi_method): uma frase por slide, comparado ao estilo Lessig.
