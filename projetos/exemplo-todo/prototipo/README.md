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
- `npm test` roda os testes das regras e da API (Vitest), `npm run typecheck` confere os tipos e `npm run build` gera a versão para publicar.
- `npm run test:e2e`, `npm run demo` e `npm run capturas` rodam as **jornadas no navegador** (Playwright, veja abaixo). Elas sobem a própria API e a própria interface, em outras portas (3101 e 5273) e com outro banco, então **não atrapalham** quem está com o `npm run dev` aberto.

## Jornadas de validação (Playwright)

As jornadas em `e2e/` repetem, no navegador, o que a pessoa faz na tela. Usam o **Chrome que já está instalado** (sem baixar outro navegador).

| Comando | O que faz |
| :--- | :--- |
| `npm run test:e2e` | Roda as 5 jornadas: a principal (anotar, concluir e limpar), tarefa sem título, devolver uma tarefa feita, cancelar a confirmação e o botão desligado |
| `npm run demo` | Grava a jornada principal em um **vídeo de demonstração narrado**: `demo/demo.mp4` (1280x720). Veja "Vídeo de demonstração" abaixo |
| `npm run capturas` | Refaz as quatro imagens dos slides, em `../imagens/`, a partir da mesma jornada. Rode de novo sempre que a tela mudar |
| `npm run capturas:mobile` | As mesmas quatro imagens com a **tela de um celular** (390x844, densidade 3x), em `../imagens/*-mobile.png`. Mostram a página inteira rolada, porque no layout estreito as colunas ficam uma embaixo da outra |
| `npm run demo:vertical` | O mesmo vídeo narrado em **9:16** (1080x1920), com a interface no layout de celular: `demo/demo-vertical.mp4`. `npm run demo:todos` gera os dois vídeos |

Os resultados em `test-results/` e o vídeo em `demo/` não vão para o git.

### Vídeo de demonstração (`npm run demo`)

O vídeo conta o cenário do pitch e mostra a jornada, com **legendas**, um **cursor** que aparece e faz uma "onda" no clique, e **voz**. Leva cerca de um minuto para ser gravado e usa o `ffmpeg` para montar o MP4.

- **O roteiro da narração** é `e2e/narracao.ts`: um trecho por passo (cenário, protótipo, anotar, andar, limpar e fim). O mesmo texto vira a legenda e a voz. Edite o texto para mudar o que o vídeo diz.
- **A voz** vem, nesta ordem: de um **áudio seu** em `narracao/<trecho>.wav` (ou `.mp3`, `.m4a`, `.aiff`, `.ogg`), de um **programa de voz sintética à sua escolha** (variável `TTS_COMANDO`, o caminho no Windows e no Linux), da **voz em português do macOS** (`say`, a `Luciana`), ou **nenhuma**: nesse caso o vídeo sai só com legendas. O ritmo da jornada acompanha a duração de cada trecho.
- **A sua voz, de uma vez só:** grave tudo em `narracao/voz.wav`, lendo os trechos na ordem e com pelo menos um segundo de silêncio entre eles, e rode `npm run dividir`. Ele corta um arquivo por trecho. Depois, `npm run demo`.
- **A confirmação do navegador** não aparece em gravações, então a pergunta do botão de limpar vai na legenda.
- **A sincronia** é feita por uma faixa magenta que a página pisca no começo e que é cortada do vídeo final.
- **Sem o `ffmpeg`**, o vídeo (só com legendas) fica em `demo/demo.webm`.
- A voz sintetizada do sistema serve para esboçar; para um vídeo de verdade, grave a sua voz nos arquivos de `narracao/`.
- **Precisa do `ffmpeg`.** O passo a passo completo (instalação, gravar a própria voz, Windows e Linux, o que vai para o git) está em `guias/video-demonstracao.md`, na raiz do repositório.

## O que o protótipo valida

- **O fluxo:** anotar uma tarefa, concluir, voltar para "A fazer" e limpar o que está feito.
- **As regras:** o título é obrigatório e vai até 120 caracteres; a tarefa pode mudar de etapa nos dois sentidos; ao concluir, guarda-se quando; **limpar remove só o que está em "Feito"**. Tudo em `src/domain/rules.ts`.
- **O botão de limpar:** pede confirmação e diz quantas tarefas vão embora, porque não há como desfazer. Fica desligado quando não há nada feito.
- **A ordem:** "A fazer" mostra as mais antigas primeiro; "Feito", as concluídas mais recentemente primeiro.

## O que ele não valida

Desempenho com muitas tarefas, várias pessoas usando ao mesmo tempo, login, sincronização entre aparelhos e acessibilidade completa. Isso só aparece em um produto de verdade. As jornadas cobrem o fluxo no Chrome, e não outros navegadores.

## Arquitetura (para facilitar a troca)

| Camada | Onde | Observação |
| :--- | :--- | :--- |
| Regras do negócio | `src/domain/rules.ts` | Funções puras em TypeScript, sem banco nem tela. Testadas |
| Contrato de dados | `TodoGateway` em `src/domain/board.ts` | A tela só conhece este contrato |
| SQLite | `server/sqliteRepository.ts` | Uma implementação do contrato. Chaves UUID e etapas como enumeração, para facilitar a migração |
| API HTTP | `server/app.ts` | Só conhece o contrato |
| Interface | `src/` | Cliente HTTP (`src/api.ts`) que cumpre o mesmo contrato |
| Design system | `src/ui/` e `src/tokens.css` | Componentes e tokens, descritos abaixo |

Para trocar o banco, escreve-se outra implementação de `TodoGateway`, e as telas não mudam.

## Design system (mini)

O protótipo tem um design system pequeno, em duas partes, e **a identidade vem do tema** do projeto (`temas/exemplo-todo/`), a mesma dos documentos e dos slides.

| Parte | Onde | O que faz |
| :--- | :--- | :--- |
| **Tokens** | `src/tokens.css` | Cores e fonte, **gerados do tema** por `npm run tokens` (`tools/tema-tokens.js`). Não se edita à mão |
| **Componentes** | `src/ui/` | `Botao` (variantes padrão, primário, perigo e discreto), `Campo` (rótulo, campo e ação ao lado), `Cartao` (bloco e item), `EstadoVazio` e `Alerta`. Só usam os tokens: nenhuma cor escrita à mão |
| **Layout** | `src/styles.css` | Só a organização da página (grade e margens) |

- **Trocar de marca** é trocar o `"tema"` no `projeto.json` do projeto e rodar `npm run tokens`. Os componentes não mudam.
- **Cor de ação com contraste garantido:** o texto branco de um botão preenchido precisa de 4,5:1 com o fundo. O gerador escurece a cor do tema só até chegar lá (aqui, de `#1F8A70`, que tem 4,26:1, para `#1E846B`, que tem 4,60:1) e avisa se algum par de cores do tema fica abaixo disso.
- **Acessibilidade:** foco visível em tudo que se opera, rótulo sempre visível no campo, erro anunciado a leitores de tela (`role="alert"`) e alvo de toque de pelo menos 44 px no celular (ou em tela estreita).
- `npm run tokens:conferir` (que o `npm run build` já roda) falha se o `tokens.css` não estiver em dia com o tema.

## Dados de exemplo

`server/sample.ts` tem 8 tarefas fictícias: 5 em "A fazer" e 3 em "Feito". As três feitas existem para você experimentar o botão **Limpar feitas**.

## Segurança e versões

- **Nenhum segredo.** O protótipo não usa serviço externo, e a IA é simulada. As variáveis de ambiente aceitas (portas, caminho do banco) estão em `.env.example`, e nenhuma é segredo. Não crie um `.env` com chave de serviço: se um dia for preciso, ela entra só em tempo de execução (veja `guias/seguranca.md`, na raiz do repositório).
- **Verificação:** `npm run verificar` procura segredos nos arquivos e confere o `.gitignore`, o lockfile e o `engines`. `npm run verificar:rede` também consulta o calendário do Node e roda `npm audit` e `npm outdated`.

| O que | Versão | Verificado em |
| :--- | :--- | :--- |
| Node (testado) | 26.5.1 (o `engines` exige 22.13 ou mais novo) | 27/10/2026 |
| `npm audit` | nenhuma vulnerabilidade conhecida | 27/10/2026 |
| Dependências | todas na última versão (React 19, Vite 8, Vitest 5, TypeScript 7) | 27/10/2026 |

O `verificar:rede` avisa que o Node 26 ainda é "Current" (vira LTS em 28/10/2026), e que o `esbuild` e o `fsevents` rodam script na instalação, o que é esperado.

## Pendências conhecidas

- Não há como editar o título nem apagar uma tarefa só: são decisões de escopo do pitch (fora de escopo).
- A confirmação do botão de limpar usa a caixa do navegador (`window.confirm`), que é simples e basta para validar o fluxo.
