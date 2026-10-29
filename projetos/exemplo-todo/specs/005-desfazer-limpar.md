# Desfazer o limpar das feitas

**Roteiro:** spec
**Tipo:** mudança
**Status:** Ideia

> **Resumo (TL;DR):** O limpar apaga sem volta, e quem clica sem querer perde as tarefas feitas. A ideia é guardar o último limpar por um tempo curto, para a pessoa desfazer. Está pronta quando o desfazer restaura exatamente as tarefas removidas. O apetite ainda não cabe em poucos dias **(?)**.

### Problema (problem)

Alguém limpa as feitas para organizar a tela e logo depois percebe que precisava de uma tarefa para a reunião do dia. Ela já foi embora, e a pessoa refaz de memória.

### Apetite (appetite)

Um dia **(?)**: depende de onde o último limpar fica guardado.

### Solução (solution)

**Ato 1:** ao limpar, a tela mostra "N tarefas removidas. Desfazer".
**Ato 2:** ao clicar em Desfazer, as tarefas voltam para "Feito", com as datas de conclusão originais.
**Ato 3:** passado o tempo, o aviso some e o limpar fica definitivo.

### Armadilhas (rabbit holes)

- **Onde guardar o último limpar** sem mudar o contrato de dados da tela. A definir (?).
- **Limpar duas vezes seguidas:** o desfazer só vale para o último.

### Fora de escopo (no-gos)

- Histórico de vários limpares.
- Restaurar tarefas de dias atrás.

### Critérios de aceite

- [ ] Dado um limpar recente, quando clico em Desfazer, então as tarefas voltam para "Feito" com as datas originais [jornada]
- [ ] Dado que o tempo passou, quando olho a tela, então o desfazer não está mais disponível [jornada]
