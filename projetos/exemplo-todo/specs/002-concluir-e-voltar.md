# Concluir uma tarefa e voltar atrás

**Roteiro:** spec
**Tipo:** mudança
**Status:** Finalizado

> **Resumo (TL;DR):** Uma tarefa tem só duas etapas, "A fazer" e "Feito", e a pessoa pode andar nas duas direções. Está pronta quando concluir guarda quando foi feito e voltar apaga essa data.

### Problema (problem)

Quem marca uma tarefa como feita sem querer não tem como recuperá-la, e uma lista que só anda para frente vira lixo de tarefas erradas.

### Apetite (appetite)

Poucas horas.

### Solução (solution)

**Ato 1:** em "A fazer", cada tarefa tem o botão **Concluir**.
**Ato 2:** ao concluir, a tarefa vai para "Feito" e guarda-se quando.
**Ato 3:** em "Feito", o botão **Voltar** devolve a tarefa para "A fazer".

### Armadilhas (rabbit holes)

- **Tarefa que volta guarda a data de conclusão antiga.** Mitigação: ao voltar, a data é apagada; ao concluir de novo, guarda-se a nova.

### Fora de escopo (no-gos)

- Arrastar e soltar entre as colunas.

### Critérios de aceite

- [x] Dada uma tarefa em "A fazer", quando concluo, então ela aparece em "Feito" com a data de conclusão [jornada]
- [x] Dada uma tarefa em "Feito", quando volto, então ela aparece em "A fazer" sem data de conclusão [unitário]
