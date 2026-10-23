# AGENTS.md

Este repositório é um **template para organizar ideias e iniciativas em documentos e apresentações**. Cada projeto fica em uma pasta própria, e o documento principal é sempre um arquivo Markdown. Os `.md` são "compilados" em documentos (`.docx`, `.html` e `.pdf`) e em apresentações (`.html` com reveal.js e `.pdf`), com a identidade visual (tema) escolhida.

Este arquivo é lido pelo assistente de IA (Claude Code, Kiro, Codex ou outro que leia `AGENTS.md`). Ele diz como conduzir a pessoa, que pode **não ser técnica**: quem usa conversa com você, e é você quem usa o roteiro para entrevistar, cria os arquivos e roda os comandos.

## Conhecimento complementar (`AGENTS-extra.md`)

Este `AGENTS.md` é a **base compartilhada** do template e **não pode ser modificado por agentes**. Nenhum agente deve editá-lo, nem a pedido da pessoa, para registrar algo específico dela, da equipe ou da organização. Quando você perceber que existe algo complementar (uma URL, um tema, uma convenção, uma preferência de fluxo, uma regra permanente), **o correto é ajustar o `AGENTS-extra.md`**, na raiz do repositório. Assim, é possível trazer as melhorias do template (substituindo este arquivo) sem perder nada que seja da pessoa.

- **Se a pessoa pedir para mudar este arquivo:** explique que ele é a base compartilhada, registre a mudança no `AGENTS-extra.md` (se for específica dela) e, se for uma melhoria que serviria a todos, sugira levá-la à origem do template como contribuição (ver "Contribuições"), feita pela pessoa.
- **Única exceção:** no repositório de **origem** do template (https://github.com/wildtech/ideia), o mantenedor pode pedir que um agente edite os arquivos `[base]`, porque é lá que a base evolui.
- **O que vale para qualquer arquivo marcado como `[base]`** na árvore abaixo: não os modifique para registrar algo de quem usa.

- **Leia o `AGENTS-extra.md` no início de toda sessão**, antes de conduzir o onboarding ou de mexer em qualquer projeto. Se ele não existir, siga só este arquivo.
- **Precedência:** o `AGENTS-extra.md` complementa este arquivo e, quando for mais específico, **prevalece** sobre os padrões daqui (o tema padrão, o fluxo de Git, URLs de integrações, convenções de nomes). Ele **não pode relaxar** as regras de integridade: não inventar informação, marcar dúvidas com **(?)**, confirmar antes de escrever em sistemas externos, nunca apagar em sistemas externos e proteger dados sensíveis.
- **O que vai nele:** contexto da organização ou da pessoa, temas além do genérico, roteiros próprios, integrações (URL do Jira, organização no GitHub), fluxo de Git, convenções (nomes, idioma, tom, glossário), pessoas e papéis recorrentes, lista de projetos, regras de privacidade e referências a outras fontes de conhecimento. **Nunca coloque segredos** (senhas, tokens, chaves).
- **Modelo:** `AGENTS-extra.example.md` documenta a convenção e traz as seções sugeridas. Não o use diretamente: copie para `AGENTS-extra.md`.
- **Criação:** no onboarding do **primeiro projeto**, se o `AGENTS-extra.md` não existir, **ofereça criá-lo** a partir do modelo, perguntando só o que a pessoa souber e deixando "A definir" no resto. Crie apenas se ela aceitar.
- **Manutenção:** quando a pessoa disser algo que é regra permanente (a URL do Jira, o tema que prefere, uma convenção), pergunte se deve registrar no `AGENTS-extra.md`. Mostre o que vai escrever e escreva só depois do OK.

## Estrutura do repositório

O repositório separa o que é **base** (vem com o template e é compartilhado) do que é **conteúdo** (os projetos e o que é específico de quem usa).

```
ideia/
├── AGENTS.md                 [base] este arquivo
├── AGENTS-extra.example.md   [base] modelo do arquivo complementar
├── AGENTS-extra.md           [conteúdo] o complemento de quem usa (criado no primeiro projeto; não vem no template)
├── README.md                 [base] apresentação e primeiros passos para humanos
├── LICENSE                   [base] licença dos documentos, roteiros e temas (CC BY 4.0)
├── roteiros/                 [base] conjuntos de perguntas que guiam a escrita e a entrevista (um .txt por roteiro)
│   ├── iniciativa.txt, businessmodelcanvas.txt, 10-20-30.txt, pdi.txt, pitch.txt
│   └── tldr.txt              resumo (TL;DR): citação no topo do documento e apresentação curta
├── guias/                    [base] textos de apoio sobre como fazer bem uma coisa (ex.: pitch.md)
├── temas/                    [base e conteúdo] identidade visual; uma pasta por tema
│   └── <tema>/               tema.json (cores, fontes, logo, rodapé, opções) e, se houver, base.docx, referencia.pdf e slides.css
│       neutro (base dos temas simples), generico (padrão), wildtech (exemplo de tema com marca),
│       exemplo-leve (exemplo de tema simples: só cores e logo), exemplo-cc (tema simples com o logo da Creative Commons,
│       usado no projeto exemplo-cc); os temas de quem usa ficam aqui também
├── tools/                    [base] compiladores (licença MIT, ver tools/LICENSE)
│   ├── tema.js               carrega o tema e as saídas de um projeto
│   ├── md-parse.js           parser Markdown compartilhado
│   ├── md2docx.js            Markdown → docx
│   ├── md2html.js            Markdown → html (documento)
│   ├── md2slides.js          Markdown → html (apresentação, reveal.js)
│   ├── md2pdf.js             html → pdf (Chrome headless; documentos e slides)
│   ├── build.js              gera as saídas de um projeto, conforme o projeto.json
│   └── package.json          dependências (docx, jszip, pngjs, reveal.js)
└── projetos/                 [conteúdo] um projeto por pasta
    ├── exemplo-ideia/        [base] projeto de exemplo, que descreve o próprio template (tema da Wildtech)
    ├── exemplo-cc/           [base] segundo exemplo, com um tema simples: a escolha da licença Creative Commons dos documentos
    └── <projeto>/
        ├── projeto.json          tema, saídas e artefatos do projeto
        ├── <projeto>.md          documento completo (fonte da verdade), com o roteiro no topo e um resumo (TL;DR)
        ├── <projeto>-slides.md   apresentação do resumo (opcional)
        ├── apoio/                material de entrada: prints, transcrições, anotações (insumo, não conteúdo)
        ├── out/                  saídas geradas (docx, html e pdf), fora do git; não editar à mão
        └── ...                   artefatos persistentes (ex.: prototipo/) e outros arquivos do projeto
```

- **Para replicar esta estrutura** para outra pessoa ou equipe: copie os arquivos `[base]`, deixe `projetos/` só com os exemplos (`exemplo-ideia/` e `exemplo-cc/`), crie os temas e os projetos de quem vai usar e deixe o `AGENTS-extra.md` nascer no primeiro projeto.
- **Dois lados da mesma moeda:** o que é `[base]` deve ser melhorado na origem do template (https://github.com/wildtech/ideia), e o que é `[conteúdo]` pertence a quem usa.

### Os conceitos

| Conceito | Responde a | Onde fica |
| :--- | :--- | :--- |
| **Roteiro** | O que perguntar e escrever? É o conjunto de perguntas que o analista usa para entrevistar | `roteiros/` |
| **Guia** | Como fazer bem? Complementa um roteiro, mas não é um | `guias/` |
| **Tema** | Como parece? Logo, cores, fontes e rodapé; serve a documentos e a apresentações | `temas/<tema>/` |
| **Projeto** | Qual é o assunto? | `projetos/<projeto>/` |
| **Saída** | O que é gerado a partir de um `.md`: tipo (documento ou apresentação) e formatos (docx, html, pdf). Vai para `out/` e é descartável | `projeto.json` e `out/` |
| **Artefato** | Saída **persistente** derivada de um documento (ex.: protótipo, código). Fica versionada no projeto e evolui por conta própria | `projeto.json` e pastas do projeto |

- **Roteiros disponíveis:**

| Roteiro | Para que serve |
| :--- | :--- |
| `iniciativa` | Documentar uma iniciativa, um projeto ou uma decisão (o padrão) |
| `businessmodelcanvas` | Modelar uma ideia de negócio, com as 9 perguntas do Business Model Canvas |
| `10-20-30` | Preparar uma apresentação de uma ideia ou negócio em 10 slides, 20 minutos, fonte 30 |
| `pitch` | Validar um problema e uma solução antes das specs, no formato Shape Up (problema, apetite, solução, armadilhas, fora de escopo); o guia `guias/pitch.md` complementa |
| `pdi` | Montar um plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida |
| `tldr` | Resumir um documento: citação no topo do documento e apresentação curta |

  Para uma ideia de negócio nova, o caminho natural é o Business Model Canvas primeiro e o 10-20-30 depois, para apresentar o que o canvas organizou. A pessoa também pode criar os seus (ver "Criando um novo roteiro").
- **Documento ou apresentação:** o documento é lido sozinho (completo); a apresentação é falada (uma ideia por slide). São arquivos separados, e a apresentação é escrita a partir do resumo, não convertida do documento. O roteiro sugere qual faz mais sentido: iniciativa e PDI são documentos; 10-20-30 e pitch são pensados para slides.
- **Artefatos** não são gerados pelas ferramentas. O `projeto.json` os registra, com a `origem` (o documento de onde nasceram), para manter a rastreabilidade. O documento é a verdade sobre a **intenção** (o que e por quê); o artefato, sobre o **comportamento**. Quando um mudar de forma relevante, revise o outro. Artefatos de software: pasta própria com `README` e instruções para rodar, `package.json` próprio (sem misturar com `tools/`), **dados fictícios**, sem segredos nem dados reais.

## Onboarding (passo a passo para o assistente)

Use este passo a passo quando a pessoa pedir para começar, criar um projeto ou "organizar uma ideia". Regras da conversa:

- Linguagem simples, sem jargão técnico. Explique em uma frase o que vai fazer antes de fazer.
- **Uma pergunta por vez.** Ofereça opções quando houver, com uma recomendação.
- Quem digita os comandos é você. Não peça para a pessoa abrir terminal, a menos que você não consiga rodar comandos.
- Você é o **analista que entrevista**: use as perguntas do roteiro para conduzir a conversa de forma abrangente, em vez de pedir à pessoa que preencha um formulário.
- Nunca invente informação. O que a pessoa não souber fica marcado com **(?)** ou "A definir".

Passos:

1. **Verificar o computador.** Confirme que há Node.js (`node --version`) e um navegador Chrome, Chromium ou Edge. Se faltar, explique como instalar, e na primeira vez rode `cd tools && npm install`.
2. **Conhecimento complementar.** Leia o `AGENTS-extra.md`, se existir. Se for o **primeiro projeto** e ele não existir, ofereça criá-lo a partir do `AGENTS-extra.example.md` (ver "Conhecimento complementar"), perguntando só o que a pessoa souber.
3. **Escolher o roteiro.** Pergunte o que a pessoa quer fazer e recomende: documentar uma iniciativa (iniciativa), modelar uma ideia de negócio (businessmodelcanvas), preparar uma apresentação (10-20-30), validar uma ideia antes das specs (pitch) ou montar um plano de desenvolvimento individual (pdi). Se ela quiser outro modelo, veja "Criando um novo roteiro".
4. **Perguntar como será usado:** **lido** (documento), **apresentado** (slides) ou os dois. Use a sugestão do roteiro como ponto de partida.
5. **Escolher o tema.** Se a pessoa não indicar um (nem o `AGENTS-extra.md`), **use o genérico**. Se ela quiser a identidade visual dela, crie um **tema simples**: pergunte as **cores** (a principal e, se quiser, a de destaque), o **logo** (um arquivo png ou jpg, se tiver), a fonte e o texto do rodapé, e crie `temas/<nome>/` com um `tema.json` que herda do `neutro` (ver "Temas"). O da Wildtech é só um exemplo de tema com marca: não o use para a pessoa.
6. **Perguntar o necessário para o documento:**
   - nome do projeto (vira o nome da pasta e do arquivo; sem espaços e acentos, em minúsculas, com hífen);
   - título da iniciativa;
   - pessoa responsável, com nome e sobrenome (e as outras pessoas envolvidas, se houver);
   - período de acompanhamento e data limite (pode ser "A definir");
   - se o projeto é um **software** e precisa de protótipo ou código (artefato persistente);
   - projeto Jira ou repositório GitHub relacionado, se houver (ver "Integrações opcionais").
7. **Pedir o material de apoio**, se existir: textos, anotações, transcrições, prints e fotos. Peça para a pessoa colocá-lo em `projetos/<projeto>/apoio/` ou colar na conversa.
8. **Ler o material, entrevistar e escrever o primeiro rascunho.** As imagens são **insumo**: leia o conteúdo delas e transforme em texto no `.md`. O documento gerado não leva imagens; a imagem original fica em `apoio/` e é citada em "Documentos de Apoio".
9. **Criar os arquivos:** `projetos/<projeto>/<projeto>.md` (com `**Roteiro:** <nome>` no topo e seguindo o roteiro e as regras abaixo) e `projetos/<projeto>/projeto.json` (siga o modelo de "Projeto e saídas", com `"tema": "generico"` a menos que a pessoa ou o `AGENTS-extra.md` indique outro).
10. **Sugerir o resumo (TL;DR)** e, se fizer sentido, a apresentação (`<projeto>-slides.md`). Quem decide criar é a pessoa.
11. **Gerar as saídas** (ver "Gerando as saídas"), mostrar o que foi criado e perguntar o que ajustar.
12. **Combinar a continuidade.** O documento é vivo: a pessoa volta com novas informações e você atualiza o `.md` e gera de novo.

## Criando um novo projeto (sem o passo a passo)

1. Crie `projetos/<projeto>/` e `projetos/<projeto>/<projeto>.md`, seguindo um roteiro (padrão: `roteiros/iniciativa.txt`) e as regras abaixo. Declare o roteiro no topo (`**Roteiro:** iniciativa`).
2. Crie `projetos/<projeto>/projeto.json`, seguindo o modelo de "Projeto e saídas" (tema padrão: `generico`).
3. Coloque o material de entrada em `projetos/<projeto>/apoio/`.
4. Escreva o **resumo (TL;DR)** no topo do documento e, se fizer sentido, a apresentação.
5. Gere as saídas (veja "Gerando as saídas").
6. Revise os arquivos gerados e corrija no `.md`, nunca neles.

## Criando um novo roteiro

Um roteiro é um arquivo de texto com a lista de seções, na ordem em que aparecem, e, para cada uma, a **pergunta** que ela responde e as **indicações** de como escrever.

1. Liste as seções na ordem desejada.
2. Para cada seção, escreva a pergunta central e uma ou duas indicações.
3. Salve como `roteiros/<nome>.txt`.
4. **Indique no fim do arquivo de onde as perguntas e seções foram retiradas** (um texto, um livro, um modelo), com o link quando existir.
5. Registre o roteiro na tabela "Roteiros disponíveis" deste arquivo (ou no `AGENTS-extra.md`, se for só de quem usa) e no `README.md`.

## Regras para documentos de projeto

1. **Sempre Markdown.** O `.md` é a fonte da verdade. Nunca edite o `.docx`, o `.html` nem o `.pdf` gerados, porque são regenerados a partir do `.md`.
2. **Declare e siga o roteiro.** A linha `**Roteiro:** <nome>` (no topo, junto de período, data limite e status) diz qual roteiro o documento segue; sem ela, vale `iniciativa`. Com os roteiros diferentes de `iniciativa` (`businessmodelcanvas`, `10-20-30`, `pdi`, `pitch`), use **uma seção `###` para cada item do arquivo do roteiro**, na mesma ordem; não invente seções fora do roteiro (acrescente "Tópicos" extras só no fim). No `pdi`, cada objetivo é uma seção, com os campos (finalidade da habilidade, estratégias, arquiteturas de aprendizagem, data limite) em linhas consecutivas no início, seguidos do contexto e da tabela de atividades. Um documento de **iniciativa** tem, nesta ordem:
   - Título da iniciativa
   - Período de acompanhamento e data limite (pode ser a próxima data limite, se houver estágios)
   - Resumo (TL;DR), em citação (sugerido)
   - Sobre / Contexto
   - Papéis e Expectativas (RCI)
   - Objetivo / Onde queremos chegar?
   - Atividades em andamento (tabela atividade | responsável | status | observações, ou link para a ferramenta que acompanha)
   - Tópicos (seções específicas do assunto)
   - Documentos de Apoio (opcional; só inclua se houver o que referenciar)
3. **RCI, não RACI.** Só existem Responsável (R), Consultado (C) e Informado (I). O "A" foi removido em dezembro de 2020.
4. **Documento vivo.** Mantenha a discussão em aberto pelo tempo necessário, registrando como se chegou a cada decisão e que caminhos foram testados.
5. **Decisões entre opções:** monte uma matriz de posicionamento com as opções em análise.
6. **Se o resultado é outro documento** (manual, recomendação, FAQ), crie um documento próprio e aponte o link para ele no documento do projeto. Não misture os dois.
7. **Iterativo e incremental.** Pense em uma primeira entrega, valide e aprenda.
8. **Não invente informação.** Dúvidas e leituras incertas ficam marcadas com **(?)**. Campos sem resposta ficam como "A definir".
9. **Todo projeto tem um resumo (TL;DR).** Fica em uma citação no topo, logo depois do cabeçalho, e começa com `**Resumo (TL;DR):**`. Siga o `roteiros/tldr.txt`: nada novo entra no resumo, tudo o que está nele existe no documento completo. **Sugira** o resumo ao fechar o onboarding de um projeto e de novo quando o documento passar de cerca de mil palavras; quem decide criar é a pessoa. Quando o documento mudar de forma relevante, revise o resumo.
10. **Imagens são insumo.** Prints, fotos e esquemas em `apoio/` servem de entrada: transforme o conteúdo deles em texto. Os documentos gerados não levam imagens (o compilador não as trata). Nas apresentações, a regra das imagens ainda está em aberto. **(?)**

## Estilo de escrita

- Português do Brasil, a menos que o `AGENTS-extra.md` diga outra coisa.
- Nomes de pessoas com nome e sobrenome, e o papel que cada uma exerce no projeto.
- Tabelas para papéis, requisitos e atividades. Texto corrido para contexto.

## Formato do Markdown (o que o compilador entende)

| Markdown | Resultado |
| :--- | :--- |
| `# Título` | Título do documento (centralizado). Use um só. |
| `### Seção` | Seção. Com `numberSections` ligado no tema, é numerada automaticamente: **não escreva a numeração no texto.** Na apresentação, é um slide. |
| `#### Subseção` | Subtítulo em destaque, sem numeração. |
| Linhas consecutivas | Mantêm a quebra de linha (útil para período, data limite e status no topo). |
| `- item` (aninhe com 4 espaços) | Lista com marcadores, até 3 níveis. |
| `1. item` | Lista numerada. |
| `> texto` | Destaque com barra lateral (definições, avisos). Uma citação cuja primeira linha termina em `:` vira box com título. |
| Tabela com `\|` | Tabela com cabeçalho colorido e linhas alternadas. |
| `**negrito**`, `*itálico*`, `` `código` ``, `[texto](https://...)` | Formatação inline. Não aninhe (por exemplo, código dentro de negrito). |
| `---` | Ignorado. Pode usar como separador visual no `.md`. |

Não use `##`, imagens (`![]()`), blocos de código ou HTML: o compilador não os trata.

### Apresentações (`<projeto>-slides.md`)

- `# Título` é a capa; as linhas logo abaixo (como o público da apresentação) aparecem nela, menos `Roteiro` e `Status`.
- Cada `### Título` é **um slide**. Poucas palavras: o compilador avisa quando um slide passa de 70 palavras e, no roteiro `10-20-30`, quando o total não é 10 slides depois da capa.
- `**Layout:** destaque` (linha sozinha no slide) deixa o texto grande e centralizado; `**Layout:** fechamento` centraliza o slide final. Sem a linha, vale o layout de conteúdo.
- Uma citação que começa com `Notas:` vira **nota do apresentador** e não aparece no slide (veja-as abrindo o html com `?showNotes=true`). Use as notas para apontar a seção do documento completo que serve de fonte.
- Escreva a apresentação a partir do resumo (TL;DR) e não copie o documento inteiro. Não invente informação: tudo vem do documento completo.

## Projeto e saídas (`projeto.json`)

```json
{
  "nome": "Meu Projeto",
  "tema": "generico",
  "saidas": [
    { "fonte": "meu-projeto.md", "tipo": "documento", "formatos": ["docx", "html", "pdf"] },
    { "fonte": "meu-projeto-slides.md", "tipo": "apresentacao", "formatos": ["html", "pdf"] }
  ],
  "artefatos": [
    { "tipo": "prototipo", "caminho": "prototipo", "origem": "meu-projeto.md", "descricao": "..." }
  ]
}
```

- `tema`: nome de uma pasta em `temas/`.
- `saidas`: cada item é um `.md` (`fonte`), um `tipo` (`documento` ou `apresentacao`) e os `formatos`. O PDF sai do HTML. Um projeto pode ter vários documentos.
- `artefatos` (opcional): registro do que o projeto tem além do Markdown. Não é gerado pelas ferramentas.
- `ajustes` (opcional): sobrescreve opções do tema só neste projeto (por exemplo, `"ajustes": { "footer": ["..."] }`).
- Formato antigo: um `theme.json` dentro do projeto ainda funciona, mas não é mais o padrão.

## Temas (`temas/<tema>/`)

Um tema é a identidade visual e serve às duas formas de saída. Há dois jeitos de ter um:

- **Tema simples (o jeito recomendado): só cores e logo.** Uma pasta com um `tema.json` que herda do `neutro` e uma imagem de logo. Não precisa de `.docx`: o `neutro` já traz a base dos documentos Word (cabeçalho com data e número de página, rodapé e estilos), e o tema só sobrescreve o que declarar. Veja `temas/exemplo-leve/`.
- **Tema completo:** além disso, um `base.docx` próprio, quando a marca tem arte própria (marca d'água, cabeçalhos) ou quando já existe um template Word a aproveitar.

Pasta do tema:

- `tema.json`: cores, fontes, logo, rodapé e opções de layout (abaixo).
- `logo.png` (ou `.jpg`, ou `.svg` só para html, pdf e slides): o logo, indicado em `"logo"`. Nos documentos Word, só png e jpg entram.
- `base.docx` (opcional): base dos documentos Word (cabeçalho, rodapé, estilos, numeração). O compilador troca só o corpo. Em um tema completo, **o logo vem do template**, não do `tema.json`.
- `referencia.pdf` (opcional): como o tema deve parecer; só para conferência humana, nenhuma ferramenta o usa.
- `slides.css` (opcional): acrescentado ao final do CSS das apresentações, para ajustes finos.

Um tema simples é assim:

```json
{
  "extends": "neutro",
  "name": "Minha organização",
  "logo": "logo.png",
  "font": "Open Sans",
  "footer": ["**Minha organização**", "www.exemplo.com.br"],
  "colors": { "titleBlue": "134E4A", "primary": "0F766E", "accent": "B45309" }
}
```

`"extends"` herda tudo do tema `neutro` (layout, margens, base do docx, cores padrão); `"colors"` é mesclado cor a cor, então só as que você declarar mudam. No docx, o rodapé usa as duas primeiras linhas de `footer` e o logo vai centralizado no topo.

O `temas/generico/tema.json` é o modelo de tema completo e o tema **padrão**. Todo projeto novo usa o genérico, a menos que a pessoa (ou o `AGENTS-extra.md`) indique outro. O tema da Wildtech (`temas/wildtech/`) é apenas um exemplo de uso de um tema com marca: a marca, o logo e o endereço dela são da Wildtech.

```json
{
  "name": "Genérico",
  "template": "base.docx",
  "layout": "simple",
  "font": "Open Sans",
  "headingFont": "Arial",
  "numberSections": false,
  "uppercaseTitles": false,
  "keepLeadingParagraphs": 1,
  "indent": 0,
  "margins": [1008, 1008],
  "headerDate": true,
  "logoText": "💡",
  "footer": ["**Empresa** - slogan", "https endereçoempresa"],
  "colors": {
    "titleBlue": "222222", "primary": "503030", "accent": "B85C00",
    "text": "222222", "textStrong": "000000",
    "tableStripe": "F3F3F3", "calloutFill": "F3F3F3", "border": "D1D5DB"
  }
}
```

- `template`: o `.docx` de base, relativo à pasta do tema.
- `colors`: cores de títulos, tabelas e destaques. Devem combinar com o template. Nas apresentações, as mesmas cores, a fonte e o logo são usados.
- `font`: fonte do texto. Quem abrir o `.docx` sem a fonte instalada verá uma substituta.
- Opções, todas opcionais:

| Opção | O que faz | Padrão |
| :--- | :--- | :--- |
| `layout` | `"simple"` (logo centralizado no topo e rodapé de texto) ou `"classic"` (logo no canto, marca d'água e barra degradê; exige as imagens `image1` a `image3` no template), só no html e no pdf dos documentos | `"classic"` |
| `numberSections` | numera as seções (1., 2., ...) | `true` (`false` no `simple`) |
| `uppercaseTitles` | título e seções em maiúsculas | `true` (`false` no `simple`) |
| `headingFont` | fonte dos títulos | igual a `font` |
| `indent` e `margins` | recuo do texto e margens `[esquerda, direita]` em twips, para o docx | `850` e `[1134, 1132]` |
| `keepLeadingParagraphs` | quantos parágrafos do início do template são mantidos (use `1` quando o logo está no corpo do template, não no cabeçalho) | `0` |
| `headerDate` | troca o texto `dd/mmm/yyyy` do cabeçalho do docx pela data da geração e, no pdf, mostra a data ao lado do número da página | `false` |
| `logoMedia` | imagem do template usada como logo no `simple` | `"image1.png"` |
| `logoText` | texto ou emoji usado como logo no `simple`, no lugar de uma imagem; `logoTextSize` define o tamanho em px | nenhum, `120` |
| `footer` | linhas (Markdown) do rodapé no `simple` | nenhuma |
| `pageMarginTop` | margem do topo do pdf, em mm | `22` |

### Criando um tema a partir de arquivos existentes

- **Das cores e do logo (o caso comum):** peça à pessoa o logo e as cores (ou extraia-as do logo, do site ou de um material que ela tenha) e crie um tema simples, como acima. Gere o projeto de exemplo para ela ver o resultado.
- **De um `.docx`:** coloque-o em `temas/<tema>/base.docx`. Extraia cores, fontes e logo (o `.docx` é um zip: `word/styles.xml`, `word/media/`) para o `tema.json`, copie as opções de um tema parecido e gere o projeto de exemplo para comparar com o `referencia.pdf`. Ajuste `indent`, `margins` e as cores até ficar parecido.
- **De um `.pptx`:** ele serve de referência para as **apresentações**, que usam reveal.js e não consomem um PowerPoint como molde. O `.pptx` também é um zip: a paleta e as fontes estão em `ppt/theme/theme1.xml`, o logo e os fundos em `ppt/media/`, e os layouts em `ppt/slideLayouts/`. Extraia-os e escreva o `slides.css` do tema. É uma interpretação: mostre o resultado e deixe a pessoa revisar.
- **De um PDF:** só quando não há `.docx` nem `.pptx`. Renderize as páginas em imagem e estime cores, fontes e posição do logo. O resultado é uma aproximação.
- Temas **com marca** ficam no repositório de quem os criou; no repositório público do template entram só temas genéricos.

## Gerando as saídas

Na primeira vez, instale as dependências (precisa de Node.js):

```bash
cd tools && npm install
```

Para gerar todas as saídas de um projeto, a partir da raiz do repositório:

```bash
node tools/build.js projetos/exemplo-ideia
```

- Lê o `projeto.json` e gera cada item de `saidas` em `projetos/<pasta>/out/`. Sem `projeto.json` (formato antigo), gera `<pasta>.md` em docx, html e pdf.
- **Padrão: sempre gerar** as saídas com `build.js`, a cada alteração de um `.md`.
- Para gerar um formato só: `node tools/md2docx.js`, `node tools/md2html.js`, `node tools/md2slides.js` ou `node tools/md2pdf.js` (o `md2pdf.js` exige o HTML já gerado). Formato: `node tools/md2docx.js projetos/<pasta> <arquivo.md> <saida.docx>` (o mesmo vale para os outros; o `md2pdf.js` recebe o `.html` e a saída `.pdf`).
- **docx:** mantém cabeçalho, rodapé e a página do template e troca só o corpo do documento.
- **html (documento):** arquivo único e autocontido, no visual do template. O logo é extraído do `base.docx` e embutido.
- **html (apresentação):** arquivo único com o reveal.js embutido, funciona offline. Navegue com as setas; `?showNotes=true` mostra as notas.
- **pdf:** gerado a partir do html, com o Chrome (A4 com número de página, para documentos; uma página 16:9 por slide, para apresentações). O pdf dos slides usa uma **impressão estática**, sem JavaScript (o html é aberto com `?static-print`), porque o modo de impressão do reveal depende de temporização e às vezes sai em branco no Chrome headless. O Chrome, o Chromium ou o Edge são procurados nos caminhos padrão de macOS, Windows e Linux; se não forem encontrados, defina a variável `CHROME` com o caminho do executável.
- As tabelas do `.md` viram o "box" do template (cabeçalho colorido e corpo cinza).

Verificação depois de gerar:
- docx, prévia no macOS: `qlmanage -t -s 1400 -o /tmp <arquivo>.docx`. Ela não é fiel ao Word. Abra o `.docx` no Word antes de distribuir.
- pdf: `qlmanage -t -s 1400 -o /tmp <arquivo>.pdf` e confira a paginação abrindo o arquivo. Nas apresentações, confira se nenhum slide transborda e leia os avisos do compilador.
- Compare o resultado com o `referencia.pdf` do tema.

## Integrações opcionais

Só use o que a pessoa configurou. **Não há relação direta entre pasta de projeto e projeto Jira ou repositório GitHub**: um projeto daqui pode gerar uma issue relacionada, e um arquivo de apoio pode ser anexado a ela, mas isso é decidido caso a caso. As URLs e os nomes da pessoa ou da organização ficam no `AGENTS-extra.md`.

### Jira (opcional)

Acesso pelo MCP da Atlassian (`https://mcp.atlassian.com/v2/mcp`), que a pessoa precisa configurar na ferramenta dela. **A URL do Jira é da pessoa ou da equipe: leia no `AGENTS-extra.md` ou pergunte** (formato `https://<sua-empresa>.atlassian.net/`). Se ela não usa Jira, ignore esta seção.

- **Pergunte o projeto Jira.** Antes de criar uma issue, confirme o projeto, o tipo e, se houver, o responsável. Não assuma.
- **Confirme antes de escrever.** Mostre o rascunho (projeto, tipo, título, descrição) e só crie ou altere issues depois do OK. Leituras e buscas não precisam de confirmação.
- **Não apague nada no Jira.**
- **O `.md` continua sendo a fonte da verdade.** Registre a chave da issue (ex.: `ABC-123`) com link na tabela de atividades ou em "Documentos de Apoio".

### GitHub (opcional)

Use a CLI `gh` (instalada e autenticada com `gh auth login`). Se a pessoa não usa GitHub, ignore esta seção.

- **Pergunte o repositório** antes de criar uma issue ou um pull request. Não assuma.
- **Confirme antes de escrever.** Mostre o rascunho (repositório, título, descrição) e só crie ou altere issues e PRs depois do OK. Leituras e buscas não precisam de confirmação.
- **Não apague nada no GitHub** (issues, branches, repositórios) sem pedido explícito.
- **O `.md` continua sendo a fonte da verdade.** Registre o link da issue ou do PR nas atividades ou em "Documentos de Apoio".

## Ajuste ao seu fluxo

### Git

Esta é a regra padrão (a que o criador do template, Daniel Wildt, usa). **Ajuste conforme o seu fluxo no `AGENTS-extra.md`**, por exemplo para dar mais autonomia ao assistente.

- Faça commits **somente quando a pessoa pedir**.
- **O push é sempre feito pela pessoa.** Nunca execute `git push`. (Quem quiser mais flexibilidade pode trocar por: "faça o push da branch de trabalho quando a pessoa pedir", ou liberar o push depois do commit.)
- `.DS_Store`, `node_modules/` e `out/` estão no `.gitignore`. Os arquivos gerados não são versionados; para distribuir um documento, gere de novo a partir do `.md`.

## Contribuições

O repositório aceita contribuições (roteiros, temas genéricos, ferramentas e textos). As regras estão na seção "Como contribuir" do `README.md`. Se a pessoa quiser contribuir, ajude-a a:

1. Seguir "Criando um novo roteiro" e **registrar a fonte** das perguntas e seções no fim do arquivo.
2. Registrar o roteiro nas tabelas do `README.md` e do `AGENTS.md`.
3. Rodar `node tools/build.js projetos/exemplo-ideia` e conferir as saídas.
4. Preparar o commit e o *pull request* só quando ela pedir e confirmar o conteúdo (com a CLI `gh`, se ela usa GitHub; veja "Integrações opcionais"). Nada de dados pessoais, marcas de terceiros ou projetos pessoais.

Melhorias nos arquivos `[base]` devem ir para a origem do template, e não ficar só no repositório de quem usa. **Quem decide e faz a contribuição é a pessoa**, na origem do template; um agente não altera o `AGENTS.md` do repositório de quem usa para isso.

## Licença e crédito

- Documentos, roteiros e temas do template: Creative Commons Atribuição 4.0 (CC BY 4.0), ver `LICENSE`. A licença cobre só os arquivos `[base]`: os projetos e o `AGENTS-extra.md` de quem usa são de quem os criou. O logo da Creative Commons (em `temas/exemplo-cc/`) é marca dela e não está coberto: aparece só como ilustração.
- `tools/`: MIT, ver `tools/LICENSE`.
- Quem usar, adaptar ou publicar este template ou um derivado deve **dar crédito à origem**: Daniel Wildt / Wildtech, https://github.com/wildtech/ideia. Mantenha esse crédito no README do repositório derivado.
- A marca, o logo e o endereço da Wildtech não estão incluídos na licença; aparecem só como exemplo de uso.
- O conteúdo é oferecido como está, sem garantias de qualquer tipo.
