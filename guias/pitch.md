# Guia: Escrever um Pitch (Shape Up)

Um pitch é o documento que precede qualquer spec detalhada. Ele valida que o problema vale a pena resolver e que a solução é viável antes de qualquer linha de código ou spec. Baseado no formato Shape Up (Basecamp): https://basecamp.com/shapeup/1.5-chapter-06

Este guia complementa o `roteiros/pitch.txt` (as seções e as perguntas de cada uma) e segue as regras do `AGENTS.md` (Markdown como fonte da verdade, RCI, **(?)**, "A definir").

## Quando usar

- **Obrigatório** antes de iniciar as specs de um app novo.
- Recomendado para funcionalidades grandes (escopo de mais de uma semana de trabalho).
- Opcional para funcionalidades pequenas que cabem em specs existentes.

## Onde salvar

Em `projetos/<projeto>/`, como Markdown:

- **Um pitch só:** `projetos/<projeto>/<projeto>.md`.
- **Mais de um pitch** (o assunto foi dividido em problemas menores): um documento guarda-chuva `projetos/<projeto>/<projeto>.md`, que reúne as reflexões, a lista de pitches e as decisões, e um arquivo por pitch na mesma pasta, `pitch-01.md`, `pitch-02.md`, e assim por diante. O guarda-chuva aponta para cada pitch. Não misture os dois (regra 6 do `AGENTS.md`).
- Cada projeto escolhe um tema no `projeto.json` (veja "Temas" no `AGENTS.md`).

## Estrutura do documento

O topo declara o roteiro, junto de período, data limite e status:

```
**Roteiro:** pitch
```

Depois, uma seção `###` para cada item, na ordem:

1. Sobre / Contexto
2. Papéis e Expectativas (RCI)
3. **Problema**
4. **Apetite**
5. **Solução**
6. **Armadilhas**
7. **Fora de escopo**
8. Revisão do pitch
9. Documentos de Apoio (opcional)

Não escreva a numeração nos títulos: o compilador numera quando o tema pede. As cinco seções em negrito são o coração do pitch e são obrigatórias.

## As cinco seções

### Problema

Uma **história específica** que mostra por que o status quo não funciona. Não uma lista de reclamações: uma cena concreta, com quem está tentando fazer o quê, o que acontece hoje e por que isso é ruim.

> Fraco: "Os consultores têm dificuldade de obter dados do cliente."
> Bom: "Um consultor se prepara para uma reunião. Para montar o diagnóstico, entra em cinco telas, anota números à mão e monta uma apresentação. Leva 2 horas e o resultado varia de consultor para consultor."

Se o problema só cabe em uma história com "e também...", ele ainda é grande demais: divida em mais de um pitch.

### Apetite

Quanto tempo e esforço vale investir nesta solução, não quanto tempo vai levar. É uma decisão de negócio, não uma estimativa técnica.

- "2 semanas de uma pessoa de desenvolvimento" para uma funcionalidade pequena.
- "6 semanas de equipe pequena" para um app novo.

Se a solução não cabe no apetite, reduza o escopo. Não aumente o apetite.

### Solução

Os elementos centrais da solução, de um jeito que qualquer pessoa entenda sem contexto técnico.

- Descreva o fluxo em **atos** (Ato 1: entrada, Ato 2: processamento, Ato 3: resultado) e liste os elementos centrais em bullets curtos.
- Use esboços de **traço grosso** (fat marker sketches): sem wireframes detalhados, sem telas de alta fidelidade. O objetivo é comunicar a ideia, não especificar o design.
- **O compilador não trata blocos de código nem imagens.** Por isso, não coloque o esboço em ASCII dentro do documento. Descreva a tela em texto, por exemplo: "Uma tela com um campo de busca no topo, um botão ao lado e o resultado logo abaixo." Se o esboço fizer falta, guarde a imagem na pasta do projeto e cite o arquivo em "Documentos de Apoio".

### Armadilhas

Problemas específicos que já foram identificados no raciocínio. Não é uma lista de riscos genéricos: são pontos técnicos ou de produto que, se ignorados, viram trabalho não planejado.

Escreva uma frase para cada armadilha e, quando possível, a mitigação. Esta seção pode ser mais técnica.

### Fora de escopo

O que explicitamente não faz parte desta solução: as funcionalidades que alguém vai sugerir durante o desenvolvimento e que devem ser recusadas no escopo atual. Declarar isso no pitch evita desvios na implementação.

## Regras que valem aqui

- **Não invente informação.** O que é dúvida fica marcado com **(?)** e o que não tem resposta fica como "A definir". Um pitch em esqueleto, com "A definir", é válido enquanto o assunto está em reflexão.
- **RCI, não RACI.** Só existem Responsável (R), Consultado (C) e Informado (I).
- **Documento vivo e iterativo.** O pitch pode ser reescrito conforme a discussão avança. Registre as decisões e os caminhos descartados no guarda-chuva.
- **Pessoas com nome e sobrenome**, e o papel de cada uma.

## Depois de escrever

Gere os três formatos a cada alteração. O `build.js` compila o arquivo com o nome da pasta; para um pitch com outro nome, use as ferramentas separadas:

```
node tools/build.js projetos/<projeto>
node tools/md2docx.js projetos/<projeto> projetos/<projeto>/pitch-01.md projetos/<projeto>/out/pitch-01.docx
node tools/md2html.js projetos/<projeto> projetos/<projeto>/pitch-01.md projetos/<projeto>/out/pitch-01.html
node tools/md2pdf.js projetos/<projeto> projetos/<projeto>/out/pitch-01.html projetos/<projeto>/out/pitch-01.pdf
```

Corrija sempre no `.md`, nunca nos arquivos de `out/`.

## Checklist antes de finalizar

- [ ] O problema é uma história específica, não uma generalização?
- [ ] O apetite está declarado como decisão, não como estimativa?
- [ ] A solução descreve o fluxo principal em atos, sem blocos de código nem imagens?
- [ ] As armadilhas são problemas reais já identificados (não hipóteses genéricas)?
- [ ] Os fora de escopo incluem pelo menos as funcionalidades mais óbvias?
- [ ] O documento declara `**Roteiro:** pitch` e tem papéis (RCI)?
- [ ] O que é dúvida está marcado com **(?)**?
- [ ] Os documentos foram gerados de novo (docx, html e pdf) e revisados?

## Tom e estilo

- Português do Brasil, voz ativa, direto.
- Uma pessoa de fora do projeto deve conseguir entender o problema e a solução lendo o pitch uma vez.
- Não pressupõe familiaridade com a plataforma ou o código.
- Sem jargão técnico desnecessário no Problema e na Solução. As Armadilhas podem ser mais técnicas.
