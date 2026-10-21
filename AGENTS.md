# AGENTS.md

Este repositório é um **template para organizar ideias e iniciativas em documentos**. Cada projeto fica em uma pasta própria, e o documento principal é sempre um arquivo Markdown. Os `.md` são "compilados" em `.docx`, `.html` e `.pdf` com a identidade visual escolhida.

Este arquivo é lido pelo assistente de IA (Claude Code, Kiro, Codex ou outro que leia `AGENTS.md`). Ele diz como conduzir a pessoa, que pode **não ser técnica**: quem usa conversa com você, e é você quem cria os arquivos e roda os comandos.

## Estrutura do repositório

O repositório separa o que é **base** (o que vem com o template) do que é **conteúdo** (os projetos da pessoa, em `projetos/`).

```
ideia/
├── AGENTS.md                              [base] este arquivo
├── README.md                              [base] apresentação e primeiros passos para humanos
├── LICENSE                                [base] licença dos documentos e templates (CC BY 4.0)
├── template-iniciativa.txt                [base] template de conteúdo: seções, perguntas e indicações de uma iniciativa
├── template-businessmodelcanvas.txt       [base] template de conteúdo: modelar uma ideia de negócio (Business Model Canvas)
├── template-10-20-30.txt                  [base] template de conteúdo: roteiro de apresentação em 10 slides (Guy Kawasaki)
├── template-pdi.txt                       [base] template de conteúdo: plano de desenvolvimento individual (aprendizagem autodirigida)
├── template-generico-projeto-doc.docx     [base] template visual PADRÃO (logo 💡, fontes, cabeçalho, rodapé), usado na compilação
├── template-generico-projeto-doc.pdf      [base] referência visual do template padrão
├── template-wildtech-projeto-doc.docx     [base] template visual da Wildtech, apenas EXEMPLO DE USO de um template com marca
├── template-wildtech-projeto-doc.pdf      [base] referência visual do exemplo da Wildtech
├── tools/                                 [base] compiladores (licença MIT, ver tools/LICENSE)
│   ├── md-parse.js                        parser Markdown compartilhado
│   ├── md2docx.js                         Markdown → docx
│   ├── md2html.js                         Markdown → html
│   ├── md2pdf.js                          html → pdf (Chrome headless)
│   ├── build.js                           gera os três formatos de uma vez
│   └── package.json                       dependências (docx, jszip, pngjs)
└── projetos/                              [conteúdo] um projeto por pasta
    └── <projeto>/
        ├── <projeto>.md                   documento principal (fonte da verdade)
        ├── theme.json                     tema usado na geração do docx, do html e do pdf
        ├── out/                           saída gerada; fora do git; não editar à mão
        └── ...                            material de apoio (imagens, anotações, anexos)
```

- `projetos/exemplo/` é um projeto de exemplo e serve como modelo: ele descreve o próprio repositório. Apague-o (ou use-o só de referência) quando a pessoa criar os projetos dela.
- **Dois tipos de template:** o de **conteúdo** (`template-*.txt`) diz o que escrever; o **visual** (`template-*-projeto-doc.docx`) diz como o documento parece. Um projeto combina um de cada.
- **Templates de conteúdo disponíveis:**

| Template | Para que serve |
| :--- | :--- |
| `template-iniciativa.txt` | Documentar uma iniciativa, um projeto ou uma decisão (o padrão) |
| `template-businessmodelcanvas.txt` | Modelar uma ideia de negócio, com as 9 perguntas do Business Model Canvas |
| `template-10-20-30.txt` | Preparar uma apresentação de uma ideia ou negócio em 10 slides, 20 minutos, fonte 30 |
| `template-pdi.txt` | Montar um plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida |

  A pessoa também pode criar os seus (ver "Criando um novo template de conteúdo"). Para uma ideia de negócio nova, o caminho natural é o Business Model Canvas primeiro e o 10-20-30 depois, para apresentar o que o canvas organizou.

## Onboarding (roteiro para o assistente)

Use este roteiro quando a pessoa pedir para começar, criar um projeto ou "organizar uma ideia". Regras da conversa:

- Linguagem simples, sem jargão técnico. Explique em uma frase o que vai fazer antes de fazer.
- **Uma pergunta por vez.** Ofereça opções quando houver, com uma recomendação.
- Quem digita os comandos é você. Não peça para a pessoa abrir terminal, a menos que você não consiga rodar comandos.
- Nunca invente informação. O que a pessoa não souber fica marcado com **(?)** ou "A definir".

Passos:

1. **Verificar o computador.** Confirme que há Node.js (`node --version`) e um navegador Chrome, Chromium ou Edge. Se faltar, explique como instalar, e na primeira vez rode `cd tools && npm install`.
2. **Escolher o template de conteúdo.** Pergunte o que a pessoa quer fazer e recomende: documentar uma iniciativa (iniciativa), modelar uma ideia de negócio (Business Model Canvas), preparar uma apresentação (10-20-30) ou montar um plano de desenvolvimento individual (PDI). Se ela quiser outro modelo, veja "Criando um novo template de conteúdo".
3. **Escolher o template visual.** Se a pessoa não indicar um, **use o genérico** (`template-generico-projeto-doc.docx`), que é o padrão do repositório. Se ela quiser a identidade visual dela, ajude a criar o template (ver "Tema do projeto"). O da Wildtech é só um exemplo de template com marca: não o use para a pessoa.
4. **Perguntar o necessário para o documento:**
   - nome do projeto (vira o nome da pasta e do arquivo; sem espaços e acentos, em minúsculas, com hífen);
   - título da iniciativa;
   - pessoa responsável, com nome e sobrenome (e as outras pessoas envolvidas, se houver);
   - período de acompanhamento e data limite (pode ser "A definir");
   - projeto Jira ou repositório GitHub relacionado, se houver (ver "Integrações opcionais").
5. **Pedir o material de apoio**, se existir: textos, anotações, transcrições, prints e fotos. Peça para a pessoa colocá-lo na pasta do projeto ou colar na conversa.
6. **Ler o material e escrever o primeiro rascunho.** As imagens são **insumo**: leia o conteúdo delas e transforme em texto no `.md`. O documento gerado não leva imagens; a imagem original fica na pasta do projeto e é citada em "Documentos de Apoio".
7. **Criar os arquivos:** `projetos/<projeto>/<projeto>.md` (seguindo o template de conteúdo e as regras abaixo) e `projetos/<projeto>/theme.json` (copie o de `projetos/exemplo/`).
8. **Gerar os três formatos** (ver "Gerando os documentos"), mostrar o que foi criado e perguntar o que ajustar.
9. **Combinar a continuidade.** O documento é vivo: a pessoa volta com novas informações e você atualiza o `.md` e gera de novo.

## Criando um novo projeto (sem o roteiro)

1. Crie `projetos/<projeto>/` e `projetos/<projeto>/<projeto>.md`, seguindo o template de conteúdo e as regras abaixo.
2. Crie `projetos/<projeto>/theme.json` copiando o de `projetos/exemplo/theme.json` (veja "Tema do projeto").
3. Gere o `.docx`, o `.html` e o `.pdf`.
4. Revise os arquivos gerados e corrija no `.md`, nunca neles.

## Criando um novo template de conteúdo

Um template de conteúdo é um arquivo de texto com a lista de seções, na ordem em que aparecem, e, para cada uma, a **pergunta** que ela responde e as **indicações** de como escrever.

1. Liste as seções na ordem desejada.
2. Para cada seção, escreva a pergunta central e uma ou duas indicações.
3. Salve como `template-<nome>.txt` na raiz.
4. Declare no documento do projeto qual template ele segue (por exemplo, na linha de status do topo) e acrescente a lista de seções na seção "Regras para documentos de projeto", abaixo, quando fizer sentido.

## Declarando o template do projeto

Todo documento declara o template de conteúdo que segue, em uma linha no topo, junto de período, data limite e status:

```
**Template:** iniciativa
```

Valores: `iniciativa`, `businessmodelcanvas`, `10-20-30`, `pdi` ou o nome de um template criado pela pessoa. Sem a linha, vale `iniciativa`.

- **Seções:** com `businessmodelcanvas`, `10-20-30` e `pdi`, abra o `template-<nome>.txt` e use **uma seção (`###`) para cada item do arquivo**, na mesma ordem. O título da seção é o nome do item, e o texto dela responde à pergunta e segue as indicações. Não invente seções fora do template; acrescente "Tópicos" extras só no fim, se precisar.
- **As regras gerais abaixo** (RCI, documento vivo, não inventar informação, **(?)**) valem para todos os templates. As seções fixas listadas na regra 2 valem só para `iniciativa`.
- No `pdi`, as seções são: período, papéis (RCI), **uma seção por objetivo** ("Meu primeiro objetivo", "Meu segundo objetivo", ...), revisão do plano e documentos de apoio. Dentro de cada objetivo, os campos do template (finalidade da habilidade, estratégias, arquiteturas de aprendizagem, data limite) viram linhas consecutivas no início da seção, seguidas do contexto e da tabela de atividades (atividade | responsável | status | observações).
- No `10-20-30`, cada slide vira uma seção, escrita como o que o slide vai dizer, em poucas palavras. Confira se o roteiro cabe em 20 minutos.

## Regras para documentos de projeto

(A regra 2 descreve as seções do template de **iniciativa**, o padrão do repositório. As outras regras valem para todos os templates.)

1. **Sempre Markdown.** O `.md` é a fonte da verdade. Nunca edite o `.docx`, o `.html` nem o `.pdf` gerados, porque são regenerados a partir do `.md`.
2. **Siga o `template-iniciativa.txt`.** Um documento novo deve ter, nesta ordem:
   - Título da iniciativa
   - Período de acompanhamento e data limite (pode ser a próxima data limite, se houver estágios)
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

## Estilo de escrita

- Português do Brasil.
- Nomes de pessoas com nome e sobrenome, e o papel que cada uma exerce no projeto.
- Tabelas para papéis, requisitos e atividades. Texto corrido para contexto.

## Formato do Markdown (o que o compilador entende)

| Markdown | Resultado |
| :--- | :--- |
| `# Título` | Título do documento (centralizado). Use um só. |
| `### Seção` | Seção. Com `numberSections` ligado no tema, é numerada automaticamente: **não escreva a numeração no texto.** |
| `#### Subseção` | Subtítulo em destaque, sem numeração. |
| Linhas consecutivas | Mantêm a quebra de linha (útil para período, data limite e status no topo). |
| `- item` (aninhe com 4 espaços) | Lista com marcadores, até 3 níveis. |
| `1. item` | Lista numerada. |
| `> texto` | Destaque com barra lateral (definições, avisos). |
| Tabela com `\|` | Tabela com cabeçalho colorido e linhas alternadas. |
| `**negrito**`, `*itálico*`, `` `código` ``, `[texto](https://...)` | Formatação inline. Não aninhe (por exemplo, código dentro de negrito). |
| `---` | Ignorado. Pode usar como separador visual no `.md`. |

Não use `##`, imagens (`![]()`), blocos de código ou HTML: o compilador não os trata.

## Tema do projeto (`theme.json`)

O `projetos/exemplo/theme.json` é o modelo, e usa o template genérico (o padrão). **Todo projeto novo copia esse arquivo**, a menos que a pessoa indique outro template visual.

```json
{
  "name": "Genérico",
  "template": "../../template-generico-projeto-doc.docx",
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

- `template`: `.docx` de base, com caminho relativo à pasta do projeto (por isso `../../`, já que o projeto fica em `projetos/<projeto>/`). Ele fornece o logo, o cabeçalho, o rodapé e os estilos. **O logo vem do template**, não do `theme.json`.
- `colors`: cores de títulos, tabelas e destaques. Devem combinar com o template.
- `font`: fonte do texto. Quem abrir o `.docx` sem a fonte instalada verá uma substituta.
- Opções, todas opcionais:

| Opção | O que faz | Padrão |
| :--- | :--- | :--- |
| `layout` | `"simple"` (logo centralizado no topo e rodapé de texto) ou `"classic"` (logo no canto, marca d'água e barra degradê; exige as imagens `image1` a `image3` no template). **Use `simple`** com o template genérico, o da Wildtech e templates próprios | `"classic"` |
| `numberSections` | numera as seções (1., 2., ...) | `true` (`false` no `simple`) |
| `uppercaseTitles` | título e seções em maiúsculas | `true` (`false` no `simple`) |
| `headingFont` | fonte dos títulos | igual a `font` |
| `indent` e `margins` | recuo do texto e margens `[esquerda, direita]` em twips, para o docx | `850` e `[1134, 1132]` |
| `keepLeadingParagraphs` | quantos parágrafos do início do template são mantidos (use `1` quando o logo está no corpo do template, e não no cabeçalho) | `0` |
| `headerDate` | troca o texto `dd/mmm/yyyy` do cabeçalho do docx pela data da geração e, no pdf, mostra a data ao lado do número da página | `false` |
| `logoMedia` | imagem do template usada como logo no `simple` (o template da Wildtech usa `image1.png`) | `"image1.png"` |
| `logoText` | texto ou emoji usado como logo no `simple`, no lugar de uma imagem (o template genérico usa `💡`); `logoTextSize` define o tamanho em px | nenhum, `120` |
| `footer` | linhas (Markdown) do rodapé no `simple` | nenhuma |
| `pageMarginTop` | margem do topo do pdf, em mm | `22` |

- **Identidade visual própria:** a pessoa cria um `.docx` no Word (ou no Google Docs, exportando) com o logo, o cabeçalho e o rodapé dela, mais um `.pdf` de referência. Salve como `template-<marca>-projeto-doc.docx` na raiz e aponte `template` para ele. Se o logo estiver no corpo do documento, use `keepLeadingParagraphs: 1`; no `simple`, `logoMedia` diz qual imagem do `.docx` é o logo. Gere o exemplo e compare com o `.pdf` de referência; ajuste `indent`, `margins` e as cores até ficar parecido.

## Gerando os documentos

Na primeira vez, instale as dependências (precisa de Node.js):

```bash
cd tools && npm install
```

Para gerar os documentos de um projeto, a partir da raiz do repositório:

```bash
node tools/build.js projetos/exemplo
```

- Sem outros argumentos, lê `projetos/<pasta>/<pasta>.md` e grava `projetos/<pasta>/out/<pasta>.docx`, `.html` e `.pdf`. A pasta `out/` é criada se não existir.
- **Padrão: sempre gerar os três formatos** com `build.js`, a cada alteração do `.md`. Para gerar um formato só: `node tools/md2docx.js`, `node tools/md2html.js` ou `node tools/md2pdf.js` (o `md2pdf.js` exige o HTML já gerado).
- Para outro arquivo ou destino: `node tools/md2docx.js projetos/<pasta> <arquivo.md> <saida.docx>` (o mesmo vale para o `md2html.js` e o `md2pdf.js`, que recebe o `.html` e a saída `.pdf`).
- **docx:** mantém cabeçalho, rodapé e a página do template e troca só o corpo do documento.
- **html:** arquivo único e autocontido, no visual do template. O logo é extraído do `.docx` do template e embutido no arquivo.
- **pdf:** gerado a partir do html, com o Chrome em modo headless (A4, com número de página). O Chrome, o Chromium ou o Edge são procurados nos caminhos padrão de macOS, Windows e Linux; se não forem encontrados, defina a variável `CHROME` com o caminho do executável.
- As tabelas do `.md` viram o "box" do template (cabeçalho colorido e corpo cinza). Uma citação (`>`) cuja primeira linha termina em `:` vira box com título.

Verificação depois de gerar:
- docx, prévia no macOS: `qlmanage -t -s 1400 -o /tmp <arquivo>.docx`. Ela não é fiel ao Word. Abra o `.docx` no Word antes de distribuir.
- pdf: `qlmanage -t -s 1400 -o /tmp projetos/<pasta>/out/<pasta>.pdf` e confira a paginação abrindo o arquivo.
- Compare o resultado com o `.pdf` de referência do template.

## Integrações opcionais

Só use o que a pessoa configurou. **Não há relação direta entre pasta de projeto e projeto Jira ou repositório GitHub**: um projeto daqui pode gerar uma issue relacionada, e um arquivo de apoio pode ser anexado a ela, mas isso é decidido caso a caso.

### Jira (opcional)

Acesso pelo MCP da Atlassian (`https://mcp.atlassian.com/v2/mcp`), que a pessoa precisa configurar na ferramenta dela. **A URL do Jira é da pessoa ou da equipe: pergunte e use a dela** (formato `https://<sua-empresa>.atlassian.net/`). Se ela não usa Jira, ignore esta seção.

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

Esta é a regra que o criador do template (Daniel Wildt) usa. **Ajuste conforme o seu fluxo**, por exemplo para dar mais autonomia ao assistente.

- Faça commits **somente quando a pessoa pedir**.
- **O push é sempre feito pela pessoa.** Nunca execute `git push`. (Quem quiser mais flexibilidade pode trocar por: "faça o push da branch de trabalho quando a pessoa pedir", ou liberar o push depois do commit.)
- `.DS_Store`, `node_modules/` e `out/` estão no `.gitignore`. Os arquivos gerados não são versionados; para distribuir um documento, gere de novo a partir do `.md`.

## Contribuições

O repositório aceita contribuições (templates de conteúdo, templates visuais genéricos, ferramentas e textos). As regras estão na seção "Como contribuir" do `README.md`. Se a pessoa quiser contribuir, ajude-a a:

1. Seguir "Criando um novo template de conteúdo" e **registrar a fonte** das perguntas e seções no fim do arquivo.
2. Registrar o template nas tabelas do `README.md` e do `AGENTS.md`.
3. Rodar `node tools/build.js projetos/exemplo` e conferir os três formatos.
4. Preparar o commit e o *pull request* só quando ela pedir e confirmar o conteúdo (com a CLI `gh`, se ela usa GitHub; veja "Integrações opcionais"). Nada de dados pessoais, marcas de terceiros ou projetos pessoais.

## Licença e crédito

- Documentos e templates: Creative Commons Atribuição 4.0 (CC BY 4.0), ver `LICENSE`.
- `tools/`: MIT, ver `tools/LICENSE`.
- Quem usar, adaptar ou publicar este template ou um derivado deve **dar crédito à origem**: Daniel Wildt / Wildtech, https://github.com/wildtech/ideia. Mantenha esse crédito no README do repositório derivado.
- O conteúdo é oferecido como está, sem garantias de qualquer tipo.
