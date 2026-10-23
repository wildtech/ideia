# ideia

Ajudante para organizar ideias e iniciativas em documentos e apresentações. Feito para você usar com o seu agente de IA preferido (Claude Code, Kiro, Codex ou outro que leia o `AGENTS.md`), mesmo sem experiência técnica.

Você reúne textos e imagens de apoio, escolhe um **roteiro** (um conjunto de perguntas com indicações) e o agente **entrevista você** para modelar a iniciativa. O documento vai sendo escrito e mantido em Markdown, e dele saem automaticamente um `.docx`, um `.html` e um `.pdf`, além de uma **apresentação** (html com reveal.js e pdf), com a sua identidade visual (o **tema**).

## Como usar

Escolha **uma** das duas formas de ter os arquivos:

- **Baixar os arquivos (o jeito mais simples, sem GitHub):** [baixe o ZIP](https://github.com/wildtech/ideia/archive/refs/heads/main.zip), descompacte e coloque a pasta onde você guarda os seus projetos (por exemplo, em Documentos). Você pode trocar o nome da pasta (`ideia-main`) por um que faça sentido para você.
- **Criar um repositório a partir do template (para quem usa GitHub):** clique em **Use this template** no GitHub. Você ganha o seu próprio repositório, com histórico, e pode guardar e compartilhar os seus projetos.

Depois, abra a pasta no seu agente de IA e diga algo como: **"Quero começar um projeto."** O agente segue o passo a passo de onboarding do `AGENTS.md`: confere o que o computador precisa, faz as perguntas, cria os arquivos e gera os documentos. Você não precisa abrir um terminal.

### Atualizar depois

Quando o template ganhar melhorias, baixe o ZIP de novo e copie por cima **só os arquivos da base** (`AGENTS.md`, `README.md`, `LICENSE`, `roteiros/`, `guias/`, `tools/` e os temas `generico`, `neutro`, `wildtech`, `exemplo-leve` e `exemplo-cc`). **Não substitua** a sua pasta `projetos/`, o seu `AGENTS-extra.md` nem os temas que você criou: eles são seus. Se você usa GitHub, o agente pode comparar as versões e fazer isso com você.

### Sem agente de IA: passos manuais

Pré-requisitos: [Node.js](https://nodejs.org/) (versão LTS) e um navegador Chrome, Chromium ou Edge (usado para gerar o PDF).

```bash
cd tools && npm install
cd ..
node tools/build.js projetos/exemplo-ideia
```

Os arquivos saem em `projetos/exemplo-ideia/out/`. Para criar o seu projeto:

1. Crie a pasta `projetos/<seu-projeto>/`.
2. Crie nela um `projeto.json` (copie o de `projetos/exemplo-cc/` e ajuste o nome, o tema e as saídas; o tema padrão é o `generico`).
3. Crie `projetos/<seu-projeto>/<seu-projeto>.md` seguindo um roteiro, como `roteiros/iniciativa.txt` (o `projetos/exemplo-ideia/exemplo-ideia.md` mostra como fica).
4. Rode `node tools/build.js projetos/<seu-projeto>`.

Se o Chrome não for encontrado, defina a variável `CHROME` com o caminho do executável.

## Os conceitos

| Conceito | O que é | Onde fica |
| :--- | :--- | :--- |
| **Roteiro** | Conjunto de perguntas e indicações que guia a escrita e a entrevista | `roteiros/` |
| **Guia** | Texto de apoio sobre como fazer bem uma coisa | `guias/` |
| **Tema** | Identidade visual: logo, cores, fontes e rodapé | `temas/` |
| **Projeto** | Um assunto, com o documento principal e o material de apoio | `projetos/` |
| **Saída** | O que é gerado de um documento: documento (docx, html, pdf) ou apresentação (html, pdf) | `projeto.json` e `out/` |
| **Artefato** | Saída persistente derivada de um documento, como um protótipo | pastas do projeto |

## O que vem aqui

| Arquivo | Para que serve |
| :--- | :--- |
| `AGENTS.md` | Instruções para o agente de IA: onboarding, regras, formato do Markdown, temas e geração |
| `AGENTS-extra.example.md` | Modelo do arquivo complementar com o que é específico de você ou da sua organização |
| `roteiros/` | Roteiros: iniciativa, Business Model Canvas, 10-20-30, PDI, pitch e resumo (TL;DR) |
| `guias/` | Guias de apoio: como escrever um pitch e como escrever slides (dois estilos, imagens e cores sugeridas; o estilo Presentation Zen e método Lessig tem guia próprio) |
| `temas/generico/` | Tema padrão (logo, fontes, cabeçalho e rodapé de exemplo) |
| `temas/neutro/` e `temas/exemplo-leve/` | A base dos temas simples e um exemplo genérico de tema só com cores e logo |
| `temas/exemplo-cc/` | Tema simples do projeto `exemplo-cc`, com o logo e as cores da Creative Commons (só como ilustração) |
| `temas/wildtech/` | Exemplo de um tema com marca (a da Wildtech) |
| `tools/` | Compiladores de Markdown para docx, html, pdf e apresentações |
| `projetos/exemplo-ideia/` | Projeto de exemplo: este template descrito com o próprio template, no tema da Wildtech |
| `projetos/exemplo-cc/` | Segundo exemplo, com o tema simples: a escolha da licença Creative Commons dos documentos (documento e apresentação) |

## O que é seu: `AGENTS-extra.md`

O `AGENTS.md` é a base do template e **não deve ser editado** com o que é específico de você. Isso vai em um arquivo complementar, o `AGENTS-extra.md`: a URL do seu Jira, os temas da sua organização, o seu fluxo de Git, o seu glossário. O agente o lê no início de toda sessão e, no seu primeiro projeto, oferece criá-lo a partir do `AGENTS-extra.example.md`. Assim você pode trazer as melhorias do template sem perder o que é seu. Não coloque senhas nem chaves nele.

## Sua identidade visual

O tema padrão é o genérico (`temas/generico/`). O da Wildtech está aqui só como exemplo de uso de um tema com marca; a marca, o logo e o endereço da Wildtech são da Wildtech. Para usar a sua marca, o jeito mais simples é um **tema só com cores e logo**: crie uma pasta em `temas/` com o arquivo do seu logo (png ou jpg) e um `tema.json` que herda do tema `neutro` e declara as suas cores (veja `temas/exemplo-leve/`), e escolha o tema no `projeto.json`. Não precisa montar um `.docx`. Se a sua marca tem arte própria, um tema completo pode ter um `.docx` de base, e uma apresentação em PowerPoint serve de referência para o visual dos slides. O `AGENTS.md` explica as opções, e o agente pode fazer isso com você.

## Roteiros

Os roteiros são arquivos de texto (`roteiros/<nome>.txt`) com as seções, uma pergunta e indicações para cada uma, e a indicação da fonte de onde vieram. Já vêm: **iniciativa**, **Business Model Canvas** (modelar uma ideia de negócio), **10-20-30** (apresentar uma ideia), **PDI** (plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida), **pitch** (formato Shape Up) e **resumo (TL;DR)**. Você pode criar os seus.

## Como contribuir

Contribuições são bem-vindas: novos **roteiros**, melhorias nos **temas genéricos**, correções e melhorias nas **ferramentas**, e ajustes de texto. Abra uma *issue* para conversar sobre a ideia ou envie direto um *pull request*.

- **Novo roteiro:** crie `roteiros/<nome>.txt` no mesmo formato dos existentes (uma seção por linha, com a pergunta e as indicações). **Indique no fim do arquivo de onde as perguntas e seções foram retiradas** (um texto, um livro, um modelo), com o link quando existir. Registre o roteiro nas tabelas do `README.md` e do `AGENTS.md`. O `AGENTS.md` ("Criando um novo roteiro") explica o passo a passo.
- **Tema:** envie um tema **genérico**, sem marca, logo ou endereço de terceiros. Temas com marca ficam nos repositórios de quem os criou.
- **Ferramentas (`tools/`):** rode `cd tools && npm install` e `node tools/build.js projetos/exemplo-ideia`, e confira o resultado (documento e apresentação) antes de enviar. Mudanças nas ferramentas não devem alterar o resultado dos projetos que já existem.
- **Não envie** projetos pessoais, dados pessoais ou de terceiros, nem conteúdo que você não tenha direito de compartilhar. Os projetos de cada pessoa ficam no repositório dela; aqui entra só a base.
- **Licença:** ao contribuir, você concorda que o seu trabalho seja licenciado como o restante do repositório (CC BY 4.0 para documentos, roteiros e temas, MIT para `tools/`), com crédito a você quando fizer sentido.

Para tudo isso, o seu agente de IA pode ajudar: peça para ele ler o `AGENTS.md`, criar o roteiro ou o ajuste, e preparar o *pull request* (se você usa o GitHub, com a CLI `gh`).

## Evoluir a partir deste repositório

Este repositório é a **origem** da estrutura (`tools/`, roteiros, temas genéricos e regras). Para criar um repositório seu com assuntos específicos, use **Use this template** (ou faça um fork), coloque os seus projetos e o seu `AGENTS-extra.md` e, quando quiser, traga as melhorias da origem de volta. A licença abaixo cobre só os arquivos da base: **os seus projetos e o seu `AGENTS-extra.md` são seus**.

## Licença e crédito

- Documentos, roteiros e temas: [Creative Commons Atribuição 4.0 (CC BY 4.0)](LICENSE). Você pode usar, copiar e criar derivados, inclusive para fins comerciais.
- Ferramentas em `tools/`: [MIT](tools/LICENSE).
- **A marca, o logo e o endereço da Wildtech não estão incluídos na licença.** Eles aparecem nos temas apenas como exemplo de uso; troque pelos da sua marca nos seus derivados. O mesmo vale para o logo da Creative Commons, usado no tema `exemplo-cc` e no projeto `exemplo-cc` só como ilustração, sem vínculo nem endosso: o nome e o logo da Creative Commons são marcas dela, e quem os usar deve seguir a política de uso.
- **Dê o crédito à origem.** Se você usar ou adaptar este template, mantenha uma indicação de que ele começou em [wildtech/ideia](https://github.com/wildtech/ideia), de Daniel Wildt (Wildtech).
- Tudo é oferecido **como está, sem garantias de qualquer tipo**. Quem usa é responsável pelo uso e pelos documentos que produzir.
