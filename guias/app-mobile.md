# Guia: app mobile nativo multiplataforma (iOS e Android)

A stack padrão para construir um **app nativo** de celular, para iOS e Android, a partir de um projeto deste repositório. Ela faz, para o mobile, o papel que a stack web (React + Vite + TypeScript) faz para os protótipos: diz o que usar, como organizar as pastas e quais regras valem. Este guia complementa as seções "Protótipos", "Design system do protótipo" e "Segurança e privacidade" do `AGENTS.md`. Ele é uma **sugestão padrão**: a pessoa pode trocá-la, e o `AGENTS-extra.md` pode registrar outra. O `exemplo-todo` é o exemplo da stack web; um exemplo mobile dentro do template é pendência (ver "Pendências conhecidas do padrão").

> **Em uma frase:** as regras, o banco, a sincronização e a rede ficam em um **núcleo em Rust**, escrito uma vez; a interface é **100% nativa** (SwiftUI no iOS, Kotlin com Jetpack Compose no Android); o **UniFFI** gera o código que liga os dois lados.

### Por que essa stack

- **Uma regra de negócio, dois apps.** O que mais precisa de teste (prazos, cálculos, sincronização, conflitos) é escrito e testado uma só vez, em Rust, e usado igual no iOS e no Android.
- **Interface nativa de verdade.** Cada plataforma usa o que tem de melhor: gestos, acessibilidade, notificações, segundo plano. Nada de camada de interface compartilhada tentando imitar as duas.
- **Offline primeiro.** O app funciona sem internet, e a sincronização é um detalhe que acontece depois (ver "Arquitetura offline-first").
- **Troca barata.** O núcleo só conhece contratos (traits). Trocar o servidor, o banco ou um recurso do celular é escrever **outra implementação** do contrato, sem mexer nas regras. É a mesma ideia do "contrato de dados" do protótipo web.

#### Como se relaciona com a stack web do template

O **protótipo web** valida a ideia (fluxo, regras e telas), é feito para ser trocado e roda no navegador. O **app nativo** é o software que vai ao celular da pessoa e evolui. Os dois podem existir no mesmo projeto: as regras validadas no protótipo viram o núcleo em Rust.

#### Quando usar, e quando não usar

| Use esta stack quando | Não use quando |
| :--- | :--- |
| O app vai ser instalado no celular e precisa de recursos nativos (notificações, alarmes, segundo plano, sensores) | Você só quer **validar um fluxo ou uma ideia**: continue com o protótipo web (React + Vite + TS) |
| Precisa funcionar offline e sincronizar depois | O produto é só um site ou um painel que roda no navegador |
| As regras de negócio são relevantes e merecem testes sólidos | A equipe não tem como manter Rust, Swift e Kotlin ao mesmo tempo (A definir: avaliar antes de começar) |
| Quer a mesma lógica no iOS e no Android | Só uma plataforma interessa: pode bastar o app nativo daquela plataforma, sem o núcleo compartilhado |

### A stack

| Camada | Padrão | Observações |
| :--- | :--- | :--- |
| Núcleo | **Rust**, uma crate com `lib`, `staticlib` e `cdylib` | `staticlib` serve ao iOS e `cdylib` ao Android. Concentra regras, banco, sincronização e rede |
| Ligação com o nativo | **UniFFI**, com proc-macros | Gera o código Swift e Kotlin. O `uniffi-bindgen` fica no workspace e roda em **modo library** (lê a biblioteca compilada) |
| Banco | **SQLite** pela crate `rusqlite`, com SQLite embutido (`bundled`) | Em modo **WAL**. Sem dependência do SQLite do sistema |
| Assíncrono | **Tokio**, quando houver rede de verdade | Runtime do núcleo para o cliente HTTP e tarefas pesadas. Enquanto o servidor é de mentira, o `sync_now` é síncrono e o nativo o chama fora da main thread (`Task.detached` no Swift, `Dispatchers.IO` no Kotlin); o Tokio entra junto com o reqwest |
| HTTP | `reqwest` com `rustls` | Só quando houver servidor. Sem OpenSSL do sistema |
| Dados | `serde` e `serde_json` | Entidades e leitura de JSON |
| Criptografia do banco | **SQLCipher**, com a chave guardada no Keychain (iOS) ou no Keystore (Android) | **A definir** |
| iOS | **Swift** e **SwiftUI**; **XCFramework** (o núcleo empacotado) | `NWPathMonitor` (conexão), `BGAppRefreshTask` (segundo plano), `UNUserNotificationCenter` (notificações), Keychain |
| Android | **Kotlin** e **Jetpack Compose**, com `ViewModel` | **JNA** (exigido pelo Kotlin gerado pelo UniFFI), `cargo-ndk` (compila para Android), `WorkManager` (segundo plano), `ConnectivityManager`, `AlarmManager` e `NotificationManager`, Keystore ou `EncryptedSharedPreferences` |
| Testes | `cargo test` no núcleo; **XCTest** no iOS; testes JVM e instrumentados no Android | As regras são o que mais precisa de teste, então a maior parte dos testes mora no núcleo |
| Versões | Registradas no README do app | Exemplo de versões testadas: Rust 1.100, uniffi 0.32.2, rusqlite 0.42, Xcode 27.2 e deployment target iOS 17 |

### Estrutura do monorepo

Um repositório só, com uma pasta por papel:

- `core/` — o núcleo em Rust
    - `src/lib.rs` — o que é exportado para o FFI (a porta de entrada que o Swift e o Kotlin enxergam)
    - `src/domain/` — entidades puras, sem banco nem rede
    - `src/use_cases/` — as regras de negócio
    - `src/network/` — cliente HTTP e leitura dos JSON
    - `src/storage/` ou `src/db/` — o SQLite (conexão, migrações e consultas)
    - `src/platform_traits.rs` — as interfaces (traits) para recursos nativos, como notificações, GPS e Keychain, que o iOS e o Android implementam
- `ios/` — o app iOS
    - `Generated/` — o Swift e o XCFramework gerados a partir do Rust
    - `Platform/` — a implementação nativa das interfaces do Rust
    - `UI/` — SwiftUI e ViewModels finos
- `android/app/src/main/` — o app Android
    - `jniLibs/` — as bibliotecas `.so`, uma por arquitetura ARM
    - `java/.../generated/` — os `.kt` gerados pelo UniFFI
    - `java/.../platform/` — a implementação nativa das interfaces do Rust
    - `java/.../ui/` — Compose e ViewModels
- `scripts/`
    - `build-ios.sh` — compila o núcleo e gera o XCFramework
    - `build-android.sh` — compila o núcleo com `cargo-ndk`
    - `bindings.sh` — gera os arquivos Swift e Kotlin
- `uniffi-bindgen/` — o executável do gerador, dentro do workspace

A regra de ouro: **a interface é fina**. ViewModels só pedem dados ao núcleo e mostram o resultado; a decisão de negócio fica em `use_cases/`.

### Arquitetura offline-first no núcleo

| Arquivo ou pasta | Papel |
| :--- | :--- |
| `db/connection.rs` | Conexão (ou pool) com o SQLite e ativação do modo WAL |
| `db/migrations.rs` | Versão do esquema, controlada por `PRAGMA user_version`; cada mudança é uma migração numerada |
| `db/repositories/` | As consultas SQL, uma por entidade |
| `sync/outbox.rs` | A fila das ações feitas offline (Outbox Pattern), na tabela `sync_queue` |
| `sync/worker.rs` | O `sync_now`: envia o que está na fila e recebe as mudanças (assíncrono com Tokio quando houver rede de verdade) |
| `sync/conflict.rs` | Resolução de conflitos: **last-write-wins** por (`atualizado_em`, dispositivo); **CRDTs** só quando for preciso mesclar |
| `domain/` | Entidades e regras puras |
| `events/` | O canal que avisa a interface nativa de que algo mudou |

### Pilares técnicos de desempenho e offline

- **SQLite em WAL** (`PRAGMA journal_mode=WAL`). Leituras e escritas acontecem ao mesmo tempo, sem travar a tela. A **meta** é responder em menos de 1 ms nas consultas locais; é uma meta, **não uma garantia medida** (medir é pendência).
- **Outbox.** Toda ação é salva **na hora** no SQLite e registrada na `sync_queue`, na **mesma transação** da escrita. A tela atualiza na hora, e o envio ao servidor acontece depois, quando houver conexão.
- **Fora da main thread.** Requisições e tarefas pesadas nunca rodam na thread da tela: o núcleo usa Tokio quando há rede de verdade, e uma chamada síncrona (como o `sync_now` enquanto o servidor é de mentira) é feita pelo nativo numa thread de fundo.
- **Comunicação reativa.** Um callback do UniFFI, o `DataChangeListener`: quando a sincronização muda o SQLite, o Rust avisa o Swift ou o Kotlin, que recarregam só a tela afetada.
- **Chaves UUID**, para que dois dispositivos criem registros sem se pisar.
- **Tombstones** nas exclusões que são sincronizadas: o registro apagado fica marcado (com data), e o dispositivo que estava offline também fica sabendo.
- **O núcleo não lê relógio nem fuso por conta própria.** O nativo passa o `agora` e o deslocamento do fuso. Assim, as regras de tempo ficam determinísticas e fáceis de testar.

### O papel dos módulos nativos

O núcleo não conhece o sistema do celular. O que só o sistema sabe fazer fica no nativo, que **aciona** o núcleo:

| Responsabilidade | iOS (Swift) | Android (Kotlin) | Como aciona o núcleo (Rust) |
| :--- | :--- | :--- | :--- |
| Monitorar a conexão | `NWPathMonitor` | `ConnectivityManager` | Chama `set_network_status(online)` |
| Sincronizar em segundo plano | `BGAppRefreshTask` | `WorkManager` | Chama `sync_now()` |
| Caminho do arquivo do banco | `FileManager`, pasta Application Support | `context.filesDir` | Passa o caminho na inicialização, e o Rust cria o `.db` |
| Segurança do banco | Keychain | Keystore ou `EncryptedSharedPreferences` | Entrega a chave, e o Rust abre o banco com SQLCipher |
| Notificações e alarmes | `UNUserNotificationCenter` | `AlarmManager` e `NotificationManager` | O núcleo chama o trait `Notificador` para agendar e cancelar; é assim que um timer toca com o app suspenso |

### O fluxo na prática

1. **Abertura do app.** O nativo obtém a pasta de dados, busca a chave no Keychain ou no Keystore e inicializa o `AppCore`.
2. **Leitura instantânea.** A tela pede a lista; o Rust lê do SQLite local e devolve objetos prontos.
3. **Ação offline.** O núcleo salva, enfileira na `sync_queue` e retorna sucesso na hora.
4. **Reconexão.** O monitor de rede avisa o Rust, que processa a fila em segundo plano e notifica a tela se algo mudou.

### Sincronização sem servidor ainda

Dá para construir o app inteiro antes de existir um servidor. O núcleo define o trait `SyncRemoto` (o contrato da sincronização) e traz uma **implementação em memória**, o "servidor de mentira", usada nos testes e para o app funcionar 100% offline. O cliente HTTP real entra depois, como **outra implementação** do mesmo trait. Trocar o servidor é escrever outra implementação, sem mexer nas regras nem nas telas.

### Passo a passo para começar um app

1. **Rust.** Instale o `rustup` e adicione os alvos do iOS: `rustup target add aarch64-apple-ios aarch64-apple-ios-sim`.
2. **Android.** Instale o Android Studio e o NDK. Instale `cargo install cargo-ndk` e adicione os alvos: `rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android`.
3. **Teste o núcleo.** Em `core/`, rode `cargo test`. As regras precisam passar antes de qualquer tela.
4. **Gere os bindings.** `scripts/bindings.sh` cria o Swift e o Kotlin a partir da biblioteca compilada.
5. **iOS.** `scripts/build-ios.sh` compila e gera o XCFramework; abra o projeto em `ios/` no Xcode e rode no simulador.
6. **Android.** `scripts/build-android.sh` compila com `cargo-ndk` e copia os `.so` para `jniLibs/`; abra `android/` no Android Studio e rode no emulador.

Quem digita os comandos é o assistente, que explica cada passo em uma frase. Se faltar uma ferramenta (Xcode, Android Studio, NDK), diga como instalar.

### Dados, segurança e versões

Valem as mesmas regras do `AGENTS.md` e do `guias/app-seguranca.md`:

- **Só dados fictícios** no desenvolvimento e nos testes. Dado real de pessoas, clientes ou usuários não entra no repositório.
- **Nenhum segredo em arquivo**: nem no código, nem nos testes, nem em `.env` com valor real. Se um serviço externo for indispensável, a chave entra só em tempo de execução.
- **A chave do banco só no Keychain ou no Keystore.** Nunca em arquivo, nem fixa no código.
- **Lockfiles versionados**: `Cargo.lock` e o do Gradle. Nada de versão solta (`*` ou `latest`).
- **Versões em suporte.** Confirme na documentação oficial de cada ferramenta, não de memória. Registre no README do app as versões **testadas** e a data.
- **Uma atualização por vez**, rodando os testes entre uma e outra. Uma versão maior é uma decisão: leia o que mudou e registre.
- **Poucas dependências**, de fonte conhecida. Pergunte antes de adicionar uma crate ou uma biblioteca se um trecho pequeno de código resolve.

### O que fica fora do git

São saídas dos scripts, que se regeneram:

- `target/` (os builds do Rust)
- o XCFramework
- `jniLibs/` (as `.so`)
- os `.swift` e `.kt` gerados (`Generated/` e `generated/`)
- os builds do Xcode e do Gradle

O que fica no git: o código do núcleo, o código nativo escrito à mão, os scripts, os lockfiles e o README. Garanta que o `.gitignore` do app cubra a lista acima.

### Design system

Como no protótipo web, as cores e as medidas vêm do **tema do projeto** (`temas/<tema>/tema.json`), lidas por `tools/tokens.js`. No app nativo, os tokens ficam em `Tema.swift` (iOS) e `Tema.kt` (Android). **Hoje eles são copiados à mão** do tema para os dois arquivos. Gerar esses arquivos automaticamente, como o `npm run tokens` faz no protótipo web, é uma pendência **(?)**. Enquanto isso, mantenha o contraste de pelo menos 4,5:1, o alvo de toque de pelo menos 44 pontos e a regra de não escrever cor ou medida solta nas telas.

### Outras interfaces

O mesmo núcleo pode alimentar um **app de terminal** (ver `guias/app-tui.md`) ou uma **ferramenta de linha de comando** (ver `guias/app-cli.md`), sem UniFFI, como membros do mesmo workspace: chamam o núcleo direto como crate Rust, com o mesmo banco e a mesma sincronização.

### Pendências conhecidas do padrão

| Pendência | Situação |
| :--- | :--- |
| Criptografia do banco com SQLCipher | A definir |
| Cliente HTTP real e servidor de sincronização | A definir; por ora vale o `SyncRemoto` em memória |
| Geração dos tokens do tema para Swift e Kotlin | **(?)** Hoje copiados à mão |
| Medir a meta de resposta em menos de 1 ms | A definir |
| Integração contínua (CI) | A definir |
| Um exemplo mobile dentro do template | A definir (hoje só o `exemplo-todo`, web, existe) |

### Fontes

- UniFFI: https://mozilla.github.io/uniffi-rs/
- SQLite em modo WAL: https://www.sqlite.org/wal.html
- Tokio: https://tokio.rs
- rusqlite: https://github.com/rusqlite/rusqlite
- Outbox Pattern: https://microservices.io/patterns/data/transactional-outbox.html
