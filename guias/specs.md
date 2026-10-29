# Specs: as funcionalidades de um projeto, só com git

Quando quem usa o template não tem GitHub nem Jira (ou o projeto não os usa), as funcionalidades, os ajustes e os defeitos ficam em uma pasta do próprio projeto: `projetos/<projeto>/specs/`. Cada **spec** é um arquivo Markdown, e o git guarda a história. É o mesmo padrão das issues (`guias/issues.md`), sem sair do repositório.

## Onde registrar: o campo `tarefas`

O `projeto.json` diz onde o projeto controla as tarefas:

```json
{ "tarefas": "git" }
```

Os valores são `git` (specs em `specs/`), `github` (issues) e `jira`. O comando `node tools/novo.js spec` já marca `"git"`. Quando alguém pede uma tarefa em um projeto, o assistente lê esse campo; se ele não existir, pergunta.

## Uma spec por arquivo

`specs/NNN-nome.md`: o número dá uma ordem estável e serve de referência ("spec 003"). Para criar uma, com o próximo número:

```bash
node tools/novo.js spec projetos/meu-projeto nova-tarefa --tipo mudança --titulo "Adicionar uma tarefa"
```

O roteiro está em `roteiros/spec.txt`. O cabeçalho tem duas linhas que a ferramenta lê:

- **Tipo:** `mudança`, `defeito` ou `ajuste`. Um ajuste ou um defeito entra como uma **nova spec**, não como um campo de outra.
- **Status:** `Ideia`, `Pitch`, `Andamento` ou `Finalizado`.

| Tipo | Seções |
| :--- | :--- |
| mudança | Problema (problem), Apetite (appetite, em horas ou poucos dias), Solução (solution) em atos, Armadilhas (rabbit holes), Fora de escopo (no-gos) e Critérios de aceite |
| defeito | Onde acontece, Estado atual, Estado desejado, Passos para reproduzir e Critérios de aceite |
| ajuste | Onde acontece, Estado atual, Estado desejado e Critérios de aceite |

Toda spec começa pelo Resumo (TL;DR) em citação. Os critérios de aceite são uma lista de verificação (`- [ ]`), no formato *dado… quando… então…*, e cada um vira um teste.

## O que cada status quer dizer

| Status | Significa |
| :--- | :--- |
| **Ideia** | A spec foi escrita. Pode ter partes ainda como A definir |
| **Pitch** | O problema e a solução estão sendo validados: vale a pena, é viável e cabe no apetite |
| **Andamento** | Está sendo feita |
| **Finalizado** | O trabalho terminou e todos os critérios de aceite estão marcados. Não quer dizer entregue em produção |

Mudar de status é editar a linha **Status:** e fazer um commit (por exemplo, `spec 003: Andamento`). Uma ideia que não vai adiante pode ficar em Ideia com a explicação escrita na própria spec, ou ser apagada com o motivo na mensagem do commit.

## Conferir, indexar e ver o relatório

```bash
node tools/specs.js projetos/meu-projeto
```

(O `node tools/build.js projetos/meu-projeto` também roda isto quando existe uma pasta `specs/`.)

1. **Confere** cada spec. **FALHA** (termina com erro): tipo ou status inválido, número repetido. **AVISO**: seção do roteiro faltando, falta o resumo, spec sem critérios, Finalizado com critério sem marcar, Ideia ou Pitch com critério já marcado, e apetite de mudança que passa de poucos dias (vira um projeto).
2. **Gera o índice** `specs/README.md` (tabela e contagem por status). Ele é versionado, **não se edita à mão**, e `--conferir` falha se estiver desatualizado, para uma conferência automática (por exemplo, antes de um commit).
3. **Gera o relatório** `out/specs-relatorio.html`, com o fluxo acumulado e as métricas.

## O relatório: fluxo acumulado (cumulative flow diagram)

O diagrama empilha, ao longo do tempo, quantas specs estão em cada status: **Finalizado** embaixo, depois **Andamento**, **Pitch** e **Ideia** no alto. A altura total é quantas specs existem.

Como ler:

- A faixa de **Finalizado** deve subir com o tempo. Se ela fica parada, nada está terminando.
- Uma faixa de **Andamento** que engorda mostra trabalho em andamento demais: está se começando mais do que se termina. O fluxo saudável tem essa faixa estreita e constante.
- Uma faixa de **Ideia** que só cresce é um estoque de coisas anotadas e não tratadas; vale podar.
- A distância horizontal entre o início de uma faixa e o seu fim aproxima o **tempo** que uma spec leva naquele status.

Junto do diagrama vêm os totais por status, o **tempo médio até Finalizado** (da primeira vez que a spec aparece até a primeira vez em que foi Finalizada), as **finalizadas nos últimos 30 dias** e uma tabela com os dados do diagrama, para quem não vê o gráfico.

### De onde vêm as datas

Do **git**: cada commit que muda a linha **Status:** de uma spec é a data em que ela passou àquele status. Disso decorre:

- **Um commit por mudança de status** dá o diagrama mais fiel. Várias mudanças no mesmo dia viram um ponto só.
- A data é a do commit. Reescrever o histórico (rebase, squash) muda o relatório.
- Uma spec apagada some do diagrama, porque o relatório parte das specs que existem hoje.
- Com poucos commits, o diagrama é curto, e o relatório avisa. Ele melhora com o uso.
- Sem git, o relatório mostra só o estado de hoje.

## Quando usar issues e quando usar specs

| Situação | Use |
| :--- | :--- |
| O projeto (ou o cliente) usa GitHub | Issues e o GitHub Project (`guias/issues.md`) |
| Só git, sem ferramenta de tarefas | **Specs** |
| Os dois | O que o projeto declarar em `"tarefas"`; não duplique |

A spec e a issue têm o mesmo conteúdo (o pitch em pequeno e os critérios de aceite), então dá para migrar de uma para a outra.
