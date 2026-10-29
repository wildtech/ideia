# Issues: como documentar o que estamos fazendo

Uma issue é o registro de **por que** e **como** algo foi decidido, e também o item do roadmap. O documento do projeto (o `.md`) continua sendo a fonte da verdade sobre o conteúdo; a issue guarda a conversa, as escolhas e o que "pronto" significa.

## Quando é do `ideia` e quando é do repositório de quem usa

| A mudança mexe em… | Vai para |
| :--- | :--- |
| Algo `[base]`: `tools/`, `roteiros/`, `guias/`, `AGENTS.md`, temas genéricos, exemplos, os templates de issue | **`ideia`** (o repositório base) |
| Um projeto, um tema com marca, o `AGENTS-extra.md` ou um protótipo de quem usa | **o repositório de quem usa** |
| Algo que nasceu em um projeto e serviria a todos | Abra a issue no repositório de quem usa **e ligue** a uma issue no `ideia`; feche a primeira quando a base for atualizada |

Regra prática: se a mudança caberia no repositório de outra pessoa que usa o template, é do `ideia`. Nada de dentro de uma organização vai para uma issue do `ideia`, que é público.

## Os quatro templates

Toda issue começa pelo **Resumo (TL;DR)**: qual é o problema, para quem, e o que significa a coisa estar pronta (ver `roteiros/tldr.txt`). O que é dúvida fica com **(?)**.

| Template | Quando usar | O que tem de particular |
| :--- | :--- | :--- |
| **Novo projeto** | Uma ideia de projeto, para documentar as escolhas e entrar no roadmap | Roteiro, tema, saídas, escolhas e alternativas descartadas, pessoas (RCI) e apetite |
| **Mudança em software** | Uma mudança em um protótipo ou software | A estrutura do **pitch**, com apetite em horas ou poucos dias, solução em atos e critérios de aceite |
| **Ajuste ou correção** | Um defeito ou um padrão a mudar | Estado atual, estado desejado e, para defeito, passos para reproduzir |
| **Melhoria do template** | Uma mudança na base (só no `ideia`) | O que será mexido, origem sem dado interno e impacto em quem já usa |

### Mudança em software: o pitch em pequeno

Usa os termos do Shape Up, com o nome em português e o original entre parênteses: **Problema** (problem), **Apetite** (appetite), **Solução** (solution), **Armadilhas** (rabbit holes) e **Fora de escopo** (no-gos).

- **Apetite em horas ou poucos dias.** Se não cabe, a mudança é grande demais: vira um projeto, e o pitch completo (`roteiros/pitch.txt`) é o caminho.
- **A solução em atos ajuda nos critérios de aceite.** Cada ato (entrada, o que acontece, resultado) costuma render um ou dois critérios.
- **Critérios de aceite** são verificáveis e viram teste. Formato: *dado… quando… então…*, com o tipo de teste entre colchetes (unitário, API ou jornada do Playwright).

### Ajuste ou correção: estado atual e estado desejado

Serve tanto para um defeito quanto para uma mudança de padrão. Para um **defeito**, os **passos para reproduzir** são o centro:

- Parta de um estado conhecido (por exemplo, "banco de exemplo recém-reiniciado").
- Escreva um passo por linha, com o comando exato, a versão do Node e o sistema operacional.
- Diga o que era **esperado** e o que foi **obtido**.
- Se não acontece sempre, diga com que frequência e o que já foi tentado.
- Sem dado pessoal e sem segredo na mensagem de erro: cole só o necessário.

Um bom defeito termina em um teste que falhava e passa a passar. Se o ajuste crescer além de horas ou poucos dias, ele sobe para "Mudança em software" ou "Novo projeto".

## O roadmap (GitHub Projects)

O repositório de quem usa mantém um **GitHub Project** com o campo de status:

| Status | Significa |
| :--- | :--- |
| **Ideia** | A issue foi aberta. Quem tem acesso de escrita ao repositório pode abrir; toda issue nova entra aqui |
| **Pitch** | Está sendo escrita e validada: o problema vale a pena, a solução é viável e cabe no apetite |
| **Andamento** | Está sendo feita |
| **Finalizado** | O trabalho terminou. Não quer dizer entregue em produção; "entregue" é outra pergunta, e pode ser registrada na própria issue |

Uma ideia que não vai adiante é fechada como "não planejada", com o motivo escrito: o histórico vale tanto quanto o resultado.

Para o Project incluir as issues novas sozinho, ligue o fluxo "Auto-add to project" nas configurações do Project, e o fluxo "Item added to project" com o status **Ideia**. Isso é feito uma vez, na interface do GitHub.

## Onde se controlam as tarefas

Por padrão, no **GitHub** do repositório de quem usa. Um projeto pode controlar tarefas em outro lugar (por exemplo, o Jira). **Quando for pedir a criação de uma tarefa em um projeto, o assistente pergunta onde ele controla**, antes de criar, e confirma o rascunho antes de escrever (ver "Integrações opcionais" no `AGENTS.md`).

## Para quem usa o template

Copie `.github/ISSUE_TEMPLATE/` para o seu repositório. Os templates novos chegam com as atualizações do template; os seus ajustes ficam em arquivos próprios, sem mexer nos originais. Remova `melhoria-template.yml` do seu repositório (ele é do `ideia`) e, no `config.yml`, aponte para o `ideia` quem tem uma melhoria para o template:

```yaml
blank_issues_enabled: false
contact_links:
  - name: Melhoria do template (repositório base)
    url: https://github.com/wildtech/ideia/issues/new/choose
    about: Para roteiros, guias, ferramentas e temas genéricos
```
