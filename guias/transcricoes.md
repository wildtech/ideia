# Guia: transcrições de reuniões

Como transformar a transcrição de uma reunião em texto do documento sem expor ninguém e sem inventar o que ninguém disse. Complementa a seção "Segurança e privacidade" do `AGENTS.md` e o `guias/seguranca.md`. O `AGENTS-extra.md` pode **reforçar** estas regras com o que é da sua organização, mas não afrouxá-las.

## Por que uma transcrição pede cuidado

A transcrição automática é um ótimo insumo: guarda o que foi dito, quem estava e o que ficou combinado. Mas ela também guarda o que **ninguém quis registrar**:

- o nome de um cliente ou de um usuário citado como exemplo;
- o que apareceu numa **tela compartilhada**, lido em voz alta ou captado pela ferramenta;
- falas atribuídas à **pessoa errada**: numa sala com um microfone só, a ferramenta põe tudo no nome de quem abriu a reunião;
- **números e nomes truncados**, que parecem certos e não são;
- **imagens embutidas** no arquivo (fotos de perfil dos participantes, capturas de tela).

O documento do projeto é lido por outras pessoas, versionado e, às vezes, replicado em outro repositório. O que entra nele precisa ser o que se aprende com a reunião, e não o registro bruto dela.

## Quem aparece com nome

- **Quem participa do projeto** aparece com nome e sobrenome e o papel, como em qualquer documento do template.
- **Pessoas de fora** (clientes e usuários) **não aparecem nos documentos.** O caso é contado de forma abstrata, com o que importa para o problema: "um cliente que abriu três chamados no mês e não teve retorno". Nada de nome, documento, e-mail, telefone ou valor que permita reconhecer a pessoa.
- Na dúvida se alguém é "do projeto", trate como de fora e pergunte.

## O arquivo original

- Quando a transcrição tiver **dado de terceiro**, ela **não é versionada como está**. Dois caminhos:
    - **cortar ou trocar o trecho** antes de guardar no `apoio/` (por exemplo, "[nome omitido]");
    - **deixar o arquivo fora do git**, guardado onde a organização guarda esse tipo de material.
- O documento registra que o trecho foi omitido ("na tela compartilhada apareceram dados de um cliente; o trecho não foi registrado"), para quem ler saber que há uma lacuna de propósito.
- **Imagens do arquivo** também são dado pessoal: fotos de perfil e capturas embutidas no `.docx` contam como rostos e telas. Olhe antes de versionar.

## Telas compartilhadas e prints

A parte da reunião em que alguém mostra um sistema é a mais útil e a mais arriscada. O que estava na tela entra na transcrição como texto, misturado à fala: nomes, códigos, valores, datas.

- Registre **o que o sistema faz** e **como a pessoa trabalha** ("o relatório sai por códigos e leva meia hora"), e não o que estava na linha da tela.
- Se precisar de um exemplo, invente um **fictício** e diga que é fictício.

## Perguntas que precisam ser feitas

O que a transcrição deixa em dúvida **não é completado por dedução**: um nome truncado, um número, quem disse o quê, um combinado sem dono ou sem data.

- Fica no documento com **(?)**, como em qualquer documento do template.
- Entra numa **lista de perguntas** para as pessoas da reunião (em "Perguntas em aberto" ou numa seção da próxima reunião). Essa lista é a pauta da próxima conversa.
- Quando a resposta chega, o **(?)** sai, e o documento registra a data.

## Atribuição e números

- **Fala atribuída por dedução** fica com **(?)**. Se a ferramenta juntou a sala inteira num nome só, diga isso no resumo.
- **Número incerto** fica com **(?)**: valores, quantidades e datas são o que a transcrição mais erra.
- A transcrição **não é fonte de citação literal**. Prefira resumir; cite entre aspas só uma frase curta e clara, de quem você tem certeza que disse.

## Ferramentas externas

Não cole a transcrição bruta em um serviço externo (outro modelo de IA, um resumidor online, uma ferramenta de tradução) sem a decisão da pessoa. Ela contém o que ninguém revisou ainda.

## Passo a passo para o assistente

1. **Ler** a transcrição inteira (em partes, se for longa) antes de escrever.
2. **Procurar dados de terceiros:** nomes de quem não está no projeto, documentos, e-mails, telefones, valores ligados a uma pessoa e o que veio de telas compartilhadas.
3. **Avisar a pessoa** do que encontrou e do que vai omitir, antes de escrever.
4. **Resumir por tema:** o que foi trazido, decisões, encaminhamentos (quem faz o quê e até quando). Cada reunião ganha uma seção própria, com a data e quem participou.
5. **Marcar as dúvidas** com **(?)** e montar a lista de perguntas.
6. **Atualizar o resto do documento** com o que mudou (atividades, decisões, perguntas em aberto, resumo).
7. **Cuidar do arquivo original:** não versionar como está quando houver dado de terceiro, e dizer à pessoa o que fazer com ele.

## Checklist

- [ ] Nenhum nome, documento, contato ou valor de cliente ou usuário no documento?
- [ ] O que apareceu em tela compartilhada foi resumido, e não copiado?
- [ ] As dúvidas estão com **(?)** e na lista de perguntas?
- [ ] Falas atribuídas por dedução e números incertos estão marcados?
- [ ] O arquivo original com dado de terceiro foi cortado ou ficou fora do git?
- [ ] O documento diz o que foi omitido?
