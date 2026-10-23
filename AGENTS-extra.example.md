# AGENTS-extra.md (modelo)

> **Como usar este modelo:** copie este arquivo para `AGENTS-extra.md`, na raiz do repositório, e preencha só o que souber. Apague as instruções em citação e deixe "A definir" no que ainda não tem resposta. Este arquivo (`AGENTS-extra.example.md`) fica como está, para documentar a convenção.

Este arquivo complementa o `AGENTS.md`, que é a base compartilhada do template e **não pode ser modificado por agentes**. Tudo o que é específico de quem usa vai aqui. O assistente de IA lê o `AGENTS-extra.md` no início de toda sessão. Quando ele for mais específico do que o `AGENTS.md`, ele prevalece, **exceto** nas regras de integridade (não inventar informação, marcar dúvidas com **(?)**, confirmar antes de escrever em sistemas externos, nunca apagar em sistemas externos e proteger dados sensíveis), que ele só pode reforçar.

> **Não coloque segredos aqui** (senhas, tokens, chaves de API). Aponte para onde eles ficam, sem copiá-los.

## Sobre a organização ou a pessoa

> Contexto que ajuda o assistente a entender o ambiente: quem é a pessoa ou a organização, o que faz, quem são os públicos dos documentos e o que costuma ser documentado.

- **Quem somos:** A definir.
- **Pessoa responsável pelo repositório:** A definir (nome e sobrenome, e o papel).
- **Para quem os documentos são escritos:** A definir.

## Temas

> Os temas disponíveis em `temas/` além do genérico, e quando usar cada um. O tema padrão é o genérico, a menos que esta seção diga outro.

| Tema | Quando usar | Observações |
| :--- | :--- | :--- |
| `generico` | Padrão do template | Rodapé e logo de exemplo; troque pelos seus |
| `neutro` | Base dos temas simples (só cores e logo) | Vem do template; um tema simples herda dele com `"extends": "neutro"` |
| A definir | A definir | A definir |

- **Tema padrão desta organização:** A definir.

## Roteiros próprios

> Roteiros criados por quem usa (além dos que vêm no template), com quando usar. Cada um é um arquivo em `roteiros/` e deve indicar a fonte das perguntas.

| Roteiro | Para que serve | Arquivo |
| :--- | :--- | :--- |
| A definir | A definir | `roteiros/<nome>.txt` |

## Integrações

> URLs e nomes que o `AGENTS.md` pede para perguntar. Preencha só as que a pessoa usa.

- **Jira:** URL `https://<sua-empresa>.atlassian.net/` (A definir). Projeto padrão: A definir.
- **GitHub:** organização ou conta: A definir. Repositórios usuais: A definir.
- **Outras ferramentas** (Confluence, Slack, Drive, planilhas): A definir.

## Fluxo de Git

> O padrão do `AGENTS.md` é conservador: commit só quando a pessoa pedir e push sempre feito por ela. Aqui você pode mudar isso.

- **Commits:** somente quando a pessoa pedir (padrão). Ajuste se quiser.
- **Push:** sempre feito pela pessoa (padrão). Ajuste se quiser.
- **Nomes de branch e mensagens de commit:** A definir.

## Convenções

- **Idioma e tom:** Português do Brasil, tom claro e direto (padrão). Ajuste se precisar.
- **Nomes de projeto:** minúsculas, sem acentos, com hífen (padrão). Ajuste se precisar.
- **Glossário:** termos que o assistente deve usar do jeito da organização.

| Termo | Significado |
| :--- | :--- |
| A definir | A definir |

## Pessoas e papéis recorrentes

> Quem costuma aparecer nas tabelas RCI. Use nome e sobrenome e o papel.

| Nome | Papel |
| :--- | :--- |
| A definir | A definir |

## Projetos existentes

> Lista dos projetos em `projetos/`, com o roteiro e o tema de cada um, para o assistente se localizar.

| Projeto | Roteiro | Tema | Observações |
| :--- | :--- | :--- | :--- |
| A definir | A definir | A definir | A definir |

## Privacidade e dados sensíveis

> O que não pode entrar nos documentos nem no repositório (dados pessoais, dados de clientes, valores confidenciais) e como tratar quando aparecer no material de apoio.

- **Não entra no repositório:** A definir.
- **Material de apoio sensível:** A definir (por exemplo, não versionar `apoio/` de um projeto).

## Outras fontes de conhecimento

> Onde o assistente deve buscar mais contexto: outros repositórios, bases de conhecimento, pastas, documentos de referência.

- A definir.

## Sincronização com a origem do template

> Só para repositórios que nasceram do template e querem trazer as melhorias dele.

- **Origem:** https://github.com/wildtech/ideia
- **Arquivos `[base]`** (ver a árvore no `AGENTS.md`) vêm da origem; os `[conteúdo]` são seus.
- **Como trazer as melhorias:** A definir (por exemplo, copiar os arquivos `[base]` ou fazer um merge da origem).
- **Melhorias nos arquivos `[base]`** devem ir para a origem, não ficar só aqui.
