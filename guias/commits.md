# Guia: mensagens de commit (Conventional Commits)

Como escrever a mensagem de um commit, para o histórico do repositório ser fácil de ler e de filtrar. Complementa a seção "Git" do `AGENTS.md`, que diz **quando** commitar (só quando a pessoa pedir; o push é sempre dela). Este guia diz **como** escrever a mensagem. O formato é o [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).

## O formato

```
tipo(escopo): descrição curta

Corpo opcional: o porquê, em uma ou duas frases.
```

- **Primeira linha:** até cerca de 72 caracteres, em português, sem ponto final, no presente ou no imperativo ("adiciona", "corrige" ou "adicionar"; escolha um e mantenha).
- **Corpo (opcional):** explica o **porquê**, não o que o diff já mostra. Deixe uma linha em branco depois da primeira.
- **Escopo (opcional):** a parte do repositório que mudou, entre parênteses.

## Tipos

| Tipo | Quando usar | Exemplo |
| :--- | :--- | :--- |
| `feat` | Algo novo para quem usa: um roteiro, um layout, uma ferramenta, um projeto | `feat(tools): layout de slide plano` |
| `fix` | Corrige um defeito | `fix(tools): conserta a numeração dos slides ocultos` |
| `docs` | Texto: guia, roteiro, README, documento de projeto, spec | `docs(guias): guia de mensagens de commit` |
| `refactor` | Muda o jeito de fazer, sem mudar o resultado | `refactor(tools): extrai o parser de diretivas` |
| `test` | Testes | `test(exemplo-todo): cobre a regra de prazo` |
| `chore` | Manutenção que ninguém vê: dependências, `.gitignore`, ajustes de rotina | `chore: atualiza o lockfile` |

Uma mudança que **obriga quem já usa o template a fazer algo** (por exemplo, rodar de novo um comando ou trocar um arquivo) leva `!` depois do tipo e uma linha `BREAKING CHANGE:` no corpo:

```
feat(tools)!: renomeia o formato do projeto.json

BREAKING CHANGE: o campo "saidas" passa a exigir "tipo".
```

## Escopos sugeridos

Use a pasta ou a parte que mudou. Para o `ideia`:

| Escopo | O que cobre |
| :--- | :--- |
| `tools` | Os compiladores em `tools/` |
| `roteiros` e `guias` | Os arquivos dessas pastas |
| `temas` | Os temas |
| `agents` | O `AGENTS.md` e o `AGENTS-extra.example.md` |
| `issues` | Os formulários em `.github/ISSUE_TEMPLATE/` |
| nome do projeto | Um projeto em `projetos/` (`exemplo-todo`, `pe-2027`...) |
| `spec` | Mudança de status de uma spec |

Em um repositório de quem usa, o `AGENTS-extra.md` pode registrar outros escopos, o idioma e o que for específico.

## Trunk based development

O padrão do template é o **trunk based development**: o projeto não usa branches de longa duração, e os commits vão direto na `main`, **pequenos e frequentes**. Por isso a regra "um commit, uma ideia" importa tanto: cada commit deixa a `main` em um estado que funciona e se explica sozinho. O assistente não cria branch. Se a sua equipe trabalha de outro jeito (branches e pull requests, por exemplo), registre no `AGENTS-extra.md`, na seção "Fluxo de Git"; este guia continua valendo para o formato da mensagem.

## Um commit, uma ideia

- Misturou uma ferramenta nova com um projeto novo? São dois commits.
- **Spec:** mudar o status de uma spec é um commit só (ver `guias/specs.md`), por exemplo `docs(spec): 003 Andamento`.
- Se a mensagem precisa de "e" para descrever o que foi feito, provavelmente são dois commits.

## O que não vai na mensagem

A mensagem fica no histórico para sempre, e o histórico de um repositório público é público. Não coloque **segredos** (chaves, tokens, senhas), **dados pessoais**, nomes de clientes ou usuários, nem nada de dentro de uma organização (ver `guias/seguranca.md`). Se algo assim já entrou em um commit publicado, trate como vazado.

## O assistente e os commits

O assistente só faz commit quando a pessoa pedir e **nunca faz o push** (ver "Git" no `AGENTS.md`). Ao commitar, ele segue este guia e mostra a mensagem. Se o `AGENTS-extra.md` pedir uma linha de autoria ou de co-autoria no fim da mensagem, ela vai depois do corpo, separada por uma linha em branco.

Origem do formato: Conventional Commits 1.0.0, https://www.conventionalcommits.org/pt-br/v1.0.0/
