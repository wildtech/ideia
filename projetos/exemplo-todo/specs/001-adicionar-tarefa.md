# Adicionar uma tarefa

**Roteiro:** spec
**Tipo:** mudança
**Status:** Finalizado

> **Resumo (TL;DR):** Quem quer anotar uma tarefa precisa de um campo e de um botão, sem cadastro nem etapas. A tarefa nova entra em "A fazer". Está pronta quando o título é obrigatório, tem até 120 caracteres e a tarefa aparece na coluna certa.

### Problema (problem)

Alguém lembra de algo no meio do dia e abre um aplicativo cheio de campos (prazo, prioridade, etiqueta) só para anotar uma linha. Desiste e anota em um papel que se perde.

### Apetite (appetite)

Poucas horas.

### Solução (solution)

**Ato 1:** a pessoa digita o título no campo "O que precisa ser feito?".
**Ato 2:** ao clicar em "Adicionar", o título é validado (obrigatório, até 120 caracteres, sem espaços sobrando).
**Ato 3:** a tarefa nova aparece em "A fazer", e o campo fica vazio.

### Armadilhas (rabbit holes)

- **Título só com espaços.** Mitigação: o título é aparado antes de validar, e a regra é uma função pura com teste.

### Fora de escopo (no-gos)

- Prazos, prioridades, etiquetas e subtarefas.
- Editar o título depois de criada (spec 004).

### Critérios de aceite

- [x] Dado um título válido, quando clico em Adicionar, então a tarefa aparece em "A fazer" [jornada]
- [x] Dado um título vazio ou só com espaços, quando tento adicionar, então a tarefa não é criada e a pessoa vê o motivo [unitário]
- [x] Dado um título com mais de 120 caracteres, quando tento adicionar, então a tarefa não é criada [unitário]
