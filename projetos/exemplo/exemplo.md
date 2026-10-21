# Estrutura de Modelagem de Projetos e Documentos com Templates

**Período de Acompanhamento:** Outubro de 2026 em diante.
**Data Limite:** A definir.
**Template:** iniciativa
**Status do documento:** Rascunho, em construção. Este documento é também o projeto de exemplo da estrutura que ele descreve.

---

### Sobre / Contexto

Quem toca iniciativas costuma ter textos soltos, anotações de reunião, prints e imagens de apoio, mas não tem um lugar único onde isso vira um documento claro, com contexto, responsáveis, objetivo e decisões registradas. Este projeto cria uma **estrutura de modelagem de projetos**: a pessoa reúne textos e imagens de apoio, escolhe um **template de seções com perguntas e indicações**, e o documento da iniciativa vai sendo escrito e mantido a partir dele.

O repositório que guarda essa estrutura ([wildtech/ideia](https://github.com/wildtech/ideia)) também será divulgado como **template**, para que outras pessoas e equipes possam usar, adaptar e criar seus próprios modelos. Este documento é o primeiro exemplo de uso: ele segue o template de iniciativa para descrever o próprio projeto (um "meta projeto").

Este é um documento vivo. Itens marcados com **(?)** são dúvidas ainda por confirmar, e campos sem resposta ficam como "A definir".

> **Definições:**
> - **Iniciativa** é o assunto tratado em um documento: um projeto, uma decisão, um problema a resolver.
> - **Template de conteúdo** é o roteiro de seções, com perguntas e indicações, que guia a escrita (exemplo: `template-iniciativa.txt`).
> - **Template visual** é o arquivo `.docx` (com `.pdf` de referência) que define logo, fontes, cores e rodapé dos documentos gerados.
> - **Documento principal** é o arquivo Markdown do projeto. Ele é a fonte da verdade; `.docx`, `.html` e `.pdf` são gerados a partir dele.

---

### Papéis e Expectativas (RCI)

- **R (Responsável):** A pessoa que executa o trabalho.
- **C (Consultado):** Pessoas que devem ser ouvidas e cuja opinião é necessária (comunicação bidirecional).
- **I (Informado):** Pessoas que devem ser mantidas atualizadas sobre o progresso (comunicação unidirecional).

| Nome/Equipe | Papel Principal | R | C | I |
| :--- | :--- | :--- | :--- | :--- |
| **Daniel Wildt** | Criador e único responsável pela iniciativa: estrutura, templates, ferramentas, testes e divulgação | X | | |

> Por enquanto, apenas Daniel Wildt atua neste projeto. Pessoas consultadas e informadas serão incluídas se isso mudar.

---

### Objetivo / Onde queremos chegar?

Facilitar o desenvolvimento e a documentação de iniciativas, partindo de textos e imagens de apoio e seguindo um template de seções com perguntas e indicações, de modo que qualquer pessoa consiga começar um documento bom sem partir de uma página em branco.

1. Ter um repositório template, pronto para ser usado por outras pessoas, com um projeto de exemplo (este documento).
2. Oferecer um **onboarding** que ajude a pessoa, mesmo sem experiência técnica, a escolher um template, configurar a identidade visual e criar o primeiro projeto.
3. Permitir que as pessoas **criem novos templates** de conteúdo (além do de iniciativa) e novos templates visuais.
4. Divulgar a estrutura com licença que permita uso e derivação, com crédito à origem.

**Indicador de sucesso (proposta):** Uma pessoa não técnica, que nunca viu o repositório, consegue, seguindo o onboarding, gerar o primeiro documento (docx, html e pdf) com o próprio template visual. O primeiro teste será feito por Daniel Wildt no repositório publicado; número de pessoas e prazo a definir. **(?)**

---

### Atividades em andamento

| Atividade | Responsável | Status | Observações |
| :--- | :--- | :--- | :--- |
| Compiladores de Markdown para docx, html e pdf | Daniel Wildt | Concluída (primeira versão) | Funcionam com templates visuais de marcas diferentes (o genérico e o da Wildtech) |
| Template visual genérico como padrão do repositório | Daniel Wildt | Concluída | Parte do template da Wildtech, com outro logo; exigiu as opções de tema descritas no `AGENTS.md` |
| Projeto de exemplo (este documento) | Daniel Wildt | Em andamento | Gerado nos três formatos; ajustes menores no docx ficam para depois |
| Licença do repositório | Daniel Wildt | Decidida | CC BY 4.0 para documentos e templates; MIT para `tools/` |
| Criar o repositório template e copiar os arquivos base | Daniel Wildt | Em andamento | Repositório: [wildtech/ideia](https://github.com/wildtech/ideia) |
| Onboarding guiado (README e roteiro no `AGENTS.md`) | Daniel Wildt | Em andamento | Formato decidido (ver tópico abaixo); falta testar |
| Teste do uso no repositório publicado | Daniel Wildt | A iniciar | Depois da publicação |
| Templates de conteúdo Business Model Canvas, 10-20-30 e PDI | Daniel Wildt | Concluída (primeira versão) | Perguntas e seções tiradas dos textos e modelos de referência (ver Documentos de Apoio); falta testar com uso real |
| Outros templates de conteúdo | Daniel Wildt | A definir | Depois de testar os quatro primeiros |

---

### Como funciona hoje

O repositório separa o que é **base** (o que se replica) do que é **conteúdo** (os projetos).

| Parte | O que é | Onde fica |
| :--- | :--- | :--- |
| **Regras e fluxo** | Orientações de uso, formato do Markdown e comandos | `AGENTS.md` |
| **Template de conteúdo** | Seções, perguntas e indicações de uma iniciativa | `template-iniciativa.txt` |
| **Template visual** | Logo, fontes, cores e rodapé | `template-<marca>-projeto-doc.docx` e `.pdf` |
| **Compiladores** | Markdown para docx, html e pdf | `tools/` |
| **Projetos** | Um documento por pasta, mais material de apoio | `projetos/<projeto>/` |

Cada projeto tem um `theme.json` que aponta para o template visual e ajusta cores, fontes e opções de layout. Para trocar a identidade visual, basta apontar para outro template.

---

### Do material de apoio ao documento

O fluxo proposto para uma iniciativa:

1. A pessoa junta o material de apoio na pasta do projeto: textos, anotações, transcrições, prints e imagens.
2. Escolhe o template de conteúdo, que traz as seções e as perguntas.
3. O conteúdo do material, **inclusive o das imagens**, é lido e transformado em texto nas respostas às perguntas do template, **marcando com (?) o que ainda não se sabe**.
4. Gera o docx, o html e o pdf e revisa. O documento volta a ser editado a cada nova informação.

#### Imagens são insumo, não conteúdo

Decisão: as imagens de apoio (prints de quadros, fotos de anotações, esquemas) servem de **entrada** para escrever o documento, e tudo vira texto. O documento gerado não leva imagens no corpo; a imagem original fica na pasta do projeto e é referenciada em "Documentos de Apoio". Por isso o compilador não precisa tratar imagens.

---

### Onboarding

O público são **pessoas não técnicas**. Por isso o onboarding não pode depender de a pessoa usar linha de comando: ela conversa com um assistente de IA, que segue um roteiro no `AGENTS.md`, faz as perguntas, cria os arquivos e roda os comandos. O README traz o mesmo caminho em passos manuais, como garantia mínima.

Os passos do roteiro:

1. Verificar se o computador tem o necessário (Node.js e um navegador Chrome, Chromium ou Edge) e orientar a instalação, se faltar.
2. Escolher o template de conteúdo (hoje, iniciativa).
3. Escolher o template visual: o genérico, que é o padrão quando a pessoa não indica outro, ou o próprio.
4. Informar quem é a pessoa responsável pelo projeto.
5. Criar a pasta do projeto, o documento principal e o `theme.json`.
6. Ler o material de apoio, escrever o primeiro rascunho e marcar com (?) o que faltar.
7. Gerar os três formatos e conferir o resultado.

#### Informações que o onboarding precisa coletar

| Informação | Para quê | Situação |
| :--- | :--- | :--- |
| Nome do projeto (vira o nome da pasta e do arquivo) | Criar `projetos/<projeto>/<projeto>.md` | Proposta |
| Template de conteúdo | Definir as seções do documento | Proposta |
| Template visual e `theme.json` | Identidade visual dos documentos gerados | Proposta |
| Pessoa responsável (nome e sobrenome) | Preencher a tabela RCI | Proposta |
| Período de acompanhamento e data limite | Cabeçalho do documento | Proposta |
| Material de apoio existente (textos e imagens) | Alimentar o primeiro rascunho; tudo vira texto | Proposta |
| Projeto Jira ou repositório GitHub relacionado, se houver | Registrar a chave ou o link nas atividades | A definir |

#### Formas de entregar o onboarding

| Opção | Vantagens | Desvantagens | Posição atual |
| :--- | :--- | :--- | :--- |
| **Seção "Primeiros passos" no README** | Simples e sempre atualizada | A pessoa executa tudo sozinha | Escolhida (mínimo garantido) |
| **Roteiro para um assistente de IA conduzir** (no AGENTS.md) | A pessoa conversa e recebe os arquivos criados | Depende de a pessoa usar uma ferramenta que leia o `AGENTS.md` | Escolhida (caminho principal) |
| **Script de linha de comando** | Repetível e independente de IA | Mais código para manter e pouco amigável a pessoas não técnicas | Fora do escopo inicial |

---

### Templates

O template de iniciativa é o primeiro. Outros estão previstos, e a estrutura precisa permitir que qualquer pessoa crie os seus.

| Template | Para que serve | Arquivo |
| :--- | :--- | :--- |
| **Iniciativa** | Documentar uma iniciativa, um projeto ou uma decisão | `template-iniciativa.txt` |
| **Business Model Canvas** | Modelar uma ideia de negócio, com as 9 perguntas do canvas (segmento de clientes, valor, canais, retenção, entrada de valores, custos, atividades, recursos e alianças) | `template-businessmodelcanvas.txt` |
| **10-20-30** | Apresentar uma ideia ou negócio em 10 slides, até 20 minutos, com fonte mínima 30; cada seção é um slide | `template-10-20-30.txt` |
| **PDI** | Montar um plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida; cada objetivo é uma seção com finalidade, estratégias, arquiteturas de aprendizagem, data limite, contexto e atividades | `template-pdi.txt` |

Para uma ideia de negócio nova, o caminho natural é o Business Model Canvas primeiro e o 10-20-30 depois, para apresentar o que o canvas organizou. Os quatro vêm de textos e modelos de referência, e cada arquivo indica de onde as perguntas e seções foram retiradas.

Um template de conteúdo é um arquivo de texto com a lista de seções e, para cada uma, a **pergunta** que ela responde e as **indicações** de como escrever. Para criar um novo:

1. Liste as seções na ordem em que devem aparecer.
2. Escreva, para cada seção, a pergunta central e uma ou duas indicações.
3. Salve como `template-<nome>.txt` na raiz do repositório.
4. Registre o novo template no onboarding e no `AGENTS.md`.

Cada documento declara o template que segue na linha **Template:** do topo (este documento usa `iniciativa`). Com o Business Model Canvas e o 10-20-30, as seções do documento são as do arquivo do template, na mesma ordem; as regras de seção do `AGENTS.md` descrevem isso.

---

### Divulgação

O repositório será publicado como **template do GitHub**, para que as pessoas criem o próprio repositório a partir dele, e não um fork.

| Item | Decisão |
| :--- | :--- |
| **Licença dos documentos e templates** | Creative Commons Atribuição 4.0 (CC BY 4.0): pode usar, copiar e derivar, desde que dê crédito à origem |
| **Licença das ferramentas (`tools/`)** | MIT, por ser código |
| **Isenção de responsabilidade** | Aviso no README de que o conteúdo é oferecido como está, sem garantias |
| **Template visual distribuído** | O genérico, como padrão quando a pessoa não indica o seu, e o da Wildtech, apenas como exemplo de uso de um template com marca |
| **Marca da Wildtech** | Nome, logo e endereço da Wildtech não são cobertos pela licença; aparecem só como exemplo de uso |
| **Origem e derivados** | O repositório `ideia` é a origem da base (ferramentas, templates e regras); repositórios com assuntos específicos nascem de um fork dele |
| **Idioma** | Português do Brasil |
| **Local de publicação** | GitHub: [wildtech/ideia](https://github.com/wildtech/ideia) |

#### Como chegamos nesta decisão

- **Licença:** a primeira ideia foi uma licença Creative Commons, para permitir uso e derivação com crédito. Como o repositório mistura conteúdo e código, a recomendação, aceita, foi usar licença dupla: CC BY 4.0 para o conteúdo e MIT para as ferramentas.
- **Template visual:** o padrão é o genérico, que é o da Wildtech com outro logo (um emoji 💡), e o da Wildtech ficou como exemplo de uso. Adaptá-los exigiu tornar os compiladores configuráveis (numeração de seção, recuo, logo no corpo, rodapé), o que também os deixa prontos para outras marcas.
- **Template de conteúdo:** o arquivo foi renomeado para `template-iniciativa.txt`, abrindo espaço para outros modelos. Os de Business Model Canvas, 10-20-30 e PDI seguiram o mesmo formato (uma seção por linha, com a pergunta e as indicações) e os dois primeiros saíram do mesmo texto de referência, que traz as duas abordagens, enquanto o PDI saiu do modelo `template-pdi` do Google Docs.
- **Como declarar o template de cada projeto:** uma linha **Template:** no topo do documento, lida pelo assistente. Sem a linha, vale iniciativa.

---

### Pontos em aberto

> **Ainda em aberto:**
> - **Como receber contribuições:** aceitar templates de outras pessoas ou manter só o conjunto oficial.
> - **Templates depois dos quatro primeiros**, e em que ordem.
> - **Retorno do primeiro teste:** o que medir e como registrar, inclusive se as perguntas dos novos templates funcionam para quem não é técnico.
>
> **Já decidido:** público (pessoas não técnicas), formato do onboarding (README e roteiro no `AGENTS.md`), tratamento de imagens (insumo que vira texto), local de publicação, licença e como declarar o template de cada projeto.

---

### Documentos de Apoio

- [Repositório wildtech/ideia](https://github.com/wildtech/ideia): onde a estrutura é publicada.
- `AGENTS.md`: regras de uso, formato do Markdown e opções de tema do repositório.
- `template-iniciativa.txt`: roteiro de seções, perguntas e indicações da iniciativa. Origem do modelo: [Escreva, escreva e escreva](https://blog.danielwildt.com/2020/12/23/escreva-escreva-e-escreva/).
- `template-pdi.txt`: roteiro de plano de desenvolvimento individual, a partir do modelo `template-pdi` (Google Docs), com o olhar da aprendizagem autodirigida.
- `template-businessmodelcanvas.txt` e `template-10-20-30.txt`: roteiros para modelar e apresentar uma ideia de negócio. Origem: [Perguntas para um modelo de negócios?](https://blog.danielwildt.com/2016/05/05/perguntas-para-um-modelo-de-negocios/).
- `template-generico-projeto-doc.docx` e `template-generico-projeto-doc.pdf`: template visual padrão. `template-wildtech-projeto-doc.*`: exemplo de template com marca.
- Documento do onboarding: A definir. Quando existir, será um documento próprio, linkado aqui.
