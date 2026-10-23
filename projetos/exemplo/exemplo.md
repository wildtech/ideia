# Estrutura de Modelagem de Projetos e Documentos

**Período de Acompanhamento:** Outubro de 2026 em diante.
**Data Limite:** A definir.
**Roteiro:** iniciativa
**Status do documento:** Rascunho, em construção. Este documento é também o projeto de exemplo da estrutura que ele descreve.

---

> **Resumo (TL;DR):**
> - **Ideia:** uma estrutura para transformar textos e imagens de apoio em documentos e apresentações de projetos, guiada por **roteiros** (conjuntos de perguntas) e com identidade visual própria (**tema**).
> - **Como funciona:** a pessoa escolhe um roteiro, responde às perguntas (com ajuda de um assistente de IA que entrevista) e gera as **saídas**: documento completo, resumo e apresentação.
> - **Para quem:** pessoas não técnicas. O assistente conduz o onboarding, cria os arquivos e roda os comandos.
> - **Como é divulgado:** repositório template no GitHub ([wildtech/ideia](https://github.com/wildtech/ideia)), com licença CC BY 4.0 (conteúdo) e MIT (ferramentas).
> - **Estado:** estrutura em validação; falta o teste com outra pessoa.

---

### Sobre / Contexto

Quem toca iniciativas costuma ter textos soltos, anotações de reunião, prints e imagens de apoio, mas não tem um lugar único onde isso vira um documento claro, com contexto, responsáveis, objetivo e decisões registradas. Este projeto cria uma **estrutura de modelagem de projetos**: a pessoa reúne textos e imagens de apoio, escolhe um **roteiro** com perguntas e indicações, e o documento da iniciativa vai sendo escrito e mantido a partir dele.

O fluxo de configuração de um projeto lembra o trabalho de um analista de negócios: o assistente usa o roteiro para **entrevistar de forma abrangente** e ajudar a modelar o projeto, e a pessoa responde.

O repositório que guarda essa estrutura ([wildtech/ideia](https://github.com/wildtech/ideia)) também será divulgado como **template**, para que outras pessoas e equipes possam usar, adaptar e criar seus próprios roteiros e temas. Este documento é o primeiro exemplo de uso: ele segue o roteiro de iniciativa para descrever o próprio projeto (um "meta projeto").

Este é um documento vivo. Itens marcados com **(?)** são dúvidas ainda por confirmar, e campos sem resposta ficam como "A definir".

> **Definições:**
> - **Iniciativa** é o assunto tratado em um documento: um projeto, uma decisão, um problema a resolver.
> - **Roteiro** é o conjunto de perguntas, com indicações, que guia a escrita e a entrevista (exemplo: `roteiros/iniciativa.txt`).
> - **Tema** é a identidade visual: logo, cores, fontes e rodapé (exemplo: `temas/generico/`).
> - **Saída** é cada entrega gerada a partir de um documento: o documento completo, um resumo ou uma apresentação, em formatos como docx, html e pdf.
> - **Artefato** é uma saída derivada de um documento mas **persistente**: um protótipo ou um código, por exemplo, que fica versionado no projeto e evolui por conta própria.
> - **AGENTS-extra.md** é o arquivo complementar de quem usa o template, com o que é específico da pessoa ou da organização (integrações, temas próprios, fluxo de Git, glossário). O `AGENTS.md` é a base compartilhada e não é editado para isso.
> - **Guia** é um texto de apoio sobre como fazer bem uma coisa (exemplo: `guias/pitch.md`). Complementa um roteiro, mas não é um.
> - **Documento principal** é o arquivo Markdown do projeto. Ele é a fonte da verdade das saídas geradas.

---

### Papéis e Expectativas (RCI)

- **R (Responsável):** A pessoa que executa o trabalho.
- **C (Consultado):** Pessoas que devem ser ouvidas e cuja opinião é necessária (comunicação bidirecional).
- **I (Informado):** Pessoas que devem ser mantidas atualizadas sobre o progresso (comunicação unidirecional).

| Nome/Equipe | Papel Principal | R | C | I |
| :--- | :--- | :--- | :--- | :--- |
| **Daniel Wildt** | Criador e único responsável pela iniciativa: estrutura, roteiros, temas, ferramentas, testes e divulgação | X | | |

> Por enquanto, apenas Daniel Wildt atua neste projeto. Pessoas consultadas e informadas serão incluídas se isso mudar.

---

### Objetivo / Onde queremos chegar?

Facilitar o desenvolvimento e a documentação de iniciativas, partindo de textos e imagens de apoio e seguindo um roteiro de perguntas, de modo que qualquer pessoa consiga começar um documento bom sem partir de uma página em branco.

1. Ter um repositório template, pronto para ser usado por outras pessoas, com um projeto de exemplo (este documento).
2. Oferecer um **onboarding** que ajude a pessoa, mesmo sem experiência técnica, a escolher um roteiro, configurar a identidade visual e criar o primeiro projeto.
3. Permitir que as pessoas **criem novos roteiros** e novos **temas**.
4. Gerar, a partir do mesmo projeto, o **documento completo** e uma **apresentação** com o resumo.
5. Divulgar a estrutura com licença que permita uso e derivação, com crédito à origem.

**Indicador de sucesso (proposta):** Uma pessoa não técnica, que nunca viu o repositório, consegue, seguindo o onboarding, gerar o primeiro documento (docx, html e pdf) com o próprio tema. O primeiro teste será feito por Daniel Wildt no repositório publicado; número de pessoas e prazo a definir. **(?)**

---

### Atividades em andamento

| Atividade | Responsável | Status | Observações |
| :--- | :--- | :--- | :--- |
| Compiladores de Markdown para docx, html e pdf | Daniel Wildt | Concluída (primeira versão) | Funcionam com temas de marcas diferentes |
| Reorganização em roteiros, temas e saídas (`projeto.json`) | Daniel Wildt | Em validação | Validada em um repositório de uso real antes de entrar na origem do template |
| Compilador de apresentações (reveal.js) | Daniel Wildt | Em validação | Primeira versão: html e pdf |
| Projeto de exemplo (este documento) | Daniel Wildt | Em andamento | Gera documento e apresentação |
| Licença do repositório | Daniel Wildt | Decidida | CC BY 4.0 para documentos e roteiros; MIT para `tools/` |
| Criar o repositório template e copiar os arquivos base | Daniel Wildt | Em andamento | Repositório: [wildtech/ideia](https://github.com/wildtech/ideia) |
| Onboarding guiado (README e passo a passo no `AGENTS.md`) | Daniel Wildt | Em andamento | Formato decidido; falta testar |
| Teste do uso no repositório publicado | Daniel Wildt | A iniciar | Depois da publicação |
| Roteiros: Business Model Canvas, 10-20-30, PDI e pitch | Daniel Wildt | Concluída (primeira versão) | Perguntas e seções tiradas dos textos e modelos de referência; falta testar com uso real |
| Saída em PowerPoint (`.pptx`) a partir do tema | Daniel Wildt | A definir | Segunda rodada, se as pessoas precisarem editar os slides |
| `AGENTS-extra.md` e o modelo `AGENTS-extra.example.md` | Daniel Wildt | Em validação | Separa o que é base do que é de quem usa |
| Tema simples (só cores e logo, herdando do tema `neutro`) | Daniel Wildt | Concluída (primeira versão) | Exemplo em `temas/exemplo-leve/`; falta testar com um logo real |

---

### Os conceitos e como se encaixam

Antes, tudo se chamava "template". Agora cada coisa tem o seu nome, e cada uma pode mudar sem mexer nas outras.

| Conceito | Responde a | Onde fica |
| :--- | :--- | :--- |
| **Roteiro** | O que perguntar e escrever? | `roteiros/` |
| **Guia** | Como fazer bem? | `guias/` |
| **Tema** | Como parece? | `temas/<tema>/` |
| **Projeto** | Qual é o assunto? | `projetos/<projeto>/` |
| **Saída** | O que é gerado, e em quais formatos? | `projeto.json` e `out/` |
| **Artefato** | O que mais o projeto tem, versionado? | `projeto.json` e pastas do projeto |

Um projeto tem um **tema** e uma ou mais **saídas**. Cada saída vem de um arquivo Markdown (a fonte) e tem um **tipo** (documento ou apresentação) e os **formatos** desejados.

---

### Estrutura de um projeto

| Arquivo ou pasta | O que é |
| :--- | :--- |
| `projeto.json` | Nome, tema, saídas e artefatos do projeto |
| `<projeto>.md` | Documento completo (fonte da verdade), com o roteiro declarado no topo e um resumo (TL;DR) |
| `<projeto>-slides.md` | Apresentação do resumo, escrita para ser falada (opcional) |
| `apoio/` | Material de entrada: prints, transcrições, anotações (insumo, não conteúdo) |
| `out/` | Saídas geradas (docx, html, pdf); descartável, fora do git, regenerada do `.md` |
| outras pastas (por exemplo, `prototipo/`) | Artefatos persistentes, versionados |

#### Saídas e artefatos

- **Saídas** são geradas pelas ferramentas, vão para `out/` e são descartáveis: a fonte é o `.md`.
- **Artefatos** também nascem de um documento (um protótipo gerado a partir da especificação, por exemplo), mas depois **ficam no repositório e evoluem por conta própria**. O `projeto.json` registra o artefato com a sua `origem` (o documento de onde nasceu), para não perder a rastreabilidade.
- Como um artefato pode divergir do documento: o documento é a verdade sobre a **intenção** (o que e por quê), e o artefato, sobre o **comportamento**. Quando um mudar de forma relevante, o outro deve ser revisado.
- Boas práticas para artefatos de software: pasta própria com `README` e instruções para rodar, `package.json` próprio (sem misturar com `tools/`), **dados fictícios**, e nada de segredos ou dados reais no repositório.

---

### O que é de quem usa: `AGENTS-extra.md`

O `AGENTS.md` é a **base compartilhada** do template. Tudo o que é específico de quem usa (a URL do Jira, os temas da organização, o fluxo de Git, o glossário, a lista de projetos) vai em um arquivo complementar, o `AGENTS-extra.md`, na raiz. Assim a base pode ser atualizada com as melhorias do template sem apagar nada que seja da pessoa.

- O assistente **lê o `AGENTS-extra.md` no início de toda sessão**. Quando ele é mais específico, prevalece sobre o `AGENTS.md`, mas não pode relaxar as regras de integridade (não inventar informação, confirmar antes de escrever em sistemas externos, proteger dados sensíveis).
- O `AGENTS-extra.example.md` documenta a convenção e traz as seções sugeridas.
- **No primeiro projeto**, se o arquivo não existir, o assistente oferece criá-lo a partir do modelo, perguntando só o que a pessoa souber.
- **Nunca** se colocam segredos nele.

---

### Documento e apresentação

O **documento completo** é lido sozinho: tem contexto, tabelas, decisões e dúvidas. A **apresentação** é falada por alguém: uma ideia por slide, poucas palavras, notas do apresentador. Por isso são arquivos separados, e a apresentação não é convertida automaticamente do documento.

- **Resumo (TL;DR):** todo projeto deve ter um. Fica em uma citação no topo do documento, logo depois do cabeçalho. O assistente deve **sugerir** o resumo ao fechar o onboarding e de novo quando o documento passar de cerca de mil palavras.
- **Apresentação:** é o resumo em forma de slides. Cada seção `###` do Markdown vira um slide, e uma citação que começa com "Notas:" vira nota do apresentador.
- **Roteiros de apresentação:** o 10-20-30 e o pitch já são roteiros pensados para slides.
- **Aviso automático:** o compilador avisa quando um slide tem texto demais e, no roteiro 10-20-30, quando o total não é 10 slides.

---

### Temas

Um tema é a identidade visual do projeto e serve às duas formas de saída.

| Parte do tema | Para que serve |
| :--- | :--- |
| `tema.json` | Cores, fontes, logo, rodapé e opções de layout |
| `logo.png` | O logo (png ou jpg para o docx; svg também serve para html, pdf e slides) |
| `base.docx` (opcional) | Base dos documentos Word, nos temas completos |
| `referencia.pdf` | Como o tema deve parecer; só para conferência humana |
| `slides.css` (opcional) | Ajustes finos do visual das apresentações |

#### Tema simples: só cores e logo

O jeito mais fácil de ter uma identidade visual própria não exige Word nem PowerPoint. O tema herda do `neutro`, que traz a base dos documentos, e declara só as **cores**, o **logo** e, se quiser, a fonte e o rodapé. É o que o assistente cria para quem não é técnico: ele pergunta as cores e pede o arquivo do logo. Os temas com arte própria (marca d'água, cabeçalhos especiais) continuam podendo ter um `base.docx` próprio.

#### Como criar um tema a partir de arquivos existentes

- **Das cores e do logo:** o assistente cria o tema simples.
- **De um documento Word (`.docx`):** o arquivo vira a base dos documentos, e o assistente extrai cores, fontes e logo para o `tema.json`.
- **De uma apresentação PowerPoint (`.pptx`):** o arquivo serve de referência para os slides. O assistente extrai paleta, fontes, logo e fundos e escreve o `slides.css` do reveal.js. É uma interpretação, e a pessoa revisa o resultado.
- **De um PDF:** só quando não há docx nem pptx. O resultado é uma aproximação, estimada a partir das imagens.
- **Temas com marca** ficam no repositório de quem os criou. No repositório público entram só temas genéricos.

---

### Do material de apoio ao documento

O fluxo proposto para uma iniciativa:

1. A pessoa junta o material de apoio na pasta `apoio/` do projeto: textos, anotações, transcrições, prints e imagens.
2. Escolhe o roteiro, que traz as perguntas.
3. O conteúdo do material, **inclusive o das imagens**, é lido e transformado em texto nas respostas às perguntas do roteiro, **marcando com (?) o que ainda não se sabe**.
4. Gera as saídas e revisa. O documento volta a ser editado a cada nova informação.

#### Imagens são insumo, não conteúdo

Decisão: as imagens de apoio (prints de quadros, fotos de anotações, esquemas) servem de **entrada** para escrever o documento, e tudo vira texto. O documento gerado não leva imagens no corpo; a imagem original fica em `apoio/` e é referenciada em "Documentos de Apoio". Por isso o compilador não precisa tratar imagens.

---

### Onboarding

O público são **pessoas não técnicas**. Por isso o onboarding não pode depender de a pessoa usar linha de comando: ela conversa com um assistente de IA, que segue um passo a passo no `AGENTS.md`, usa o roteiro para entrevistar, cria os arquivos e roda os comandos. O README traz o mesmo caminho em passos manuais, como garantia mínima.

Os passos:

1. Verificar se o computador tem o necessário (Node.js e um navegador Chrome, Chromium ou Edge) e orientar a instalação, se faltar.
2. Ler o `AGENTS-extra.md` e, no primeiro projeto, oferecer criá-lo a partir do modelo.
3. Escolher o roteiro, com recomendação conforme o que a pessoa quer fazer.
4. Perguntar se o resultado será **lido** (documento) ou **apresentado** (slides), ou os dois.
5. Escolher o tema: o genérico, que é o padrão quando a pessoa não indica outro, ou o próprio.
6. Informar quem é a pessoa responsável pelo projeto.
7. Criar a pasta do projeto, o `projeto.json` e o documento principal.
8. Ler o material de apoio, entrevistar com o roteiro, escrever o primeiro rascunho e marcar com (?) o que faltar.
9. Sugerir o resumo (TL;DR) e, se fizer sentido, a apresentação.
10. Gerar as saídas e conferir o resultado.

#### Informações que o onboarding precisa coletar

| Informação | Para quê | Situação |
| :--- | :--- | :--- |
| Nome do projeto (vira o nome da pasta e do arquivo) | Criar `projetos/<projeto>/<projeto>.md` | Proposta |
| Roteiro | Definir as seções e as perguntas | Proposta |
| Tipo de saída (documento, apresentação ou os dois) | Montar as saídas no `projeto.json` | Proposta |
| Tema | Identidade visual das saídas | Proposta |
| Pessoa responsável (nome e sobrenome) | Preencher a tabela RCI | Proposta |
| Período de acompanhamento e data limite | Cabeçalho do documento | Proposta |
| Material de apoio existente (textos e imagens) | Alimentar o primeiro rascunho; tudo vira texto | Proposta |
| Projeto Jira ou repositório GitHub relacionado, se houver | Registrar a chave ou o link nas atividades | A definir |
| Se o projeto é um software e precisa de protótipo ou código | Registrar artefatos persistentes | Proposta |

#### Formas de entregar o onboarding

| Opção | Vantagens | Desvantagens | Posição atual |
| :--- | :--- | :--- | :--- |
| **Seção "Primeiros passos" no README** | Simples e sempre atualizada | A pessoa executa tudo sozinha | Escolhida (mínimo garantido) |
| **Passo a passo para um assistente de IA conduzir** (no AGENTS.md) | A pessoa conversa e recebe os arquivos criados | Depende de a pessoa usar uma ferramenta que leia o `AGENTS.md` | Escolhida (caminho principal) |
| **Script de linha de comando** | Repetível e independente de IA | Mais código para manter e pouco amigável a pessoas não técnicas | Fora do escopo inicial |

---

### Roteiros

O roteiro de iniciativa é o primeiro. Outros já existem, e a estrutura permite que qualquer pessoa crie os seus.

| Roteiro | Para que serve | Arquivo |
| :--- | :--- | :--- |
| **Iniciativa** | Documentar uma iniciativa, um projeto ou uma decisão | `roteiros/iniciativa.txt` |
| **Business Model Canvas** | Modelar uma ideia de negócio, com as 9 perguntas do canvas (segmento de clientes, valor, canais, retenção, entrada de valores, custos, atividades, recursos e alianças) | `roteiros/businessmodelcanvas.txt` |
| **10-20-30** | Apresentar uma ideia ou negócio em 10 slides, até 20 minutos, com fonte mínima 30; cada seção é um slide | `roteiros/10-20-30.txt` |
| **PDI** | Montar um plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida; cada objetivo é uma seção com finalidade, estratégias, arquiteturas de aprendizagem, data limite, contexto e atividades | `roteiros/pdi.txt` |
| **Pitch** | Propor uma ideia no formato de pitch do Shape Up, que precede qualquer especificação detalhada | `roteiros/pitch.txt` (com o guia `guias/pitch.md`) |
| **Resumo (TL;DR)** | Resumir um documento em uma página ou em poucos slides | `roteiros/tldr.txt` |

Para uma ideia de negócio nova, o caminho natural é o Business Model Canvas primeiro e o 10-20-30 depois, para apresentar o que o canvas organizou. Cada arquivo indica de onde as perguntas e seções foram retiradas.

Um roteiro é um arquivo de texto com a lista de seções e, para cada uma, a **pergunta** que ela responde e as **indicações** de como escrever. Para criar um novo:

1. Liste as seções na ordem em que devem aparecer.
2. Escreva, para cada seção, a pergunta central e uma ou duas indicações.
3. Salve como `roteiros/<nome>.txt` e **indique no fim de onde as perguntas foram retiradas**.
4. Registre o novo roteiro no onboarding e no `AGENTS.md`.

Cada documento declara o roteiro que segue na linha **Roteiro:** do topo (este documento usa `iniciativa`). Com os roteiros que não são o de iniciativa, as seções do documento são as do arquivo do roteiro, na mesma ordem.

---

### Divulgação

O repositório será publicado como **template do GitHub**, para que as pessoas criem o próprio repositório a partir dele, e não um fork.

| Item | Decisão |
| :--- | :--- |
| **Licença dos documentos e roteiros** | Creative Commons Atribuição 4.0 (CC BY 4.0): pode usar, copiar e derivar, desde que dê crédito à origem |
| **Licença das ferramentas (`tools/`)** | MIT, por ser código |
| **Isenção de responsabilidade** | Aviso no README de que o conteúdo é oferecido como está, sem garantias |
| **Tema distribuído** | O genérico, como padrão quando a pessoa não indica o seu, e o da Wildtech, apenas como exemplo de uso de um tema com marca |
| **Marca da Wildtech** | Nome, logo e endereço da Wildtech não são cobertos pela licença; aparecem só como exemplo de uso |
| **Contribuições** | Aceitas (roteiros, temas genéricos, ferramentas e textos), por issue ou pull request; regras na seção "Como contribuir" do README, com a exigência de indicar a fonte de cada roteiro novo |
| **Origem e derivados** | O repositório `ideia` é a origem da base (ferramentas, roteiros, temas genéricos e regras); repositórios com assuntos específicos nascem de um fork dele |
| **Idioma** | Português do Brasil |
| **Local de publicação** | GitHub: [wildtech/ideia](https://github.com/wildtech/ideia) |

#### Como chegamos nesta decisão

- **Licença:** a primeira ideia foi uma licença Creative Commons, para permitir uso e derivação com crédito. Como o repositório mistura conteúdo e código, a recomendação, aceita, foi usar licença dupla: CC BY 4.0 para o conteúdo e MIT para as ferramentas.
- **Vocabulário:** a palavra "template" valia para duas coisas diferentes, o roteiro de perguntas e a aparência. Passaram a se chamar **roteiro** (o conjunto de perguntas que o analista usa para entrevistar) e **tema** (o visual). A **saída** é o que se gera, e o **artefato** é a saída persistente.
- **Documento e apresentação:** a escolha é da saída, não do tema. O tema serve às duas; o roteiro sugere qual faz mais sentido (iniciativa e PDI são documentos; 10-20-30 e pitch, apresentações).
- **Resumo (TL;DR):** o padrão já usado nos documentos, uma citação no topo, virou regra, e a apresentação é escrita a partir dele.
- **Tema genérico:** parte do tema da Wildtech com outro logo (um emoji 💡) e um rodapé neutro. Adaptá-los exigiu tornar os compiladores configuráveis, o que também os deixa prontos para outras marcas.
- **Tema simples (cores e logo):** a pessoa que quer a sua marca não deveria precisar montar um `.docx`. Por isso existe o tema `neutro`, com a base dos documentos, e os temas simples herdam dele e declaram só cores, logo, fonte e rodapé.
- **Temas a partir de arquivos:** o `.docx` é a base dos documentos, e o `.pptx` serve de referência para os slides em reveal.js, que não consome um PowerPoint como molde. Saída em `.pptx` a partir de um modelo fica para uma segunda rodada.
- **Base e complemento:** a pessoa que usa o template tem coisas que não são da base (Jira, temas próprios, fluxo de Git). Em vez de editar o `AGENTS.md`, que precisa poder ser atualizado, criou-se o `AGENTS-extra.md`, que o assistente lê junto e que prevalece quando é mais específico. O modelo `AGENTS-extra.example.md` documenta a convenção, e o primeiro projeto já oferece criar o arquivo.
- **Protótipo como saída persistente:** um protótipo gerado a partir de um documento de especificação é versionado e passa a evoluir sozinho. Por isso existe o conceito de artefato, com a origem registrada.

---

### Pontos em aberto

> **Ainda em aberto:**
> - **Roteiros depois dos primeiros**, e em que ordem.
> - **Retorno do primeiro teste:** o que medir e como registrar, inclusive se as perguntas dos roteiros funcionam para quem não é técnico.
> - **Saída em PowerPoint:** as pessoas vão precisar editar os slides depois de gerados? **(?)**
> - **Imagens em slides:** a regra de imagens como insumo vale também para apresentações? **(?)**
>
> **Já decidido:** público (pessoas não técnicas), formato do onboarding, tratamento de imagens em documentos (insumo que vira texto), local de publicação, licença, vocabulário (roteiro, tema, saída, artefato), como declarar o roteiro, resumo (TL;DR) em todos os projetos e contribuições (aceitas).

---

### Documentos de Apoio

- [Repositório wildtech/ideia](https://github.com/wildtech/ideia): onde a estrutura é publicada.
- `AGENTS.md`: regras de uso, passo a passo de onboarding, formato do Markdown e opções de tema do repositório.
- `AGENTS-extra.example.md`: modelo do arquivo complementar de quem usa o template.
- `roteiros/iniciativa.txt`: perguntas e seções da iniciativa. Origem do modelo: [Escreva, escreva e escreva](https://blog.danielwildt.com/2020/12/23/escreva-escreva-e-escreva/).
- `roteiros/pdi.txt`: plano de desenvolvimento individual, a partir do modelo de PDI do Daniel Wildt, com o olhar da aprendizagem autodirigida.
- `roteiros/businessmodelcanvas.txt` e `roteiros/10-20-30.txt`: para modelar e apresentar uma ideia de negócio. Origem: [Perguntas para um modelo de negócios?](https://blog.danielwildt.com/2016/05/05/perguntas-para-um-modelo-de-negocios/).
- `roteiros/pitch.txt` e `guias/pitch.md`: roteiro e guia de pitch, a partir do formato do Shape Up (Basecamp).
- `roteiros/tldr.txt`: roteiro do resumo.
- `temas/generico/`: tema padrão. `temas/neutro/`: base dos temas simples. `temas/exemplo-leve/`: exemplo de tema simples. `temas/wildtech/`: exemplo de tema com marca.
- Documento do onboarding: A definir. Quando existir, será um documento próprio, linkado aqui.
