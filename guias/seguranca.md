# Guia: segurança, privacidade e versões

Como manter segredos e dados pessoais fora dos documentos e dos protótipos, e como escolher e conferir as versões do que o protótipo usa. Complementa a seção "Segurança e privacidade" do `AGENTS.md`, que traz as regras; este guia traz o porquê e o passo a passo. O `AGENTS-extra.md` pode **reforçar** essas regras com o que é da sua organização, mas não afrouxá-las.

## A regra central

**Nenhum segredo de serviço externo é guardado em arquivo.** Segredo é qualquer coisa que dá acesso a algo por você: chave de API, token, senha, chave privada, string de conexão com senha, cookie de sessão.

"Em arquivo" inclui o código, os testes, os documentos, o `apoio/`, os prints, os vídeos, o histórico do git e o `.env` com valor real. O `.env` fora do git é melhor do que no git, mas continua sendo um segredo guardado no disco, fácil de copiar, de sincronizar na nuvem e de colar numa conversa sem querer.

## Quando o protótipo precisa de um serviço real

Quase nunca precisa. O padrão do template é **simular** (a IA é uma versão por regras). Se for preciso testar um serviço real, trate como uma decisão própria (um pitch) e faça assim:

1. **A chave entra só em tempo de execução**, pelo ambiente do terminal ou de um gerenciador de segredos, e some quando o processo termina. Com o 1Password, por exemplo: `op run --env-file=.env.example -- npm run dev`, em que o `.env.example` traz referências (`API_KEY=op://cofre/item/campo`) e não valores.
2. **O `.env.example` só tem nomes**, valores vazios ou referências. Ele é versionado para documentar o que o protótipo espera.
3. **O protótipo avisa quando falta a variável**, com uma mensagem clara, em vez de cair para um valor fixo no código.
4. **Use uma chave só para o protótipo**, com o menor poder possível (somente leitura, cota baixa, validade curta). Se vazar, o estrago é pequeno.
5. **Dados de teste continuam fictícios** mesmo com um serviço real.

## O assistente de IA

- Não lê `.env*`, cofres de senha nem arquivos de credenciais, e não imprime variáveis de ambiente.
- Não pede um segredo no chat e não grava um segredo em arquivo. Se a pessoa colar um, o assistente avisa que ele deve ser tratado como vazado e revogado.
- Não envia dados pessoais ou confidenciais a um serviço externo sem a decisão da pessoa. O que se escreve na conversa é o que a pessoa sabe sobre o caso, e não o dado do cliente.

## Se um segredo vazou

Ordem importa: **primeiro revogar, depois limpar.**

1. **Revogue ou gire a chave** no serviço de origem. Daqui para a frente ela não vale mais, e isso resolve o risco. Limpar o histórico sem revogar não resolve, porque a chave pode já ter sido copiada.
2. Veja se houve uso indevido (o painel do serviço costuma mostrar).
3. Tire o segredo do código e do histórico (`git filter-repo` ou equivalente) se o repositório for compartilhado. Peça ajuda se não tiver feito antes.
4. Se o commit foi publicado, trate o histórico como público para sempre.
5. Registre o que aconteceu e o que mudou, sem copiar o segredo.

## Privacidade dos documentos

- **Dados pessoais e confidenciais** (clientes, funcionários, contratos, valores) não entram em protótipos nem em repositório público. No documento, prefira o que se aprende com o caso e não o dado em si, ou anonimize.
- **O `apoio/` e as imagens** podem conter nomes, e-mails, telefones, planilhas e rostos que ninguém lembra de ter colocado. Olhe cada arquivo antes de versionar, principalmente em repositório público, e corte, borre ou troque o que aparece.
- **Fotos e imagens de terceiros e de pessoas** pedem crédito e, quando há rosto ou dado pessoal, autorização. Registre isso nas notas ou no documento.
- **Nada de dentro de uma organização vai para um repositório público.** O `AGENTS-extra.md` diz o que é confidencial na sua.
- **A LGPD vale** para qualquer dado de pessoa real. Na dúvida, não coloque.

## Versões do que o protótipo usa

O protótipo roda sobre o Node e sobre dezenas de pacotes que alguém mantém. Versão velha tem falha conhecida; versão nova demais pode ter sido publicada ontem, ou trocada por alguém mal-intencionado.

- **Node:** use uma versão **em suporte**, de preferência uma **LTS** (a "ativa" ou a "em manutenção"). Uma versão "Current" é a que ainda vai virar LTS (as de número ímpar nunca viram). Uma versão que saiu de suporte não recebe mais correções de segurança. O calendário oficial está em https://nodejs.org/en/about/previous-releases. **Consulte-o, não confie na memória**: o `verificar --rede` faz isso por você.
- **`engines`:** o `package.json` declara o piso do Node (`"node": ">=22.13"` no exemplo). O README registra a versão **testada** e a data.
- **Lockfile:** o `package-lock.json` é versionado, e a instalação limpa usa `npm ci`. Sem ele, duas pessoas instalam versões diferentes.
- **Poucas dependências**, de mantenedores conhecidos. Cada pacote a mais é mais código de terceiros rodando na sua máquina. Antes de adicionar um, pergunte se um punhado de linhas resolve.
- **Scripts de instalação** (`postinstall`) rodam código na sua máquina durante o `npm install`. O `verificar` lista os pacotes que fazem isso, para você saber o que esperar (o `esbuild` e o `fsevents` fazem, e é normal).
- **Versão recém-publicada:** espere alguns dias antes de adotar uma versão nova de um pacote, especialmente fora das grandes bibliotecas.
- **Atualize uma coisa por vez**, rodando os testes (`npm test` e `npm run test:e2e`) entre uma e outra. Uma mudança de versão maior (de 6 para 7) é uma decisão: leia o que mudou e registre.

## Como verificar

Da raiz do repositório:

```bash
node tools/verificar.js projetos/<projeto>/prototipo
```

Dentro do protótipo, `npm run verificar` faz o mesmo (só olha os arquivos, sem rede), e `npm run verificar:rede` também consulta o calendário do Node e roda `npm audit` e `npm outdated`.

| Verificação | Resultado |
| :--- | :--- |
| Padrões de segredo nos arquivos (chaves, tokens, chave privada, senha em endereço de conexão) | **FALHA**; o valor nunca é impresso, só o arquivo e a linha |
| `.env` com valor no disco | **FALHA** |
| `.gitignore` sem `.env`, bancos locais, logs e `node_modules` | **FALHA** |
| Sem lockfile, ou dependência com versão solta (`latest`, `*`, git) | **FALHA** |
| Node em uso mais antigo que o `engines` | **FALHA** |
| Node fora de suporte (com `--rede`) | **FALHA** |
| `npm audit` com vulnerabilidade alta ou crítica (com `--rede`) | **FALHA** |
| Node ainda "Current", scripts de instalação, vulnerabilidade moderada, pacote desatualizado | **AVISO** |

Para ignorar uma linha de propósito (por exemplo, um segredo falso num teste), escreva `verificar:ignorar` na mesma linha.

**O que ele não faz:** não prova que não há segredo (ele conhece padrões, e um segredo qualquer, como uma senha comum, pode passar), não olha o histórico antigo do git e não substitui a revisão de uma pessoa. É uma rede de segurança, e não um selo. Rode antes de cada commit relevante e antes de mostrar o protótipo.

## Checklist

- [ ] Algum segredo em arquivo, código, print, vídeo ou conversa? (a resposta é não)
- [ ] O `.env.example` só tem nomes e referências?
- [ ] Os dados do protótipo são todos fictícios?
- [ ] Olhei o `apoio/` e as imagens à procura de dado pessoal?
- [ ] O Node está em suporte, e o `engines` e o README dizem a versão testada?
- [ ] O lockfile está versionado e o `npm audit` não tem nada alto ou crítico?
- [ ] Rodei `npm run verificar:rede` e li os avisos?
