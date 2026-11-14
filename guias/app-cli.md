# Guia: aplicação de linha de comando (CLI)

O padrão para construir uma **CLI** (uma aplicação de linha de comando) que conversa com um sistema (uma API, um banco, um serviço) ou que automatiza um processo da equipe. É irmão dos guias `guias/app-web.md` e `guias/app-mobile.md`: diz o que usar, como organizar as pastas e em que ordem fazer as coisas. Este guia complementa as seções "Protótipos" e "Segurança e privacidade" do `AGENTS.md`, que trazem as **regras**; aqui estão o porquê e o passo a passo. Ele é uma **sugestão padrão**: a pessoa pode trocá-la, e o `AGENTS-extra.md` pode registrar outra.

> **Em uma frase:** a CLI é escrita em **Rust** (um binário único, sem runtime para instalar), com subcomandos claros, saída para pessoas e para máquinas, as regras em funções puras e o sistema externo atrás de um contrato; **Node/TypeScript** é a alternativa para scripts curtos.

### Por que Rust como padrão

- **Um binário só.** Quem recebe a CLI não instala Node, Python nem pacotes: copia o executável e usa.
- **Rápido para iniciar e para rodar**, o que importa numa ferramenta chamada o tempo todo, em scripts e na integração contínua.
- **Tipos fortes.** Erros de uso e de dados aparecem na compilação, não na frente de quem executa.
- **Mesmo núcleo, outras interfaces.** As regras escritas em Rust podem ser usadas por um app de celular (ver `guias/app-mobile.md`) e por um app de terminal interativo (TUI, ver `guias/app-tui.md`). A CLI é mais uma interface fina sobre o mesmo núcleo.

#### Quando Node basta

**Node/TypeScript** é a alternativa quando o script é curto, fala com a API de um protótipo web (ver `guias/app-web.md`) ou vive junto das `tools/` do template, onde o Node já está instalado e as ferramentas já são escritas assim (`tools/novo.js`, `tools/build.js`, `tools/verificar.js`). Se o script cresce, é distribuído a quem não tem Node ou precisa compartilhar regras com um app, migre para Rust.

### Quando usar, e quando não usar

| Use uma CLI quando | Não use quando |
| :--- | :--- |
| Um processo se repete e a equipe quer rodá-lo igual, por comando ou na integração contínua | A tarefa roda **uma vez só**: um script solto basta |
| Precisa falar com uma API, um banco ou um serviço de forma repetível | A pessoa precisa de uma tela interativa, com navegação e atualização ao vivo: é um TUI (`guias/app-tui.md`) |
| A saída precisa ser lida por pessoas e por outros programas (`--json`) | Quem vai usar não é técnico e precisa de botões: veja `guias/app-web.md` |
| Quer um binário simples de distribuir | A equipe não tem como manter Rust (A definir: avaliar; Node pode bastar) |

### A stack

| Camada | Rust (padrão) | Node/TypeScript (alternativa) |
| :--- | :--- | :--- |
| Argumentos | `clap`, com `derive` | `util.parseArgs` do Node, sem dependência |
| Erros | `anyhow` (na borda) e `thiserror` (no domínio) | `Error` com mensagem clara |
| Saída JSON | `serde` e `serde_json` | `JSON.stringify` |
| HTTP | `reqwest` com `rustls` (sem OpenSSL do sistema) | `fetch` nativo |
| Configuração | Variáveis de ambiente e um arquivo de configuração na pasta do usuário, via `directories` | `process.env` e, se preciso, um arquivo de configuração |
| Testes | `cargo test` e `assert_cmd` (roda o binário e confere saída e código) | `node:test` ou Vitest |
| Versões | A definir; registre no README as versões testadas e a data | A definir; o piso do Node fica no `engines` do `package.json` |

### Convenções de interface

Seguem as boas práticas do Command Line Interface Guidelines (ver "Fontes").

- **Subcomandos com verbo**, no infinitivo: `listar`, `criar`, `sincronizar`. O nome do programa vem primeiro (`minha-cli listar`).
- **Ajuda e versão:** `--ajuda` (e `--help`) e `--versao` (e `--version`). Sem argumentos, mostre a ajuda. Cada subcomando tem a sua, com um exemplo.
- **Saída para pessoas por padrão**, legível e curta; `--json` para máquinas, com campos estáveis. O resultado vai para o **stdout** e as mensagens de erro e de progresso, para o **stderr**, para que `minha-cli listar --json | outro-programa` funcione.
- **Códigos de saída.** Siga o que as `tools/` já fazem: **0** é sucesso e **1** é erro de uso ou de validação (nome inválido, arquivo não encontrado, conferência que falhou). O `tools/verificar.js` usa **2** quando a pasta indicada não existe. Para a CLI, reserve **2 ou mais** para erros de sistema (rede fora do ar, serviço recusou, sem permissão) e **documente a lista no README**.
- **O que escreve tem `--simular` (ou `--dry-run`)**: mostra o que faria, sem fazer. Se simular deve ser o padrão, avalie caso a caso. Evite `--sim`, que em português se confunde com "sim" de confirmar.
- **Confirmação antes de apagar**, com a opção `--confirmar` (ou `--yes`) para scripts. Nada de apagar em silêncio.
- **Idempotência quando possível:** rodar duas vezes dá o mesmo resultado, sem duplicar nem falhar à toa.
- **Cor só em terminal.** Não use cor quando a saída não é um terminal (um pipe, um arquivo) e respeite a variável `NO_COLOR`.
- **Mensagens de erro úteis:** o que deu errado, por quê e o que fazer, em uma ou duas linhas e em português, como as de `tools/novo.js` (por exemplo, "O nome do projeto vai em minúsculas, sem acentos e com hífen").

### Arquitetura feita para trocar

A mesma ideia do protótipo web (ver "Arquitetura: feita para trocar" no `AGENTS.md`): separar o que muda do que fica.

| Camada | Regra |
| :--- | :--- |
| Argumentos e saída | Só leem os argumentos, chamam um comando e formatam o resultado. Nenhuma regra aqui |
| Comandos | Um por subcomando; juntam a regra e o cliente |
| Domínio | **Funções puras**, sem rede nem arquivo, com testes: validações, cálculos, montagem do que será enviado |
| Contrato do sistema externo | Uma interface (`trait` em Rust, `interface` em TypeScript), por exemplo `Sistema`, com as operações de que a CLI precisa |
| Implementação real | Fala com a API, o banco ou o serviço de verdade |
| Implementação simulada | Responde com dados fictícios, em memória: serve aos testes e a rodar **sem rede** (por exemplo, com `--simulado` ou uma variável de ambiente) |

Trocar o sistema (outra API, outra versão) é escrever **outra implementação** do contrato, sem mexer nas regras nem nos comandos.

### Estrutura de pastas

Em Rust:

- `Cargo.toml` e `Cargo.lock` (versionado)
- `src/main.rs` — só os argumentos, a chamada ao comando e o código de saída
- `src/comandos/` — um arquivo por subcomando
- `src/dominio/` — as regras, em funções puras
- `src/cliente/` — o contrato do sistema externo, a implementação real e a simulada
- `tests/` — testes que rodam o binário com `assert_cmd`
- `README.md`

Em Node/TypeScript:

- `package.json` próprio, com `engines`, e `package-lock.json` (versionado)
- `src/cli.ts` — só os argumentos e o código de saída
- `src/comandos/`, `src/dominio/` e `src/cliente/`, com o mesmo papel acima
- `test/` — testes com `node:test` ou Vitest
- `README.md`

### Segurança

Valem as regras do `AGENTS.md` e do `guias/app-seguranca.md`; aqui, o que é próprio de uma CLI.

- **Segredos só pelo ambiente ou por um gerenciador de segredos**, por exemplo `op run -- minha-cli sincronizar`. Nunca em arquivo (nem em `.env` com valor real) e **nunca em argumento de linha de comando**, porque ele fica no histórico do shell e na lista de processos.
- **Nunca imprima o segredo**, nem em mensagem de erro, nem em modo detalhado (`--verbose`). Se a variável falta, avise o **nome** dela e saia com erro.
- **Menor poder possível:** uma chave própria da CLI, só com as permissões de que ela precisa. O que só lê não recebe chave que escreve.
- **Dados reais só com decisão da pessoa**, tratada em um pitch próprio. Exemplos, testes e a implementação simulada usam **dados fictícios**.
- **Lockfile versionado**, poucas dependências, de fonte conhecida, e versões em suporte (confirme na documentação oficial, não de memória). Antes de entregar, confira com `node tools/verificar.js <pasta>`.

### Distribuição

- **Instalação local:** `cargo install --path .` (Rust). Em Node, `npm link` ou rodar com `node` direto, conforme o caso.
- **Binários por plataforma** (macOS, Linux, Windows): A definir, incluindo como e onde publicar.
- **Versão no `--version`**, vinda do `Cargo.toml` (ou do `package.json`), para que um relato de problema diga qual versão rodou.
- **README** com: instalação, exemplos de uso (um por subcomando), a lista de **códigos de saída**, as variáveis de ambiente que a CLI lê (só os **nomes**, em um `.env.example`), a versão do Rust ou do Node testada e a data, e o que a CLI **não** faz.

### Passo a passo, do pitch à CLI pronta

1. **Escreva o pitch** (`roteiros/pitch.txt`): o problema, para quem, o apetite e o que fica de fora. Diga qual sistema a CLI toca e o que ela faz nele.
2. **Decida Rust ou Node** e registre no documento a decisão e a data. Sem motivo para Node, vale Rust.
3. **Liste os subcomandos** e, para cada um, os argumentos, o que sai e os códigos de saída. Escreva isso antes do código; vira o README.
4. **Crie o projeto** (`cargo new` ou `npm init`), com o lockfile e o `.gitignore` (`target/`, `node_modules/`, segredos).
5. **Escreva o domínio** em funções puras, com testes.
6. **Defina o contrato** do sistema externo e escreva a **implementação simulada**, com dados fictícios.
7. **Escreva os comandos** sobre o contrato simulado e teste o binário inteiro (`assert_cmd` ou `node:test`): saída, `--json`, códigos de saída e erros.
8. **Escreva a implementação real**, lendo o segredo só do ambiente, e teste com uma chave de teste, de menor poder.
9. **Revise as convenções:** `--ajuda`, `--versao`, stdout e stderr, `--simular` no que escreve, confirmação antes de apagar e `NO_COLOR`.
10. **Rode as verificações:** os testes, `node tools/verificar.js <pasta>` e, se for o caso, `--rede`.
11. **Escreva o README** e registre a CLI como artefato no `projeto.json`, com a `origem` (o pitch).
12. **Mostre a quem vai usar**, ajuste e só então distribua.

### Fontes

- clap: https://docs.rs/clap
- Command Line Interface Guidelines: https://clig.dev
- `util.parseArgs` (Node): https://nodejs.org/api/util.html#utilparseargsconfig
- NO_COLOR: https://no-color.org
- Outros guias do template: `guias/app-web.md`, `guias/app-mobile.md`, `guias/app-tui.md` e `guias/app-seguranca.md`
