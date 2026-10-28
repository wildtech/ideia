# Lista de tarefas: um pitch e um protótipo

**Roteiro:** tldr
**Público da apresentação:** A definir
**Status do documento:** Exemplo, a partir do resumo (TL;DR) do documento completo.

> Notas: O estilo zen-lessig vem do tema: o slide sem layout é uma frase. Veja `guias/slides-zen-lessig.md`. As capturas de tela são do protótipo em `prototipo/`, com dados fictícios.

---

### Uma pessoa. Diversos assuntos.

> Notas: fonte: "Problema" do documento completo. O cenário é fictício.

### Anotações em blocos de notas, notas adesivas, mensagens e intervalos de reuniões.

**Layout:** frase-escura

### O que eu já fiz? O que ainda falta?

### Reconstruir a lista leva mais de dez minutos.

**Layout:** frase-escura

### A solução: duas etapas.

> Notas: fonte: "Solução". Anotar, andar e limpar são os três atos.

### A fazer. Feito.

**Layout:** secao

### Duas colunas, cada uma com a sua contagem.

**Layout:** evidencia
**Imagem:** imagens/01-quadro-inicial.png
**Crédito:** captura do protótipo (dados fictícios)

> Notas: o protótipo rodando, com as tarefas de exemplo: 5 em "A fazer" e 3 em "Feito". Fonte: "Solução", elementos centrais.

### Anotar: a tarefa nova entra em A fazer.

**Layout:** evidencia
**Imagem:** imagens/02-tarefa-nova.png
**Crédito:** captura do protótipo (dados fictícios)

> Notas: ato 1. "A fazer" passou de 5 para 6 tarefas. A nova fica no fim, porque a ordem é das mais antigas para as mais novas.

### Andar: concluir leva a tarefa para Feito.

**Layout:** evidencia
**Imagem:** imagens/03-tarefa-concluida.png
**Crédito:** captura do protótipo (dados fictícios)

> Notas: ato 2. "Escrever o pitch" foi concluída e está no topo de "Feito", que mostra as concluídas mais recentemente primeiro. O botão "Voltar" a devolve para "A fazer".

### E um botão: limpar o que está feito.

**Layout:** frase-escura

> Notas: ato 3. O botão pede confirmação e diz quantas tarefas vão embora, porque não há como desfazer.

### Limpar: só o que estava feito vai embora.

**Layout:** evidencia
**Imagem:** imagens/04-feitas-limpas.png
**Crédito:** captura do protótipo (dados fictícios)

> Notas: depois de limpar, "Feito" fica vazio e o botão fica desligado. "A fazer" não mudou.

### Apetite: um dia de uma pessoa.

> Notas: fonte: "Apetite". É uma decisão de negócio, não uma estimativa.

### Sem editar, prazos, etiquetas ou login.

**Layout:** frase-escura

> Notas: fonte: "Fora de escopo".

### Tecnologias do protótipo: React, Vite e SQLite.

> Notas: fonte: "Stack e estratégia de validação". Dados fictícios; regras em funções puras, com testes.

### O que mais sai do pitch.

**Layout:** secao

> Notas: fonte: "Material de divulgação" do documento completo. Tudo isto nasce do mesmo pitch e do mesmo tema, e não afirma nada que o documento não diga.

### No celular, a mesma tela em uma coluna.

**Layout:** evidencia
**Imagem:** imagens/06-celular.png
**Crédito:** capturas do protótipo (dados fictícios)

> Notas: anotar, andar e limpar, agora na tela de um celular. As colunas ficam uma embaixo da outra, e os botões têm pelo menos 44 px de altura, para o toque. Capturas geradas por `npm run capturas:mobile` e montadas por `npm run capturas`.

### O design system vem do tema.

**Layout:** imagem-direita
**Imagem:** imagens/08-catalogo-slide.png
**Crédito:** catálogo do protótipo (/ds)

Cores e fonte saem do tema do projeto. Poucos componentes, com contraste conferido.

> Notas: o catálogo `/ds` do protótipo mostra os tokens, o contraste de cada par de cores e os componentes nos seus estados. Os mesmos tokens dão o verde escuro dos slides e do carrossel. Fonte: "Stack e estratégia de validação".

### Um vídeo, em duas formas: 16:9 e 9:16.

**Layout:** evidencia
**Imagem:** imagens/09-videos.png
**Crédito:** quadros dos vídeos (dados fictícios)

> Notas: a jornada principal, narrada, gravada pelo Playwright: horizontal (1280x720) e vertical (1080x1920, para as redes), com legenda, cursor e voz. A imagem junta um quadro de cada vídeo (`npm run quadros`). Os vídeos ficam fora do repositório (`demo/`); `npm run demo:todos` os gera. Fonte: "Material de divulgação".

### E um carrossel para as redes sociais.

**Layout:** evidencia
**Imagem:** imagens/07-carrossel.png
**Crédito:** carrossel gerado do Markdown

> Notas: 10 cards de 1080x1350, escritos a partir do resumo (TL;DR) do pitch. A legenda do post e o texto alternativo de cada card saem junto. A imagem é a folha de contato: `node tools/md2cards.js projetos/exemplo-todo --folha projetos/exemplo-todo/imagens/07-carrossel.png`. Publicar é com a pessoa.

### Depois do pitch, as especificações.

**Layout:** secao
