# Guia: vídeo de demonstração de um protótipo

Um protótipo pode gerar, sozinho, um **vídeo de demonstração narrado**: o Playwright repete a jornada principal na tela, desenha legendas, o nome do passo e um cursor, aproxima a tela do que está sendo feito, e a narração (a sua voz ou uma voz sintética) é mixada no vídeo. Depois, o **vídeo em cenas** junta essa jornada a cartões animados (abertura, cenário e fechamento), no tema do projeto. Este guia complementa a seção "Protótipos" do `AGENTS.md` e usa como exemplo o `projetos/exemplo-todo/`.

## Duas camadas

| Camada | De onde vem | Comando | Saída |
| :--- | :--- | :--- | :--- |
| **Jornada gravada** | As cenas `**Cena:** jornada` do `<projeto>-video.md`, feitas pelo `e2e/demo.spec.ts` | `npm run demo:todos`, no protótipo | `demo/demo.mp4`, `demo/demo-vertical.mp4` e `demo/cenas*.json` |
| **Vídeo em cenas** | O `<projeto>-video.md` inteiro: cartões animados (os layouts dos cards) e os trechos da jornada | `node tools/build.js projetos/<projeto>` (ou `node tools/md2video.js`) | `out/<projeto>-video.mp4`, `-9x16.mp4` e as legendas `.srt` |

O roteiro de tudo é **um Markdown só**, o `<projeto>-video.md` (roteiro `roteiros/video.txt`). Projetos sem protótipo também podem ter um vídeo em cenas, só com cartões.

## O que o vídeo traz

- A **jornada principal** do protótipo, na tela, em um MP4 de 1280x720 (horizontal, 16:9) e, se você quiser, em um MP4 **vertical de 1080x1920** (9:16), com a interface no layout de celular, para redes sociais e mensagens.
- **Legendas** com o texto da narração, em que as **palavras acendem no ritmo da voz**, o **nome do passo** no canto (o título da cena, como "1. Anotar"), e um **cursor** que aparece e faz uma "onda" no clique (o vídeo do Playwright não mostra o mouse).
- **Zoom suave** no que está sendo feito (o campo, o item novo, a coluna), com `**Zoom:** 1.6` na cena. No 9:16 não há zoom, porque a tela já é a de um celular.
- As cores da legenda, do passo e do cursor vêm dos **tokens do tema** (`src/tokens.css`).
- A **pergunta da confirmação do navegador** na legenda (a caixa de confirmação não aparece em gravações).
- A **voz**, se houver. Sem voz, o vídeo sai só com legendas.

## O que precisa estar instalado

| O quê | Para quê | Como obter |
| :--- | :--- | :--- |
| **Node.js** e as dependências do protótipo | Rodar o protótipo e as jornadas | `npm install` no protótipo |
| **Google Chrome** | As jornadas usam o Chrome já instalado | O mesmo que gera os PDFs do repositório |
| **ffmpeg** | Mixar a voz no vídeo e dividir uma gravação | macOS: `brew install ffmpeg`. Linux (Debian e Ubuntu): `sudo apt install ffmpeg`. Windows: `winget install ffmpeg` |

Os comandos de instalação do ffmpeg no Windows e no Linux são os usuais, e **não foram testados** neste repositório (só o macOS foi). Sem o `ffmpeg`, o vídeo (só com legendas) fica em `demo/demo.webm`.

## Como gerar

```bash
cd projetos/<projeto>/prototipo
npm run demo
```

Em cerca de um minuto sai o `demo/demo.mp4` (só a jornada). Para a versão vertical, rode `npm run demo:vertical` (sai `demo/demo-vertical.mp4`), ou `npm run demo:todos` para gerar as duas de uma vez. O que acontece por baixo:

1. `npm run narracao` prepara a voz de cada trecho e mede a duração.
2. O Playwright grava a jornada, no **ritmo da voz**: cada passo espera o trecho terminar.
3. `scripts/montar-video.ts` mistura a voz no vídeo com o `ffmpeg`. A sincronia usa uma faixa magenta que a página pisca no início e que é cortada do vídeo final. Ele escreve também `demo/cenas.json`: onde cada cena da jornada começa e termina.
4. Na raiz, `node tools/build.js projetos/<projeto>` monta o **vídeo em cenas**: grava cada cartão animado quadro a quadro (com a voz e a legenda), recorta os trechos da jornada e junta tudo com transições, em 16:9 e em 9:16.

### O vídeo em cenas

Cada `###` do `<projeto>-video.md` é uma cena:

| Diretiva | O que faz |
| :--- | :--- |
| (nenhuma) | Um **cartão animado**, com os layouts dos cards (`**Layout:** frase-escura`, `numero`, `fechamento`...) |
| `**Cena:** jornada` | Um trecho da jornada gravada. Entre dois trechos seguidos, o corte é seco |
| `**Trecho:** id` | Liga a cena à voz (`narracao/<id>.wav` ou a voz sintética) e, na jornada, à ação de mesmo nome em `e2e/demo.spec.ts` (`ACOES`) |
| `> Narração: texto` | O que a voz diz e a legenda mostra |
| `**Zoom:** 1.6` | (jornada) quanto a tela se aproxima da ação |
| `**Duração:** 4` | (cartão) segundos na tela, quando não há voz |
| `**Transição:** fade` | `desliza`, `fade`, `zoom` ou `corte` (na capa, vale para todas) |

Na capa (`# Título`): `**Formato:** 16:9, 9:16` (os vídeos a gerar), `**Gravação:** prototipo/demo` (onde está a jornada) e, se quiser, `**Música:** audio/trilha.mp3`, que **abaixa sozinha quando a voz entra**. Use só música com licença que permita o uso, e registre a licença.

- **Uma cena nova na jornada** pede uma ação com o mesmo `Trecho` em `e2e/demo.spec.ts`; sem ela, a cena só mostra a tela enquanto a voz fala (e o teste avisa).
- Sem a gravação (`demo/cenas.json`), as cenas da jornada ficam de fora e o vídeo sai só com os cartões.
- Sai também um `.srt` com as legendas, para subir junto com o vídeo nas redes e no YouTube.
- Para começar um vídeo do zero: `node tools/novo.js video projetos/<projeto>`.

### Um quadro para os slides

Os vídeos não entram em uma apresentação em Markdown, mas um quadro deles entra. No protótipo de exemplo, `npm run quadros` tira um quadro de cada vídeo (o do passo "anotar") e os junta, lado a lado, em uma imagem de fundo transparente (`imagens/09-videos.png`). Rode `npm run demo:todos` antes. Escolha o quadro no `scripts/quadros-video.ts` (`DEPOIS_DO_INICIO_S`, os segundos depois do começo do passo).

### A versão vertical (9:16)

- É a **mesma jornada e a mesma narração**, rodando em uma tela de 540x960. Como a largura fica abaixo de 640 px, a interface cai no **layout estreito** (as colunas empilhadas), e a legenda encolhe e sobe um pouco, para não ficar sob os botões das redes sociais.
- O Playwright **não amplia** a gravação: ela sai do tamanho da tela, e o `ffmpeg` a leva para 1080x1920 (ampliação de 2x, com texto ainda legível).
- A interface precisa ter um layout estreito de verdade. Se o protótipo só funciona em tela larga, o vídeo vertical vai mostrar isso.
- A tela rola sozinha, de forma suave, até o que a jornada mexe, então o enquadramento acompanha a ação.

## O roteiro da narração

O texto fica no `<projeto>-video.md`, nas linhas `> Narração:` de cada cena (o `e2e/narracao.ts` lê esse arquivo). **O mesmo texto vira a legenda e a voz.** O cenário vem do "Problema" do pitch. Para mudar o que o vídeo diz, edite o Markdown e rode `npm run demo:todos` e o `build` de novo.

## A voz: quatro caminhos

O `npm run narracao` procura a voz de cada trecho nesta ordem:

| Ordem | Caminho | Funciona em | Como usar |
| :--- | :--- | :--- | :--- |
| 1 | **A sua voz** (um áudio por trecho) | Qualquer sistema | Grave `narracao/<trecho>.wav` (ou `.mp3`, `.m4a`, `.aiff`, `.ogg`) |
| 1 | **A sua voz** (uma gravação só) | Qualquer sistema | Grave tudo de uma vez em `narracao/voz.wav` e rode `npm run dividir` |
| 2 | **Um programa de voz sintética à sua escolha** | Qualquer sistema | Defina a variável `TTS_COMANDO` (abaixo) |
| 3 | **A voz do macOS** (`say`, em português) | macOS | Nada a fazer: é o padrão no Mac |
| 4 | **Sem voz** | Qualquer sistema | Só legendas; a duração de cada trecho é estimada pelo número de palavras |

### Gravar a sua voz (voiceover)

É o caminho recomendado para um vídeo de verdade, e a sincronia é automática: **a duração de cada trecho da sua voz comanda o ritmo da jornada**.

1. Abra o `<projeto>-video.md` e leia as linhas `> Narração:` na ordem. Edite o texto se quiser falar do seu jeito.
2. Grave em um lugar silencioso, com o microfone perto, lendo os trechos **na ordem** e deixando **pelo menos um segundo de silêncio entre um trecho e o outro**. Evite pausas longas **dentro** de um trecho.
3. Salve como `narracao/voz.wav` (qualquer programa de gravação serve; WAV ou M4A).
4. Rode `npm run dividir`. Ele acha os silêncios e corta um arquivo por trecho em `narracao/<trecho>.wav`.
5. Rode `npm run demo`. O vídeo é gravado no ritmo da sua voz.

Se o `dividir` achar mais ou menos trechos do que o roteiro, ele diz quantos achou e o que ajustar: `--pausa` (os segundos de silêncio que separam os trechos, padrão 0,8) e `--limiar` (o volume abaixo do qual é silêncio, padrão -35 dB; suba para -30 se o ambiente tem ruído). Exemplo: `npm run dividir -- minha-voz.wav --pausa 1.2`.

Se preferir, grave **um arquivo por trecho** já com o nome certo (`narracao/cenario.wav`, `narracao/anotar.wav`, ...) e pule o passo do `dividir`. Para regravar um trecho só, troque o arquivo e rode `npm run demo` de novo.

### Voz sintética em outro sistema (`TTS_COMANDO`)

`TTS_COMANDO` é um comando de síntese de voz que o `narracao` roda uma vez por trecho. Nele, `{saida}` é o arquivo de áudio a gerar (`demo/audio/<trecho>.wav`), `{arquivo_texto}` é um arquivo com o texto do trecho e `{texto}` é o próprio texto entre aspas.

| Sistema | Exemplo | Situação |
| :--- | :--- | :--- |
| macOS | `say -v Luciana -o "{saida}" --data-format=LEI16@22050 -f "{arquivo_texto}"` | **Testado** (já é o padrão no Mac, sem precisar definir nada) |
| Linux | `espeak-ng -v pt-br -w "{saida}" -f "{arquivo_texto}"` | **Não testado**: exige o `espeak-ng` instalado; a voz é robótica |
| Windows (PowerShell) | `powershell -NoProfile -Command "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile('{saida}'); $s.Speak((Get-Content -Raw -Encoding UTF8 '{arquivo_texto}')); $s.Dispose()"` | **Não testado**: precisa de uma voz em português instalada no Windows; sem ela, fala em outro idioma |

No macOS e no Linux: `TTS_COMANDO='...' npm run demo`. No PowerShell do Windows: `$env:TTS_COMANDO='...'; npm run demo`. Qualquer programa de linha de comando que gere um arquivo de áudio serve, inclusive os serviços de voz na nuvem (com as suas próprias chaves, que **nunca** vão para o repositório). Se o comando falhar em um trecho, o script avisa e segue sem voz nele.

## Git: o que vai e o que não vai

| Pasta | Vai para o git? | Por quê |
| :--- | :--- | :--- |
| `demo/` | Não (ignorada pelo `.gitignore` do protótipo) | É gerada: os vídeos (`demo.mp4` e `demo-vertical.mp4`), a voz sintética, os tempos e as cenas |
| `out/` | Não (ignorada pelo `.gitignore` da raiz) | O vídeo em cenas, gerado de novo pelo `build` |
| `test-results/` | Não (ignorada pelo `.gitignore` da raiz) | Gravações brutas do Playwright |
| `narracao/` | **Sim, se você quiser** | São as **suas** gravações, insumo do vídeo |
| `projetos/<projeto>/videos/` | **Sim** | É onde fica o vídeo **aprovado** |

Para guardar uma versão do vídeo, copie `out/<projeto>-video.mp4` (ou a versão `-9x16`, ou só a jornada, em `demo/demo.mp4`) para `projetos/<projeto>/videos/` e registre no `projeto.json`, como artefato derivado do documento:

```json
{ "tipo": "video", "caminho": "videos/demo.mp4", "origem": "meu-projeto.md", "descricao": "Demonstração narrada do protótipo." }
```

## Cuidados

- **Vozes sintéticas têm termos de uso.** A voz do sistema (como a do macOS) pode ter restrições para redistribuir o áudio. Por isso o vídeo gerado **não vai para o repositório público do template**. Para publicar um vídeo, use a **sua voz**.
- **Dados fictícios.** O vídeo mostra o protótipo funcionando: nada de dados reais na tela.
- **Só o Chrome** é usado na gravação.
- **A jornada é gravada em tempo real**: dura o tempo da narração (cerca de um minuto no exemplo). Os cartões, não: são gravados quadro a quadro, e levam um ou dois minutos por formato.

## Se algo der errado

| Sintoma | O que fazer |
| :--- | :--- |
| `Não achei a gravação` ao montar | Rode `npm run demo` (ou `npm run demo:vertical`) de novo; a montagem usa a última gravação em `test-results/` |
| `Não achei a marca de sincronia` | A gravação ficou incompleta; rode `npm run demo` (ou `npm run demo:vertical`) de novo |
| Vídeo só com legendas e você queria voz | Veja a ordem dos caminhos acima: falta o áudio em `narracao/`, o `TTS_COMANDO` ou o macOS |
| `dividir` achou trechos a mais ou a menos | Ajuste `--pausa` e `--limiar`, ou grave um arquivo por trecho |
| `a cena "..." não está na gravação` | A cena da jornada foi criada ou renomeada depois da gravação: rode `npm run demo:todos` de novo |
| `Unrecognized option` ou erro de filtro no `ffmpeg` | Atualize o `ffmpeg` (o template usa a versão 7 ou mais nova) |
| Voz atrasada ou adiantada em relação à legenda | Não deveria acontecer; se acontecer, abra uma issue com o `demo/marcas.json` (ou `demo/marcas-vertical.json`) |
