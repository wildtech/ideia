# Guia: app de terminal (TUI)

A stack padrão para construir um **app de terminal** com interface de tela cheia (TUI, de "text user interface") a partir de um projeto deste repositório. Ele complementa o `guias/app-mobile.md` (núcleo em Rust compartilhado com os apps de celular) e o `guias/app-cli.md` (ferramenta de linha de comando, sem tela cheia), e as seções "Protótipos" e "Segurança e privacidade" do `AGENTS.md`. É uma **sugestão padrão**: a pessoa pode trocá-la, e o `AGENTS-extra.md` pode registrar outra.

> **Em uma frase:** um programa de terminal em **Rust**, com `ratatui` para desenhar a tela, que é só uma **interface fina** sobre o mesmo núcleo de regras, banco e sincronização dos outros apps; o terminal é sempre restaurado ao sair.

### Por que um TUI, e quando usar

- **Rápido de abrir e de usar**, sem mouse, para quem vive no terminal.
- **Bom para desenvolver e testar as regras**: não precisa de simulador, emulador nem navegador.
- **Funciona em servidores e conexões remotas** (SSH), onde não há tela gráfica.
- **Barato de manter**: uma interface a mais sobre o mesmo núcleo, sem reescrever regra de negócio.

| Use quando | Não use quando |
| :--- | :--- |
| O público vive no terminal, ou o app roda em máquina sem tela | O público é não técnico e espera instalar e clicar |
| Já existe um núcleo em Rust e você quer outra interface barata | Você só quer validar um fluxo: use o protótipo web |
| Quer conferir as regras rápido, sem simulador | O app precisa tocar ou avisar com o programa fechado: o terminal não agenda nada no sistema |
| O fluxo é interativo (listas, teclas, atualização na tela) | O fluxo é de um comando só, com resultado em texto: use uma ferramenta de linha de comando (`guias/app-cli.md`) |

### A stack

| Camada | Padrão | Observações |
| :--- | :--- | :--- |
| Linguagem | **Rust** | Mesma do núcleo. Defina o `rust-version` mínimo no `Cargo.toml` |
| Interface | **ratatui** | Desenha a tela em um buffer. Reexporta o **crossterm** (teclado e terminal): use `ratatui::crossterm`, sem declarar o crossterm à parte |
| Pasta de dados | `directories` | Acha a pasta de dados do usuário em cada sistema |
| Relógio local | `chrono`, só com o recurso `clock` | Só para a hora e o fuso locais, passados ao núcleo; se o núcleo não precisar de fuso, dispense |
| Testes | `cargo test`, `ratatui::backend::TestBackend` e `tempfile` | O `tempfile` cria pastas temporárias de banco nos testes |
| Versões | Registradas no README do app | Exemplo de versões testadas: ratatui 0.30.2 (com crossterm 0.29), directories 6.0, chrono 0.4.45, tempfile 3.27 e Rust 1.100.0 |

### Duas formas de ligar ao núcleo

#### Como membro do workspace de um app mobile

É o caso do `guias/app-mobile.md`: a crate `tui/` entra no **mesmo workspace** do núcleo e depende dele por caminho (`path = "../core"`), chamando-o **direto como crate Rust, sem UniFFI** (não há fronteira de linguagem a atravessar). Usa o **mesmo banco** e a **mesma sincronização**: um registro criado no terminal aparece no celular, e o contrário também. As regras de tempo seguem iguais: o `agora` é passado ao núcleo, que não lê o relógio.

#### TUI sozinho

Sem app mobile, o TUI tem um **núcleo próprio**, com a mesma separação: **domínio puro** (entidades e regras, sem banco nem tela), **banco** (SQLite, atrás de um contrato) e **contrato de dados** (traits). A interface só conhece o contrato. Se um app mobile ou web surgir depois, o núcleo já está pronto para ser compartilhado.

### Estrutura de pastas

Dentro da crate `tui/`, em `src/`:

- `main.rs` — os argumentos, o terminal e o laço principal
- `app.rs` — o **estado** da tela (item selecionado, modo de entrada, aviso); puro e testável, sem desenhar nada
- `ui.rs` — o **desenho**: recebe o estado e o que o núcleo devolveu e escreve no quadro
- `teclas.rs` — o **mapa de teclas**: transforma a tecla (conforme o modo) em uma ação

A regra de ouro é a do mobile: **a interface é fina**. Ela pede dados ao núcleo e mostra; a decisão de negócio fica no núcleo.

### O laço principal

A cada volta:

1. Lê o `agora` e o fuso local.
2. Chama o `tick(agora)` do núcleo (que devolve os eventos, como "fim do foco") e trata os avisos.
3. Pede ao núcleo a **tela** (o que há para mostrar), atualiza o estado e **desenha**.
4. Espera uma tecla por um tempo curto (`poll` de 250 ms, exemplo). Se veio uma, o mapa de teclas a traduz em ação; a ação vira um comando ao núcleo, e um erro do núcleo vira mensagem na tela.

Só reaja a teclas **pressionadas** (ignore soltar e repetir). Terminais diferentes mandam eventos diferentes.

### Teclas e ajuda na tela

- Mapeie **teclas simples**, com alternativas para quem usa setas e para quem usa `j`/`k`. Peça **confirmação** antes de apagar (`s`/`n`).
- A tecla **`?`** abre uma **ajuda na tela** com todas as teclas. `q` e `Ctrl+C` saem.
- Uma ação que não vale no momento não faz nada, em vez de dar erro.

### Terminal sempre restaurado

Um TUI que fecha mal deixa o terminal do usuário quebrado (sem eco, em tela alternativa). Por isso:

- **Restaure ao sair**, por qualquer caminho: saída normal, erro e **pânico**.
- Instale um **gancho de pânico** (`panic hook`) que restaura o terminal antes de mostrar a mensagem do pânico.
- O ratatui oferece `ratatui::init()` e `ratatui::restore()` para isso.

### Avisos e limites

- **Aviso:** o **sino do terminal** (`\x07`, escrito na saída) e uma mensagem na tela por alguns segundos.
- **Sem notificação do sistema** e **nada roda com o app fechado**: o terminal não agenda nada. Se o núcleo espera um notificador (como no mobile), entregue um que aceita as chamadas e não faz nada.
- **Ao abrir, mostre o que ficou pendente**: o que venceu enquanto o app estava fechado deve aparecer (por exemplo, uma pergunta sobre o que terminou). Quem espera um alarme com o programa fechado deve usar o app de celular.

### Testes

- **As regras** são testadas no núcleo (`cargo test`), não no TUI.
- **O estado** (`app.rs`) é puro: teste a seleção, os modos e os avisos sem terminal.
- **A tela** é testada com `TestBackend`: desenha em memória e compara o texto com o esperado (**snapshot**). Use um instante fixo e dados fictícios para o resultado ser repetível.
- **Uma opção como `--uma-tela`**: desenha **uma vez**, em tamanho fixo, com hora fixa e dados de exemplo, imprime o texto e sai. Serve para conferir a tela (e para o assistente ver o resultado) **sem terminal interativo**.
- Para a conferência final, rode o app de verdade em um pseudo-terminal: abre, abre a ajuda e sai. Windows, Linux e terminais sem Unicode: **A definir** (testar caso a caso).

### Acessibilidade

- **Contraste**: escolha cores legíveis em fundo claro e escuro (**(?)** confirmar com o tema do terminal da pessoa); prefira as cores do terminal a cores fixas.
- **Não dependa só de cor**: acompanhe com texto ou símbolo (por exemplo, `✓` e `✗`, ou a palavra "erro").
- **Funcione em 80x24**, o tamanho mínimo clássico; em um terminal menor, avise em vez de quebrar a tela.
- Tudo se faz pelo **teclado**, e a ajuda (`?`) lista as teclas.

### Dados e segurança

Valem as regras do `AGENTS.md` e do `guias/app-seguranca.md`:

- **Pasta de dados do sistema** (pela crate `directories`), com uma opção como `--dados <pasta>` para trocar.
- **Só dados fictícios** nos exemplos e nos testes (uma opção como `--exemplo` carrega o que for preciso quando o banco está vazio). Diga na ajuda do programa que os dados são fictícios.
- **Nenhum segredo em arquivo**, nem em `.env` com valor real. Se um serviço externo for indispensável, a chave entra só em tempo de execução.
- **Lockfile versionado** (`Cargo.lock`), poucas dependências e versões em suporte, conferidas na documentação oficial.

### Fontes

- ratatui: https://ratatui.rs
- crossterm: https://github.com/crossterm-rs/crossterm
- `guias/app-mobile.md` (núcleo compartilhado, workspace)
- `guias/app-cli.md` (ferramenta de linha de comando)
