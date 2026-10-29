# Limpar as tarefas feitas

**Roteiro:** spec
**Tipo:** mudança
**Status:** Pitch

> **Resumo (TL;DR):** Quem termina muitas tarefas precisa tirá-las da tela de uma vez. O botão "Limpar feitas" remove só o que está em "Feito", depois de confirmar quantas tarefas vão embora. Está pronta quando nada em "A fazer" é removido e o botão fica desligado sem tarefas feitas.

### Problema (problem)

No fim da semana, a coluna "Feito" tem dezenas de linhas, e quem quer a lista limpa precisa tirá-las uma por uma, ou convive com o ruído.

### Apetite (appetite)

Poucas horas.

### Solução (solution)

**Ato 1:** o cabeçalho de "Feito" tem o botão **Limpar feitas**, desligado quando não há nada feito.
**Ato 2:** ao clicar, aparece a confirmação com a quantidade de tarefas que serão removidas.
**Ato 3:** confirmando, as tarefas de "Feito" somem e as de "A fazer" ficam intactas.

### Armadilhas (rabbit holes)

- **Limpar apaga sem volta.** Mitigação: a confirmação mostra quantas tarefas vão embora.
- **O limpar remover o que não devia.** Mitigação: a regra "só remove o que está em Feito" é uma função pura, com teste.

### Fora de escopo (no-gos)

- Desfazer o limpar (spec 005).
- Apagar uma tarefa só.

### Critérios de aceite

- [ ] Dadas tarefas em "A fazer" e em "Feito", quando limpo, então só as de "Feito" são removidas [unitário]
- [ ] Dado que não há tarefas feitas, quando olho o botão, então ele está desligado [jornada]
- [ ] Dado que há tarefas feitas, quando clico em limpar, então a confirmação informa a quantidade [jornada]
