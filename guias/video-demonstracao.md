# Guia: vídeo de demonstração de um protótipo

Um protótipo pode gerar, sozinho, um **vídeo de demonstração narrado**: o Playwright repete a jornada principal na tela, desenha legendas e um cursor, e a narração (a sua voz ou uma voz sintética) é mixada no vídeo. Este guia complementa a seção "Protótipos" do `AGENTS.md` e usa como exemplo o `projetos/exemplo-todo/prototipo/`.

## O que o vídeo traz

- A **jornada principal** do protótipo, na tela, em um MP4 de 1280x720.
- **Legendas** com o texto da narração, e um **cursor** que aparece e faz uma "onda" no clique (o vídeo do Playwright não mostra o mouse).
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

Em cerca de um minuto sai o `demo/demo.mp4`. O que acontece por baixo:

1. `npm run narracao` prepara a voz de cada trecho e mede a duração.
2. O Playwright grava a jornada, no **ritmo da voz**: cada passo espera o trecho terminar.
3. `scripts/montar-video.ts` mistura a voz no vídeo com o `ffmpeg`. A sincronia usa uma faixa magenta que a página pisca no início e que é cortada do vídeo final.

## O roteiro da narração

O texto fica em `e2e/narracao.ts`: um trecho por passo da jornada (cenário, protótipo, cada ato e o fecho). **O mesmo texto vira a legenda e a voz.** O cenário vem do "Problema" do pitch. Para mudar o que o vídeo diz, edite o texto lá e rode `npm run demo` de novo.

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

1. Abra `e2e/narracao.ts` e leia os trechos na ordem. Edite o texto se quiser falar do seu jeito.
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
| `demo/` | Não (ignorada pelo `.gitignore` do protótipo) | É gerada: o vídeo, a voz sintética e os tempos |
| `test-results/` | Não (ignorada pelo `.gitignore` da raiz) | Gravações brutas do Playwright |
| `narracao/` | **Sim, se você quiser** | São as **suas** gravações, insumo do vídeo |
| `projetos/<projeto>/videos/` | **Sim** | É onde fica o vídeo **aprovado** |

Para guardar uma versão do vídeo, copie `demo/demo.mp4` para `projetos/<projeto>/videos/` e registre no `projeto.json`, como artefato derivado do documento:

```json
{ "tipo": "video", "caminho": "videos/demo.mp4", "origem": "meu-projeto.md", "descricao": "Demonstração narrada do protótipo." }
```

## Cuidados

- **Vozes sintéticas têm termos de uso.** A voz do sistema (como a do macOS) pode ter restrições para redistribuir o áudio. Por isso o vídeo gerado **não vai para o repositório público do template**. Para publicar um vídeo, use a **sua voz**.
- **Dados fictícios.** O vídeo mostra o protótipo funcionando: nada de dados reais na tela.
- **Só o Chrome** é usado na gravação.
- **O vídeo é gravado em tempo real**: dura o tempo da narração (cerca de um minuto no exemplo).

## Se algo der errado

| Sintoma | O que fazer |
| :--- | :--- |
| `Não achei a gravação` ao montar | Rode `npm run demo` de novo; a montagem usa a última gravação em `test-results/` |
| `Não achei a marca de sincronia` | A gravação ficou incompleta; rode `npm run demo` de novo |
| Vídeo só com legendas e você queria voz | Veja a ordem dos caminhos acima: falta o áudio em `narracao/`, o `TTS_COMANDO` ou o macOS |
| `dividir` achou trechos a mais ou a menos | Ajuste `--pausa` e `--limiar`, ou grave um arquivo por trecho |
| Voz atrasada ou adiantada em relação à legenda | Não deveria acontecer; se acontecer, abra uma issue com o `demo/marcas.json` |
