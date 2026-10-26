# Lista de tarefas: protótipo

Protótipo de uma lista de tarefas com duas etapas, **A fazer** e **Feito**, e um botão para **limpar o que está feito**. É o exemplo de protótipo do template, e nasce do pitch do projeto `exemplo-todo` (`../exemplo-todo.md`). **Todos os dados são fictícios.**

Stack padrão do template: React + Vite + TypeScript, API Node e SQLite (`node:sqlite`, embutido no Node). Requer Node 22.13 ou mais novo.

## Como rodar

```bash
npm install
npm run dev
```

- A API sobe em `http://localhost:3001` e a interface em `http://localhost:5173` (o Vite escolhe a próxima porta livre se ela estiver ocupada).
- O banco fica em `data/todo.db` e é criado com os dados de exemplo na primeira vez. O botão **Reiniciar dados de exemplo** volta tudo ao início.
- `npm test` roda os testes, `npm run typecheck` confere os tipos e `npm run build` gera a versão para publicar.

## O que o protótipo valida

- **O fluxo:** anotar uma tarefa, concluir, voltar para "A fazer" e limpar o que está feito.
- **As regras:** o título é obrigatório e vai até 120 caracteres; a tarefa pode mudar de etapa nos dois sentidos; ao concluir, guarda-se quando; **limpar remove só o que está em "Feito"**. Tudo em `src/domain/rules.ts`.
- **O botão de limpar:** pede confirmação e diz quantas tarefas vão embora, porque não há como desfazer. Fica desligado quando não há nada feito.
- **A ordem:** "A fazer" mostra as mais antigas primeiro; "Feito", as concluídas mais recentemente primeiro.

## O que ele não valida

Desempenho com muitas tarefas, várias pessoas usando ao mesmo tempo, login, sincronização entre aparelhos e acessibilidade completa. Isso só aparece em um produto de verdade.

## Arquitetura (para facilitar a troca)

| Camada | Onde | Observação |
| :--- | :--- | :--- |
| Regras do negócio | `src/domain/rules.ts` | Funções puras em TypeScript, sem banco nem tela. Testadas |
| Contrato de dados | `TodoGateway` em `src/domain/board.ts` | A tela só conhece este contrato |
| SQLite | `server/sqliteRepository.ts` | Uma implementação do contrato. Chaves UUID e etapas como enumeração, para facilitar a migração |
| API HTTP | `server/app.ts` | Só conhece o contrato |
| Interface | `src/` | Cliente HTTP (`src/api.ts`) que cumpre o mesmo contrato |

Para trocar o banco, escreve-se outra implementação de `TodoGateway`, e as telas não mudam.

## Dados de exemplo

`server/sample.ts` tem 8 tarefas fictícias: 5 em "A fazer" e 3 em "Feito". As três feitas existem para você experimentar o botão **Limpar feitas**.

## Pendências conhecidas

- Não há como editar o título nem apagar uma tarefa só: são decisões de escopo do pitch (fora de escopo).
- A confirmação do botão de limpar usa a caixa do navegador (`window.confirm`), que é simples e basta para validar o fluxo.
