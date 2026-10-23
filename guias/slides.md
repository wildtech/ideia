# Guia: escrever slides (Presentation Zen e método Lessig)

Um guia de como transformar uma ideia, um documento ou uma apresentação existente em slides bons, em Markdown. Complementa a seção "Apresentações" do `AGENTS.md` e segue as regras dele (Markdown como fonte da verdade, **(?)**, "A definir", não inventar informação).

## Duas referências, em uma linha cada

- **Presentation Zen (Garr Reynolds).** Uma abordagem apoiada em **comedimento** na preparação, **simplicidade** no design e **naturalidade** na apresentação. Poucas palavras, **um ponto de ênfase por slide**, o detalhe fora do slide (no material de apoio) e imagens, texto e espaço vazio usados com intenção.
- **Método Lessig.** O nome vem de quem viu as apresentações do professor Lawrence Lessig. Cada slide traz **uma palavra, uma frase, uma citação ou uma imagem**, em geral em texto claro sobre fundo escuro, e os slides mudam **no ritmo da fala**, o que leva a muitos slides.

As duas descrições vêm de fontes secundárias (resenhas e artigos sobre os autores). Leia-as como apoio, e não como citação. Não há, nelas, uma recomendação específica sobre imagens que ocupam o slide inteiro: esse desenho é uma escolha do repositório.

## Como o repositório aplica

| Ideia | No Markdown de slides |
| :--- | :--- |
| Um ponto por slide | Um `###` para cada ideia ou pergunta; listas longas viram vários slides |
| Frase curta, no ritmo da fala | `**Layout:** frase` (ou `frase-escura`): o título é a frase, grande e centralizada; até 14 palavras |
| Alternar o fundo | Intercale `frase` (claro) e `frase-escura` (escuro) para dar ritmo |
| Seções que respiram | `**Layout:** secao`: o número e o título da parte, em fundo escuro |
| Imagem com função | `imagem-cheia`, `imagem-direita` ou `imagem-esquerda`, com `**Imagem:**` |
| Mostrar que a coisa existe | `**Layout:** evidencia`: print ou diagrama inteiro, com uma legenda de uma linha |
| Detalhe fora do slide | Vai para o documento completo, e o slide só aponta |
| A fala não está no slide | Notas do apresentador (`> Notas: ...`), uma por slide |

## Do documento à apresentação

1. **Comece pelo resumo (TL;DR)** do documento. A apresentação é escrita a partir dele, e não copiada do documento inteiro.
2. **Escolha a pergunta de cada slide.** O que a plateia deve levar deste slide? Se há duas coisas, são dois slides.
3. **Reduza ao essencial.** Deixe no slide só a frase que sustenta a fala. O resto vai para as notas ou para o documento.
4. **Dê a cada imagem uma função** (abaixo) ou não a use.
5. **Escreva as notas.** Aponte a seção do documento que serve de fonte e o que o apresentador diz. A fala é do apresentador: **não a invente**.
6. **Gere e leia os avisos** do compilador (frase longa, imagem pesada ou ausente).

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
- **Print com interface minúscula** não se lê de longe: recorte o trecho que importa ou use uma legenda que diga o que olhar.
- **Resolução:** uma imagem que ocupa o slide inteiro precisa de pelo menos 1280 px de largura. Abaixo de uns 800 px, ela fica borrada.
- **Peso:** otimize antes (por exemplo, 1600 px de largura, em JPEG). O compilador avisa quando uma imagem passa de 700 KB.
- **Crédito:** `**Crédito:**` mostra uma linha pequena no canto. Registre a **autoria, o link e a licença** de cada foto de terceiros nas notas ou no documento. "Flickr" sozinho não é um crédito.
- **Repetição:** a mesma imagem em vários slides só deve repetir quando a ideia repete.
- **Imagens ficam em `imagens/`**, no projeto, com o número do slide ou uma descrição no nome.

### Aproveitar uma apresentação existente (`.pptx`)

O `.pptx` é um arquivo zip. Dele dá para tirar quase tudo:

1. **Texto e notas de cada slide:** `ppt/slides/slideN.xml` e `ppt/notesSlides/`. A ordem real dos slides está em `ppt/presentation.xml`.
2. **Imagens:** `ppt/media/`. Para saber qual imagem é de qual slide, leia `ppt/slides/_rels/slideN.xml.rels`.
3. **Cores e fontes:** `ppt/theme/theme1.xml` e o que os slides usam de fato.
4. **Olhe o PDF** da mesma apresentação, em miniaturas, para ver o resultado final.
5. **Confira cada imagem de perto** antes de nomear ou legendar. Nomes dados por aproximação enganam.
6. **Otimize** (largura máxima, JPEG) e nomeie com o slide de origem.

Mantenha o texto do autor como ele escreveu, apenas dividido. Onde você interpretar (uma legenda, uma troca de ordem), marque com **(?)** e registre a origem nas notas.

## Checklist

- [ ] Cada slide tem uma só ideia?
- [ ] As frases têm até 14 palavras?
- [ ] Cada imagem tem uma função (e a resolução para isso)?
- [ ] Os prints de interface estão legíveis, ou legendados, ou recortados?
- [ ] Os créditos e as licenças das fotos de terceiros estão registrados?
- [ ] O que é detalhe foi para o documento?
- [ ] Há uma nota por slide, com a origem?
- [ ] Alternei o fundo claro e o escuro para dar ritmo?

## Fontes

- [Presentation Zen: simples ideias sobre design e entrega de apresentações](https://jalt-publications.org/node/567) (resenha do livro de Garr Reynolds).
- [Lições de Garr Reynolds](https://www.antoinebuteau.com/lessons-from-garr-reynolds/).
- [Presenting the Lessig Way](https://ethos3.com/designstyles-and-approachespresenting-lessig-way/).
- [Takahashi method](https://en.wikipedia.org/wiki/Takahashi_method): uma frase por slide, comparado ao estilo Lessig.
