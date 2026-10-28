# Guia: cards, reels e layouts

Um carrossel é um conjunto de **cards** (imagens) para redes sociais, escrito em Markdown e gerado no tema do projeto por `tools/md2cards.js`. Os mesmos cards viram um **reel** (um vídeo curto, com os cards animados) e as cenas de cartão do **vídeo em cenas** (`tools/md2video.js`). Este guia complementa o roteiro `roteiros/divulgacao.txt` e a seção "Carrosséis" do `AGENTS.md`, e usa como exemplo o `projetos/exemplo-todo/`.

## Escolher o layout

Cada card escolhe um layout com `**Layout:** <nome>`. Para ver todos no tema do seu projeto, gere o catálogo:

```bash
node tools/md2cards.js projetos/<projeto> --catalogo
```

Sai `out/catalogo-cards.html` e `out/catalogo-cards.png`, com o exemplo de cada layout e o nome dele numa etiqueta.

| Layout | Para quê | Exemplo de uso |
| :--- | :--- | :--- |
| `texto` (padrão) | Título e, abaixo, texto ou lista. Sem nada abaixo, o título vira uma frase grande | O problema, em dois ou três itens |
| `frase` e `frase-escura` | O título é a frase, grande, em fundo claro ou escuro (até 14 palavras) | O gancho; a solução em uma frase |
| `numero` | Um número grande e o que ele quer dizer | "1 dia" de apetite; "+10 min" para refazer a lista |
| `citacao` | Uma citação, com aspas grandes, e **Autor:** como assinatura | Uma frase de quem usou ou do documento |
| `passos` | Uma lista numerada em passos, com o número num círculo da cor da marca | O fluxo em três atos |
| `antes-depois` | Duas colunas, cada uma aberta por um `####` | O dia antes e depois da solução |
| `tela` | Texto de um lado e a captura de um celular do outro (**Imagem:** e **Foco:**) | Um passo do protótipo |
| `duas-telas` | Duas capturas lado a lado (duas linhas **Imagem:**) | Antes e depois de limpar |
| `foto` | Uma foto cobre o card, com o título sobre um degradê (registre o **Crédito:**) | Uma cena do dia a dia |
| `fechamento` | A chamada para ação, centralizada, com o link em destaque | O último card |

O card de capa é o `# Título` do arquivo (aceita **Imagem:** ao fundo). Todos os cards trazem o logo do tema, uma barra de progresso e o "Deslize →", na cor da marca.

## Formatos

O formato vale para o arquivo todo e vem do **Formato:** da capa, ou de `--formato` na linha de comando (padrão: 4:5).

| Formato | Tamanho | Onde |
| :--- | :--- | :--- |
| `4:5` | 1080x1350 | Feed do Instagram e do LinkedIn |
| `1:1` | 1080x1080 | Feed, em qualquer rede |
| `9:16` | 1080x1920 | Stories e reels |
| `16:9` | 1920x1080 | Vídeo horizontal e apresentações |
| `1.91:1` | 1200x628 | A imagem de um link compartilhado |

Os layouts são desenhados para o menor lado com 1080 px, e se ajustam ao formato: no 9:16, por exemplo, o layout `tela` põe o texto em cima e o celular embaixo. No `projeto.json`, uma saída pode pedir outro formato do mesmo Markdown:

```json
{ "fonte": "x-carrossel.md", "tipo": "carrossel", "formato": "9:16", "formatos": ["mp4"] }
```

Quando o formato é diferente do Markdown, a saída ganha o sufixo dele (`out/x-carrossel-9x16.mp4`).

## O reel (`mp4`)

Com `"mp4"` nos formatos, os cards viram um vídeo: cada um entra com animação (o título sobe, os itens da lista entram um a um, o celular sobe, o número cresce) e sai para o próximo com uma transição.

- **Duração de cada card:** calculada pelo número de palavras (de 3 a 8 segundos); `**Duração:** 5` no card a fixa.
- **Transição:** `desliza` (padrão), `fade`, `zoom` ou `corte`, com `**Transição:**` no card ou na capa (para todos).
- **Música:** `**Música:** audio/trilha.mp3` na capa. Use só música com licença que permita o uso, e registre a licença nas notas.
- **Movimento do tema:** as durações e a curva vêm dos tokens de movimento do tema (`"tokens": { "movimento": ... }`), os mesmos do protótipo.
- O vídeo é gravado **quadro a quadro** pelo Chrome (sem depender da velocidade do computador) e montado pelo `ffmpeg`, que precisa estar instalado (veja `guias/video-demonstracao.md`).

## Criar um layout novo

```bash
node tools/novo.js layout <nome>              # para todos: tools/cards/layouts/<nome>.css
node tools/novo.js layout <nome> --tema <tema>   # só para um tema: temas/<tema>/cards/<nome>.css
```

Um layout é **um arquivo CSS**. O HTML de todo card é o mesmo, e o layout só muda o desenho:

```text
section.card.l-<layout>.claro|escuro.f-paisagem|quadrado|retrato|alto
  .fundo-img   .logo   .miolo > h2 + .texto (+ .bloco > h3) + .autor
  .telas > .tela   .credito   .rodape   .legenda (no vídeo)
```

O arquivo começa com um comentário que descreve o layout e traz um exemplo (o catálogo usa):

```text
/* @layout {"escuro": false, "frase": false, "imagem": "tela", "descricao": "Para que serve."}
@exemplo
### Um título de exemplo
**Layout:** <nome>
Um texto de exemplo.
*/
```

- `escuro`: fundo escuro por padrão. `frase`: o título é a frase. `imagem`: `tela` (capturas de celular) ou `fundo` (a imagem cobre o card).
- **Use só os tokens do tema** (`var(--primaria)`, `var(--primaria-acao)`, `var(--fundo-escuro)`, `var(--destaque)`, `var(--raio)` e os outros de `tools/tokens.js`): nenhuma cor escrita à mão, para o layout funcionar em qualquer tema.
- Para ajustar um detalhe de todos os layouts num tema, sem criar um layout, use `temas/<tema>/cards.css`.
- Para uma animação própria no reel, use `body.anim .l-<nome> ...` com `animation-delay: calc(var(--t0) + .3s)` (o `--t0` é o instante em que o card entra).
- Confira o resultado no catálogo e nos três formatos mais usados (4:5, 9:16 e 16:9).

## Antes de publicar

- Tudo o que está nos cards existe no documento de origem (a regra do resumo).
- Cada card tem `> Alt:` (texto alternativo) e o post tem `> Legenda:`.
- Dados fictícios ou autorizados, créditos das imagens e da música, e nada de segredo ou de dado de dentro da organização (veja `guias/seguranca.md`).
- **Quem publica é a pessoa**, nunca o assistente.
