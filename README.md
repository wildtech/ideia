# ideia

Ajudante para organizar ideias e iniciativas em documentos. Feito para você usar com o seu agente de IA preferido (Claude Code, Kiro, Codex ou outro que leia o `AGENTS.md`), mesmo sem experiência técnica.

Você reúne textos e imagens de apoio, escolhe um **template** (um roteiro de seções com perguntas e indicações), e o documento da sua iniciativa vai sendo escrito e mantido em Markdown. A partir dele, saem automaticamente um `.docx`, um `.html` e um `.pdf` com a sua identidade visual.

## Como usar

1. Clique em **Use this template** no GitHub para criar o seu repositório a partir deste (ou baixe o conteúdo).
2. Abra a pasta no seu agente de IA e diga algo como: **"Quero começar um projeto."** O agente segue o roteiro de onboarding do `AGENTS.md`: faz as perguntas, cria os arquivos e gera os documentos.

### Sem agente de IA: passos manuais

Pré-requisitos: [Node.js](https://nodejs.org/) (versão LTS) e um navegador Chrome, Chromium ou Edge (usado para gerar o PDF).

```bash
cd tools && npm install
cd ..
node tools/build.js projetos/exemplo
```

Os arquivos saem em `projetos/exemplo/out/`. Para criar o seu projeto:

1. Crie a pasta `projetos/<seu-projeto>/`.
2. Copie `projetos/exemplo/theme.json` para ela.
3. Crie `projetos/<seu-projeto>/<seu-projeto>.md` seguindo um template de conteúdo, como o `template-iniciativa.txt` (o `projetos/exemplo/exemplo.md` mostra como fica).
4. Rode `node tools/build.js projetos/<seu-projeto>`.

Se o Chrome não for encontrado, defina a variável `CHROME` com o caminho do executável.

## O que vem aqui

| Arquivo | Para que serve |
| :--- | :--- |
| `AGENTS.md` | Instruções para o agente de IA: onboarding, regras do documento e do Markdown, tema |
| `template-iniciativa.txt` | Template de conteúdo: seções, perguntas e indicações de uma iniciativa |
| `template-businessmodelcanvas.txt` | Template de conteúdo: modelar uma ideia de negócio (Business Model Canvas) |
| `template-10-20-30.txt` | Template de conteúdo: roteiro de apresentação em 10 slides, 20 minutos, fonte 30 (Guy Kawasaki) |
| `template-pitch.txt` | Template de conteúdo: pitch no formato Shape Up (Basecamp), com problema, apetite, solução, armadilhas e fora de escopo |
| `guia-pitch.md` | Guia detalhado de como escrever um pitch (cinco seções e checklist), apoio do `template-pitch.txt` |
| `template-pdi.txt` | Template de conteúdo: plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida |
| `template-generico-projeto-doc.docx` e `.pdf` | Template visual **padrão** (logo, fontes, cabeçalho e rodapé) e a referência de como deve ficar |
| `template-wildtech-projeto-doc.docx` e `.pdf` | Exemplo de um template visual com marca (a da Wildtech) |
| `tools/` | Compiladores de Markdown para docx, html e pdf |
| `projetos/exemplo/` | Projeto de exemplo: este repositório descrito com o próprio template |

## Sua identidade visual

O template visual padrão é o genérico (`template-generico-projeto-doc`). O da Wildtech está aqui só como exemplo de uso de um template com marca; a marca, o logo e o endereço da Wildtech são da Wildtech. Para usar a sua marca, crie um `.docx` com o seu logo, cabeçalho e rodapé e aponte o `theme.json` do projeto para ele. O `AGENTS.md` explica as opções, e o agente pode fazer isso com você.

## Novos templates

Os templates de conteúdo são arquivos de texto (`template-<nome>.txt`) com as seções, uma pergunta e indicações para cada uma. Já vêm cinco: **iniciativa**, **Business Model Canvas** (para modelar uma ideia de negócio), **10-20-30** (para apresentar uma ideia), **pitch** (validar um problema e uma solução antes das specs, no formato Shape Up) e **PDI** (plano de desenvolvimento individual, com o olhar da aprendizagem autodirigida). Você pode criar os seus.

## Como contribuir

Contribuições são bem-vindas: novos **templates de conteúdo**, melhorias nos **templates visuais**, correções e melhorias nas **ferramentas**, e ajustes de texto. Abra uma *issue* para conversar sobre a ideia ou envie direto um *pull request*.

- **Novo template de conteúdo:** crie `template-<nome>.txt` na raiz, no mesmo formato dos existentes (uma seção por linha, com a pergunta e as indicações). **Indique no fim do arquivo de onde as perguntas e seções foram retiradas** (um texto, um livro, um modelo), com o link quando existir. Registre o template nas tabelas do `README.md` e do `AGENTS.md`. O `AGENTS.md` ("Criando um novo template de conteúdo") explica o passo a passo.
- **Template visual:** envie um template **genérico**, sem marca, logo ou endereço de terceiros. Templates com marca ficam nos repositórios de quem os criou.
- **Ferramentas (`tools/`):** rode `cd tools && npm install` e `node tools/build.js projetos/exemplo`, e confira o resultado nos três formatos (docx, html e pdf) antes de enviar. Mudanças nas ferramentas não devem alterar o resultado dos projetos que já existem.
- **Não envie** projetos pessoais, dados pessoais ou de terceiros, nem conteúdo que você não tenha direito de compartilhar. Os projetos de cada pessoa ficam no repositório dela; aqui entra só a base.
- **Licença:** ao contribuir, você concorda que o seu trabalho seja licenciado como o restante do repositório (CC BY 4.0 para documentos e templates, MIT para `tools/`), com crédito a você quando fizer sentido.

Para tudo isso, o seu agente de IA pode ajudar: peça para ele ler o `AGENTS.md`, criar o template ou o ajuste, e preparar o *pull request* (se você usa o GitHub, com a CLI `gh`).

## Evoluir a partir deste repositório

Este repositório é a **origem** da estrutura (`tools/`, templates e regras). Para criar um repositório seu com assuntos específicos, faça um fork (ou use **Use this template**), mova para ele os seus projetos e, quando quiser, traga as melhorias da origem de volta.

## Licença e crédito

- Documentos e templates: [Creative Commons Atribuição 4.0 (CC BY 4.0)](LICENSE). Você pode usar, copiar e criar derivados, inclusive para fins comerciais.
- Ferramentas em `tools/`: [MIT](tools/LICENSE).
- **A marca, o logo e o endereço da Wildtech não estão incluídos na licença.** Eles aparecem nos templates visuais apenas como exemplo de uso; troque pelos da sua marca nos seus derivados.
- **Dê o crédito à origem.** Se você usar ou adaptar este template, mantenha uma indicação de que ele começou em [wildtech/ideia](https://github.com/wildtech/ideia), de Daniel Wildt (Wildtech).
- Tudo é oferecido **como está, sem garantias de qualquer tipo**. Quem usa é responsável pelo uso e pelos documentos que produzir.
