# Creative Commons: escolher a licença dos documentos de um projeto

**Período de Acompanhamento:** Outubro de 2026 em diante.
**Data Limite:** A definir.
**Roteiro:** iniciativa
**Status do documento:** Exemplo de uso do template com um tema simples (só cores e logo). O assunto é real: foi a decisão de licença deste próprio template.

---

> **Resumo (TL;DR):**
> - **Ideia:** documentos e roteiros que serão compartilhados precisam de uma licença clara. As licenças Creative Commons (CC) são o caminho mais usado para conteúdo.
> - **As opções:** seis licenças, combinando quatro condições: crédito (BY), compartilhar igual (SA), não comercial (NC) e sem derivações (ND).
> - **Decisão:** **CC BY 4.0** para documentos, roteiros e temas, porque permite usar, copiar e derivar, inclusive com fins comerciais, e exige o crédito à origem.
> - **Software é diferente:** a CC recomenda não usar licenças CC para software. As ferramentas (`tools/`) usam a licença **MIT**.
> - **Cuidado:** o nome e o logo da CC são marcas da Creative Commons e têm regras de uso.

---

### Sobre / Contexto

Quando um template e os documentos que ele gera passam a ser compartilhados, qualquer pessoa pode se perguntar: posso usar? Posso adaptar? Preciso dar crédito? Sem uma licença, a resposta padrão é que tudo é reservado. Uma licença responde a essas perguntas de antemão.

A Creative Commons oferece licenças públicas padronizadas, escritas para que quem cria uma obra diga, de forma simples, o que os outros podem fazer com ela. Este projeto registra como a licença dos documentos do template foi escolhida, e serve de exemplo de um projeto com tema simples, que só tem cores e logo.

Este é um documento vivo. Itens marcados com **(?)** são dúvidas ainda por confirmar, e campos sem resposta ficam como "A definir".

> **Definições:**
> - **Licença** é a permissão que o autor dá para o uso da obra, com as condições que ele escolhe.
> - **Crédito (BY)** é a condição de indicar quem criou a obra.
> - **Compartilhar igual (SA)** é a condição de que as adaptações usem a mesma licença ou uma compatível.
> - **Não comercial (NC)** é a condição de não usar a obra principalmente para vantagem comercial ou compensação financeira.
> - **Sem derivações (ND)** é a condição de só copiar e redistribuir a obra sem adaptá-la.
> - **CC0** é a ferramenta de dedicação ao domínio público da Creative Commons.

---

### Papéis e Expectativas (RCI)

- **R (Responsável):** A pessoa que executa o trabalho.
- **C (Consultado):** Pessoas que devem ser ouvidas e cuja opinião é necessária (comunicação bidirecional).
- **I (Informado):** Pessoas que devem ser mantidas atualizadas sobre o progresso (comunicação unidirecional).

| Nome/Equipe | Papel Principal | R | C | I |
| :--- | :--- | :--- | :--- | :--- |
| **Daniel Wildt** | Autor do template e responsável pela escolha da licença | X | | |

---

### Objetivo / Onde queremos chegar?

Escolher e aplicar uma licença que deixe claro o que quem recebe o template pode fazer, sem criar para o autor responsabilidade sobre o uso e garantindo que a origem seja citada.

1. Entender as opções de licença Creative Commons e o que cada uma permite.
2. Escolher a licença dos documentos, roteiros e temas.
3. Tratar à parte o software, que tem licenças próprias.
4. Aplicar a licença nos arquivos do repositório e registrar o crédito.

**Indicador de sucesso (proposta):** quem abrir o repositório entende, sem ajuda, o que pode fazer com cada parte e como citar a origem. **(?)**

---

### Atividades em andamento

| Atividade | Responsável | Status | Observações |
| :--- | :--- | :--- | :--- |
| Entender as seis licenças e as quatro condições | Daniel Wildt | Concluída | Ver a tabela abaixo |
| Escolher a licença dos documentos, roteiros e temas | Daniel Wildt | Concluída | CC BY 4.0 |
| Escolher a licença das ferramentas | Daniel Wildt | Concluída | MIT |
| Aplicar a licença e registrar o crédito à origem | Daniel Wildt | Concluída | Arquivo `LICENSE` e seção no `README` |
| Decidir se o `LICENSE` leva o texto completo da licença | Daniel Wildt | Concluída | Fica só o link para o texto oficial |
| Decidir o uso do logo da Creative Commons neste exemplo | Daniel Wildt | Concluída | Mantida a imagem, que vem do site da Creative Commons Brasil. Ver "Marca e logo" abaixo |

---

### As seis licenças

Todas exigem crédito ao criador (BY). As outras três condições se combinam, e a versão atual é a 4.0.

| Licença | Uso comercial | Adaptações | Condições |
| :--- | :--- | :--- | :--- |
| **CC BY** | Permitido | Permitidas | Crédito |
| **CC BY-SA** | Permitido | Permitidas, com a mesma licença ou uma compatível | Crédito e compartilhar igual |
| **CC BY-ND** | Permitido | Não permitidas | Crédito e sem derivações |
| **CC BY-NC** | Não permitido | Permitidas, só sem fins comerciais | Crédito e não comercial |
| **CC BY-NC-SA** | Não permitido | Permitidas, com a mesma licença ou uma compatível | Crédito, não comercial e compartilhar igual |
| **CC BY-NC-ND** | Não permitido | Não permitidas | Crédito, não comercial e sem derivações |

A lista vai da mais permissiva (CC BY) à mais restritiva (CC BY-NC-ND). Há ainda o **CC0**, que não é uma licença com condições, mas uma dedicação da obra ao domínio público.

---

### Matriz de posicionamento: qual licença para os documentos do template

O template existe para ser usado e adaptado, inclusive por empresas, e o autor quer ser citado. Os critérios foram: permitir uso e derivação, exigir crédito e não impedir o uso comercial.

| Opção | Vantagem | Limite | Situação |
| :--- | :--- | :--- | :--- |
| **CC BY** | Permite usar, copiar e adaptar, inclusive com fins comerciais; exige o crédito | Não impede que alguém publique o derivado com outra licença | Escolhida |
| **CC BY-SA** | Mantém os derivados abertos | Exige que as adaptações compartilhadas usem a mesma licença, o que pode afastar quem quer manter o seu derivado fechado | Descartada |
| **CC BY-NC** | Impede o uso comercial | Impede também empresas de adotar o template | Descartada |
| **CC BY-ND** | Preserva o original | Não permite adaptações, e o template existe para ser adaptado | Descartada |
| **CC0** | Sem condições | Não exige crédito, e o autor quer ser citado | Descartada |

#### Como chegamos nesta decisão

- **Primeira ideia:** usar uma licença Creative Commons, para permitir uso e derivação com crédito à origem. Isso aponta para a CC BY.
- **Responsabilidade:** o material é oferecido como está, sem garantias. Isso vai em um aviso no `README` e no `LICENSE`, além da licença.
- **Software:** o repositório mistura conteúdo e código. Como a CC recomenda não usar licenças CC para software, a recomendação, aceita, foi usar licença dupla: CC BY 4.0 para o conteúdo e MIT para as ferramentas.
- **Texto da licença:** o `LICENSE` traz o aviso e o link para o texto legal oficial, e não o texto completo.

---

### E o software?

A Creative Commons recomenda **não** usar licenças CC para software. Os motivos que ela dá: as licenças CC não têm termos sobre a distribuição do código-fonte e não tratam de direitos de patente, como as licenças de software costumam tratar. Ela indica licenças que a Free Software Foundation considera livres e a Open Source Initiative considera de código aberto. As licenças CC continuam adequadas para a documentação do software e para elementos artísticos separados.

Por isso o repositório tem duas licenças: a CC BY 4.0 para os documentos, roteiros e temas, e a MIT para os compiladores em `tools/`.

---

### Como aplicar

1. Escolha a licença e confirme o texto oficial na página da Creative Commons.
2. Coloque um arquivo `LICENSE` na raiz com o aviso, o crédito e o link para o texto legal.
3. Diga **o que a licença cobre e o que não cobre**: os arquivos da base são licenciados; os projetos de quem usa o template são de quem os criou.
4. Peça o crédito à origem no `README`, com o nome do autor e o endereço do repositório.
5. Repita o aviso de que o conteúdo é oferecido como está, sem garantias.

---

### Marca e logo

O nome da Creative Commons, os botões e o logo corporativo (o "CC" em um círculo) são marcas da Creative Commons. A CC permite usar os logos com a sua obra ou o seu site, desde que se sigam as políticas dela, e não permite alterá-los (por exemplo, mudando a fonte, as proporções ou as cores) nem usá-los de formas que as políticas não autorizem sem permissão por escrito.

A imagem usada como logo deste tema de exemplo é uma arte de divulgação da Creative Commons (a marca com respingos de tinta), recortada apenas nas margens brancas. Ela está aqui só para ilustrar um tema simples, sem vínculo nem endosso da Creative Commons. Quem for usar a marca de verdade, para indicar a licença de uma obra, deve pegar os arquivos oficiais e seguir a política de uso.

---

### Pontos em aberto

> **Ainda em aberto:**
> - **Texto completo da licença:** incluir no `LICENSE` ou continuar só com o link.
> - **Versão da licença:** acompanhar se a Creative Commons publicar uma versão nova.
>
> **Já decidido:** CC BY 4.0 para documentos, roteiros e temas; MIT para as ferramentas; aviso de "como está, sem garantias"; crédito à origem no `README`; e o **logo**, mantido como a imagem tirada do site da Creative Commons Brasil.

---

### Documentos de Apoio

- [As licenças Creative Commons](https://creativecommons.org/share-your-work/cclicenses/): descrição das seis licenças e das condições.
- [Perguntas frequentes da Creative Commons](https://creativecommons.org/faq/): inclui a recomendação sobre software e as regras de uso do logo e do nome.
- [Texto legal da CC BY 4.0 (português)](https://creativecommons.org/licenses/by/4.0/legalcode.pt): o texto completo da licença escolhida.
- Logo: imagem de divulgação da [Creative Commons Brasil](https://br.creativecommons.net/), marca da Creative Commons.
- Arquivo `LICENSE` na raiz deste repositório.
