# Guia: app web (a stack do protótipo)

A stack padrão para construir um **protótipo web** (ou um software web que vai evoluir) a partir de um projeto deste repositório. É a stack que o `exemplo-todo` usa, e é a irmã do `guias/app-mobile.md`: diz o que usar, como organizar as pastas e em que ordem fazer as coisas. Este guia complementa as seções "Protótipos", "Design system do protótipo" e "Segurança e privacidade" do `AGENTS.md`, que trazem as **regras**; aqui estão o porquê e o passo a passo. Ele é uma **sugestão padrão**: a pessoa pode trocá-la, e o `AGENTS-extra.md` pode registrar outra. Vale para os dois nomes do artefato de software, "protótipo" e "software": a palavra é de quem desenvolve a ideia, e a stack é a mesma.

> **Em uma frase:** uma interface em React, uma API Node pequena e um banco SQLite embutido no Node, separados por um **contrato de dados**, com as regras do negócio em funções puras e testadas, para validar a ideia rápido e poder trocar qualquer peça depois.

### Por que essa stack

- **Validar antes de construir.** O protótipo mostra o fluxo, as regras e as telas antes de investir na plataforma de destino. Se a ideia não se sustentar, o custo de jogar fora é baixo.
- **Feita para trocar.** A tela só conhece o contrato; o banco e a API são implementações dele. Trocar o banco, a API ou até o front-end é escrever outra implementação, sem reescrever as regras.
- **Um só comando para rodar.** `npm run dev` sobe a API e a interface juntas.
- **Sem dependência nativa.** O SQLite vem embutido no Node (`node:sqlite`, Node 22.13 ou mais novo), então não há nada para compilar nem para instalar além dos pacotes.
- **Poucas dependências.** Menos coisa de terceiros é menos superfície de risco e menos atualização para acompanhar.

#### Como se relaciona com o app mobile

O protótipo web **valida a ideia** e é feito para ser trocado. O app nativo (ver `guias/app-mobile.md`) é o software que vai ao celular e evolui. As regras validadas aqui, em `src/domain/`, são o que vira o **núcleo em Rust** de lá: por isso é importante que fiquem como funções puras, sem banco nem tela.

#### Quando usar, e quando não usar

| Use esta stack quando | Não use quando |
| :--- | :--- |
| Quer **validar um fluxo, regras e telas** antes de decidir a plataforma de destino | O produto precisa de recursos nativos do celular (notificações, alarmes, segundo plano): veja `guias/app-mobile.md` |
| Precisa de algo que a pessoa clique e veja funcionando, para testar com quem vai usar | A ideia ainda é só texto: um pitch e uma apresentação bastam |
| Quer um software web simples, local, com poucos usuários | Vai expor o app na internet com dados reais: hospedar é uma decisão à parte, num pitch próprio (ver "O que valida e o que não valida") |
| A equipe conhece JavaScript e TypeScript | A equipe já tem outra stack definida (registre no `AGENTS-extra.md`) |

### A stack

| Camada | Padrão | Por quê |
| :--- | :--- | :--- |
| Interface | **React + Vite + TypeScript** | Base comum de front-end, rápida de rodar e de trocar |
| API | **Node**, com `tsx` no desenvolvimento | Uma API própria e pequena, que só conhece o contrato de dados; sem etapa de compilação |
| Banco | **SQLite** pelo `node:sqlite` embutido no Node | Sem dependência nativa; exige Node 22.13 ou mais novo (`engines` no `package.json`) |
| Testes | **Vitest** e `tsc --noEmit` | As regras do negócio e a API são o que mais precisa de teste; os tipos pegam o resto |
| Jornadas | **Playwright**, com `channel: "chrome"` | Repete o fluxo na tela usando o Chrome já instalado, sem baixar outro navegador |
| Desenvolvimento | **concurrently** | Sobe a API (porta 3001) e a interface (porta 5173) com um comando |
| Design system | **Tokens gerados do tema** (`src/tokens.css`) e componentes em `src/ui/` | Cor, fonte, forma, espaço, tipo e movimento são os mesmos dos documentos e dos slides |

Versões testadas no `exemplo-todo` (**exemplo**, não obrigação; confirme e registre as do seu protótipo):

- React e React DOM 19.3, Vite 8.3 com `@vitejs/plugin-react` 6.1, TypeScript 7.0, Vitest 5.0
- Playwright 1.64, `tsx` 4.23, `concurrently` 10.0
- Node 26.5.1 testado, com `engines` exigindo 22.13 ou mais novo

### Estrutura de pastas

Dentro do projeto, o protótipo é uma pasta com `package.json` **próprio** (não misture com o `tools/`). O exemplo:

- `projetos/<projeto>/prototipo/`
    - `package.json` e `package-lock.json` — scripts, `engines` e as dependências travadas
    - `vite.config.ts` — o proxy de `/api` e as portas, trocáveis por variáveis de ambiente
    - `playwright.config.ts` — as jornadas, em portas e com um banco só delas
    - `tsconfig.json` e `index.html`
    - `.env.example` — só os **nomes** das variáveis, sem valor
    - `src/`
        - `domain/` — as regras do negócio (`rules.ts`), os tipos, o contrato (`board.ts`) e os testes (`rules.test.ts`)
        - `ui/` — os componentes do design system (`Botao`, `Campo`, `Cartao`, `Mensagens`) e o catálogo (`Catalogo.tsx`)
        - `components/` — as peças específicas da tela
        - `api.ts` — o cliente HTTP, que cumpre o mesmo contrato
        - `tokens.css` — **gerado** do tema; não se edita à mão
        - `App.tsx`, `main.tsx` e `styles.css`
    - `server/`
        - `app.ts` — a API HTTP, que só conhece o contrato
        - `sqliteRepository.ts` — a implementação do contrato em SQLite
        - `sample.ts` — os dados de exemplo, fictícios
        - `index.ts` — o arranque (porta, host e caminho do banco)
        - `todo.test.ts` — os testes da API
    - `e2e/` — as jornadas, as capturas e a demonstração em vídeo
    - `scripts/` — a narração e a montagem do vídeo, e o PDF do catálogo
    - `data/` — o banco local, fora do git
    - `README.md`

### Arquitetura feita para trocar

| Camada | Onde | Regra |
| :--- | :--- | :--- |
| Regras do negócio | `src/domain/` | **Funções puras**, sem banco nem tela, com testes |
| Contrato de dados | `src/domain/` | Uma interface (no exemplo, `TodoGateway`); a tela só conhece ela |
| Banco | `server/` | Implementação SQLite do contrato; trocar de banco é escrever outra |
| API HTTP | `server/` | Só conhece o contrato, nunca o SQLite |
| Interface | `src/` | O cliente HTTP (`api.ts`) cumpre o mesmo contrato |
| Dados de exemplo | `server/sample.ts` | **Fictícios**, com casos que mostram as regras |

- **IA atrás de uma interface**, com uma versão **simulada** por regras: nenhum dado vai a um modelo de verdade, e a pessoa aceita ou ignora a sugestão.
- **Facilite a migração** para a plataforma de destino:
    - chaves **UUID**;
    - estados e categorias como **enumerações** (no exemplo, `StageId`);
    - consultas simples, com filtro e paginação;
    - a noção de **papel** e de **dono** do registro desde o início;
    - poucas chamadas, grandes, em vez de muitas pequenas.

### Passo a passo: do pitch ao protótipo rodando

Quem digita os comandos é o assistente, que explica cada passo em uma frase.

1. **Ler o pitch** e listar as regras do negócio: o que é permitido, o que é recusado e o que muda de estado. Cada regra vira um teste.
2. **Criar a pasta** `prototipo/` e o `package.json`, com `"type": "module"`, o `engines` (`node >=22.13`) e os scripts da seção seguinte. Instale com `npm install` e versione o `package-lock.json`.
3. **Domínio puro, com os testes primeiro.** Escreva as regras em `src/domain/` como funções sem efeito colateral e os testes em Vitest. Só depois pense em banco ou tela.
4. **Contrato.** Defina a interface de acesso a dados (o `XGateway`), com um tipo de resultado que distingue sucesso de falha (`ok`, `erro`, `codigo`).
5. **SQLite e dados de exemplo.** Implemente o contrato em `server/`, crie o banco na primeira execução (em `data/`) e semeie os dados fictícios de `server/sample.ts`. Tenha uma forma de **reiniciar** os dados de exemplo.
6. **API só local.** É um protótipo sem login, então:
    - escuta só em `127.0.0.1`;
    - confere o cabeçalho `Host` e recusa o que não for `localhost`, `127.0.0.1` ou `[::1]` (protege de páginas de outros sites, o DNS rebinding);
    - exige `content-type: application/json` nas escritas (o navegador pede permissão antes de uma chamada de outro site);
    - limita o tamanho do corpo (no exemplo, 16 KB);
    - nunca devolve mensagem interna no erro 500: registra no console e responde algo genérico.
   Escreva os testes da API, incluindo esses casos de recusa.
7. **Interface.** Gere os tokens com `npm run tokens` e monte as telas **só com os componentes de `src/ui/`** e os tokens: sem `<button>` solto e sem cor, raio, espaço ou duração escritos à mão. Crie um componente novo só quando uma tela precisar dele.
8. **Jornadas com Playwright.** Cada jornada sobe a própria API e a própria interface, em portas e com um banco só dela (no exemplo, 3101, 5273 e `data/e2e.db`), para não atrapalhar quem está com o `npm run dev` aberto.
9. **Verificar.** Rode `npm run verificar` (segredos, `.gitignore`, lockfile e `engines`) e, antes de declarar o protótipo pronto, `npm run verificar:rede` (calendário do Node, `npm audit` e `npm outdated`). Vulnerabilidade alta ou crítica é falha; o resto é aviso para ler.
10. **README do protótipo**, nesta ordem: como rodar, as jornadas, o vídeo de demonstração (se houver), o que valida, o que não valida, arquitetura, design system, dados de exemplo, segurança e versões (Node testado e a data) e pendências. Diga no topo que **todos os dados são fictícios**.
11. **Registrar no `projeto.json`**, em `artefatos`, com `"tipo": "prototipo"` (ou `"software"`), o `"caminho"`, a `"origem"` (o documento de onde nasceu, em geral o pitch) e uma descrição.

### Scripts do `package.json`

Os do `exemplo-todo`:

| Script | O que faz |
| :--- | :--- |
| `dev` | Sobe a API e a interface juntas (`concurrently`) |
| `dev:api` e `dev:web` | Sobem uma só das duas |
| `build` | Confere os tokens, os tipos e gera o build da interface |
| `typecheck` | `tsc --noEmit` |
| `test` | Vitest: as regras do domínio e a API |
| `test:e2e` | As jornadas de validação (Playwright), sem vídeo |
| `tokens` e `tokens:conferir` | Geram o `src/tokens.css` a partir do tema, ou falham se ele estiver desatualizado |
| `capturas` e `capturas:mobile` | Refazem os prints usados nos slides, na tela larga e na de celular |
| `demo`, `demo:vertical` e `demo:todos` | Gravam a jornada narrada em vídeo, em 16:9, em 9:16 ou nos dois |
| `narracao` e `dividir` | Geram a narração e separam uma gravação única da voz nos trechos |
| `quadros` e `ds:pdf` | Apoios do vídeo e do catálogo do design system em PDF |
| `verificar` e `verificar:rede` | Conferem segredos e versões; a segunda consulta também a rede |

### Segurança, design system e vídeo

**Segurança.** As regras são as do `AGENTS.md`: só dados fictícios, nenhum segredo em arquivo (nem em `.env` com valor real) e IA simulada. O `guias/app-seguranca.md` explica o porquê, o passo a passo e o que fazer se algo vazar; aqui vale lembrar que a API local acima faz parte dessa defesa.

**Design system.** Os tokens saem do tema do projeto e os componentes ficam em `src/ui/`, com contraste de pelo menos 4,5:1, foco visível e alvo de toque de pelo menos 44 px no celular. O `guias/app-design-system.md` explica o modelo de camadas, o Atomic Design e o catálogo (`/ds`, só no desenvolvimento).

**Vídeo de demonstração.** Se a pessoa pedir uma demonstração, a jornada do Playwright é gravada, narrada e montada com cartões animados. O passo a passo (instalação, voz própria, Windows e Linux) está em `guias/app-video-demonstracao.md`. Não grave sem pedir.

### O que valida e o que não valida

- **Valida:** o fluxo, as regras, as telas e a ajuda da IA.
- **Não valida:** desempenho, limites e cotas, licenças, segurança por papel e governança da plataforma de destino. Isso só aparece lá, e por isso o risco da troca deve ser tratado cedo, com um pitch próprio.
- **Hospedar** (colocar o app na internet, com login e dados reais) não faz parte do protótipo. É uma decisão à parte, tratada num pitch próprio. A definir caso a caso.

### Pendências conhecidas do padrão

| Pendência | Situação |
| :--- | :--- |
| ESLint, Prettier e integração contínua (CI) | A definir, caso a caso |
| Login e segurança por papel | Fora do protótipo; A definir na plataforma de destino |
| Hospedagem | A definir, num pitch próprio |

### Fontes

- O exemplo completo: `projetos/exemplo-todo/prototipo/` (e o `README.md` dele)
- `guias/app-mobile.md`, `guias/app-seguranca.md`, `guias/app-design-system.md` e `guias/app-video-demonstracao.md`
- Node.js, calendário de versões: https://nodejs.org/en/about/previous-releases
- Playwright: https://playwright.dev
- Vitest: https://vitest.dev
