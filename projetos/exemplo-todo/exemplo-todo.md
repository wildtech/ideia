# Lista de tarefas: um pitch e um protótipo

**Período de Acompanhamento:** Outubro de 2026.
**Data Limite:** A definir.
**Roteiro:** pitch
**Status do documento:** Exemplo de uso do template: um pitch pequeno, com TL;DR, que gera um protótipo. O cenário é fictício.

---

> **Resumo (TL;DR):**
> - **Problema:** quem toca vários assuntos anota o que falta fazer em lugares soltos e, no fim do dia, não sabe o que ficou feito nem o que continua pendente.
> - **Solução:** uma lista de tarefas com **duas etapas**, "A fazer" e "Feito", e um botão para **limpar o que está feito**.
> - **Apetite:** um dia de uma pessoa de desenvolvimento, com apoio de um assistente de IA. É uma decisão, não uma estimativa.
> - **Fora de escopo:** editar o título, apagar uma tarefa só, prazos, prioridades, etiquetas, login e várias pessoas.
> - **Protótipo:** React, Vite e TypeScript, uma API Node e SQLite, com dados fictícios e um design system pequeno, gerado do tema. Fica em `prototipo/`.
> - **Divulgação:** o mesmo pitch gera um vídeo de demonstração (em 16:9 e em 9:16) e um carrossel de cards 4:5 para redes sociais.
> - **Estado:** protótipo pronto e testado; falta a decisão de quem avalia o pitch.

---

### Sobre / Contexto

Este é um **exemplo** de como o template organiza um projeto de software: um **pitch** no formato do Shape Up, que valida o problema e a solução **antes de qualquer especificação**, um **resumo (TL;DR)** no topo, e um **protótipo** que nasce do pitch e vira um artefato do projeto. A lista de tarefas foi escolhida por ser pequena o bastante para caber em uma página e completa o bastante para ter regras, telas e dados.

O cenário abaixo é fictício e serve só para ilustrar. Quem decide se vale investir: A definir.

Este é um documento vivo. Itens marcados com **(?)** são dúvidas ainda por confirmar, e campos sem resposta ficam como "A definir".

---

### Papéis e Expectativas (RCI)

- **R (Responsável):** A pessoa que executa o trabalho.
- **C (Consultado):** Pessoas que devem ser ouvidas e cuja opinião é necessária (comunicação bidirecional).
- **I (Informado):** Pessoas que devem ser mantidas atualizadas sobre o progresso (comunicação unidirecional).

| Nome/Equipe | Papel Principal | R | C | I |
| :--- | :--- | :--- | :--- | :--- |
| **Daniel Wildt** | Autor do exemplo e do protótipo | X | | |
| **A definir** | Quem decide se o pitch vale o investimento | | X | |

---

### Problema

Uma pessoa toca diversos assuntos ao mesmo tempo. Ao longo do dia ela anota o que precisa fazer em blocos de notas, notas adesivas, em mensagens que manda para si mesma e em intervalos de reuniões. No fim do dia, tenta responder duas perguntas simples: o que eu já fiz e o que ainda falta? Para isso, ela analisa tudo novamente, não acha metade das anotações e não lembra se uma tarefa foi concluída ou só esquecida. As anotações antigas se acumulam, as pendências reais se perdem entre elas, e começar o dia seguinte leva mais de dez minutos só para reconstruir a lista.

> Esta é uma cena fictícia, escrita para o exemplo.

---

### Apetite

**Um dia de uma pessoa de desenvolvimento**, com apoio de um assistente de IA, para um protótipo que mostre o fluxo completo. É uma **decisão de negócio**: se a solução não couber em um dia, o escopo diminui, e o apetite não aumenta.

---

### Solução

O fluxo tem três atos:

1. **Anotar.** Há um campo e um botão "Adicionar". A tarefa nova entra em "A fazer".
2. **Andar.** Cada tarefa tem um botão: em "A fazer", **Concluir** a leva para "Feito"; em "Feito", **Voltar** a devolve para "A fazer". Ao concluir, guarda-se quando.
3. **Limpar.** Em "Feito", um botão **Limpar feitas** remove tudo o que está feito e deixa só o que falta. Ele pede confirmação e diz quantas tarefas vão embora, porque não há como desfazer.

Os elementos centrais:

- **Duas etapas, nada mais:** A fazer e Feito.
- **Uma tela só**, com as duas colunas lado a lado, cada uma com a sua contagem.
- **Ordem que ajuda:** em "A fazer", as mais antigas primeiro; em "Feito", as concluídas mais recentemente primeiro.
- **Título obrigatório**, de até 120 caracteres, sem espaços sobrando.
- **O botão de limpar fica desligado** quando não há nada feito.

Esboço de traço grosso, em texto: no alto, o título e uma linha de campo com o botão "Adicionar"; abaixo, duas caixas lado a lado, "A fazer" à esquerda e "Feito" à direita; cada tarefa é uma linha com o título e um botão; o "Limpar feitas" fica no cabeçalho da caixa "Feito".

---

### Armadilhas

- **Limpar apaga sem volta.** Quem clica sem querer perde as tarefas feitas. Mitigação: a confirmação mostra quantas tarefas vão embora, e o botão fica desligado quando não há nada a limpar.
- **Tarefa que volta para "A fazer" guarda a data de conclusão antiga.** Mitigação: ao voltar, a data de conclusão é apagada, e ao concluir de novo guarda-se a nova.
- **O limpar remover o que não devia.** Mitigação: a regra "só remove o que está em Feito" é uma função pura, com teste.
- **Trocar o banco depois.** O SQLite do protótipo não é o banco do produto. Mitigação: a tela só conhece um contrato de dados, e o banco é uma implementação dele.
- **Versão do Node:** o módulo `node:sqlite` exige o Node 22.13 ou mais novo. Mitigação: o `package.json` declara isso, e o README avisa.

---

### Fora de escopo

- **Editar o título** de uma tarefa.
- **Apagar uma tarefa só.** Só existe o limpar do que está feito.
- **Prazos, datas de vencimento e lembretes.**
- **Prioridades, etiquetas e subtarefas.**
- **Arrastar e soltar** entre as colunas.
- **Login e várias pessoas**, ou sincronização entre aparelhos.
- **Desfazer** o limpar.

---

### Revisão do pitch

- O problema é uma história específica? Sim: uma pessoa, diversos assuntos e uma lista que não se reconstrói.
- O apetite está declarado como decisão? Sim: um dia de uma pessoa.
- A solução mostra o fluxo principal? Sim: anotar, andar e limpar.
- As armadilhas são reais, e não genéricas? Sim: o limpar sem volta e a data de conclusão são problemas deste desenho.
- Os no-gos incluem o mais óbvio? Sim: editar, apagar uma só, prazos e prioridades.
- O que ainda é dúvida: quem decide o pitch, e se um dia basta. **(?)**

---

### Stack e estratégia de validação

**Decisões (padrão do template, sem alteração):**
- **React + Vite + TypeScript** na interface; **API Node** própria; **SQLite** pelo `node:sqlite`, embutido no Node; **Vitest** nos testes das regras e da API; **Playwright** nas jornadas na tela, com um vídeo de demonstração narrado (legendas e voz), em 16:9 e em 9:16, e capturas para os slides, no desktop e no celular; um **design system** pequeno, com as cores e a fonte geradas do tema (`src/tokens.css`), componentes em `src/ui/` e um catálogo em `/ds`.
- **Regras como funções puras** em `src/domain/rules.ts`, com testes: validar o título, mudar de etapa, escolher o que o limpar remove, contar e ordenar.
- **Contrato de dados** (`TodoGateway`): a tela e a API só o conhecem. O SQLite é uma implementação dele, e outra pode substituí-lo.
- **Dados fictícios apenas**, no protótipo e no repositório. O banco local não é versionado.

**O que o protótipo valida:** o fluxo, as regras, o botão de limpar e a confirmação. **O que não valida:** desempenho com muitas tarefas, várias pessoas ao mesmo tempo, login e sincronização.

O protótipo é um **artefato** deste projeto (veja o `projeto.json`): nasceu deste pitch, fica versionado em `prototipo/` e evolui por conta própria.

---

### Material de divulgação

O pitch não termina no protótipo: dele saem os materiais para mostrar o que foi validado. Todos são derivados deste documento (a mesma regra do resumo) e não afirmam nada que ele não diga.

- **Vídeo de demonstração:** a jornada principal, narrada, em duas formas: horizontal (1280x720) e vertical (1080x1920), para as redes sociais.
- **Carrossel para redes sociais:** 10 cards 4:5 (1080x1350), com o gancho, o problema, a solução, os três passos com prints do celular, o que ela não faz e a chamada. A legenda do post e um texto alternativo por card saem junto.
- **Slides:** o resumo (TL;DR) em forma de apresentação, com as capturas do protótipo no desktop e no celular e o catálogo do design system.
- **Design system:** a identidade do tema (as cores e a fonte) aplicada ao protótipo, aos slides e ao carrossel, com o verde escuro e o destaque da marca.

Antes de publicar, confira: dados fictícios, créditos das imagens e nada de segredo, dado pessoal ou de dentro da organização. **Publicar é com a pessoa**, e o assistente nunca posta.

---

### Documentos de Apoio

- `prototipo/README.md`: como rodar, as jornadas (Playwright), o vídeo de demonstração narrado, o que o protótipo valida, a arquitetura e os dados de exemplo.
- `exemplo-todo-slides.md`: o resumo (TL;DR) em forma de apresentação.
- `guias/video-demonstracao.md`: como gerar o vídeo de demonstração narrado do protótipo.
- `exemplo-todo-carrossel.md`: o carrossel de divulgação (cards 4:5), com a legenda e o texto alternativo; sai em `out/exemplo-todo-carrossel/`.
- `imagens/`: as capturas de tela do protótipo no desktop e no celular, a montagem das telas de celular, o catálogo do design system e a folha de contato do carrossel (dados fictícios), usadas nos slides. As capturas vêm das jornadas (`npm run capturas` e `npm run capturas:mobile`) e a folha, de `node tools/md2cards.js projetos/exemplo-todo --folha projetos/exemplo-todo/imagens/07-carrossel.png`; todas são versionadas.
- `roteiros/divulgacao.txt` e `guias/design-system.md`: o roteiro do carrossel e o guia do design system do protótipo.
- `roteiros/pitch.txt` e `guias/pitch.md`: o roteiro e o guia do pitch.
- [Shape Up, capítulo 6: Write the pitch](https://basecamp.com/shapeup/1.5-chapter-06): a origem do formato.
