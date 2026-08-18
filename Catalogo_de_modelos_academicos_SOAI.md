# Catálogo de modelos acadêmicos para o SOAI

## Documento de especificação funcional e pedagógica

**Objetivo:** transformar o SOAI em um sistema capaz de orientar diferentes tipos de trabalho acadêmico por meio de modelos estruturados, progressivos e reutilizáveis.

## 1. Princípio de arquitetura: separar o curso do produto

O SOAI não deve vincular um único modelo rígido a cada nível acadêmico. A solução mais flexível é trabalhar com dois eixos que se combinam.

O primeiro eixo identifica a **modalidade acadêmica do aluno**: iniciação científica, TCC, especialização, mestrado, doutorado ou pós-doutorado. Esse eixo define a profundidade esperada, a extensão do percurso, o grau de autonomia, os marcos de avaliação e o nível de complexidade metodológica.

O segundo eixo identifica o **tipo de produto** que será produzido: projeto de pesquisa, monografia, artigo científico, revisão de literatura, produto técnico ou tecnológico, dissertação, tese, relatório de pesquisa ou relatório técnico. Esse eixo define as seções, os campos e os documentos que o aluno deve produzir.

> **Regra de vinculação:** a modalidade acadêmica define o nível de exigência; o tipo de produto define a estrutura textual. O sistema deve permitir, por exemplo, que um aluno de especialização produza uma monografia, um artigo ou um produto técnico, e que um doutorando desenvolva uma tese composta por artigos.

### 1.1 Entidades principais do modelo

| Entidade | Função no SOAI | Exemplo |
|---|---|---|
| Modalidade | Define o nível acadêmico e o percurso geral. | Mestrado, Doutorado, TCC. |
| Tipo de produto | Define a arquitetura do trabalho final. | Artigo empírico, revisão, produto tecnológico. |
| Modelo | Conjunto reutilizável de seções, etapas, campos e critérios. | “Artigo científico empírico — v1”. |
| Projeto | Instância do modelo aplicada a um aluno. | “Projeto PPMC-CRC — Matheus”. |
| Seção | Unidade textual ou técnica submetida pelo aluno. | Problema, Método, Resultados. |
| Etapa | Fase de desenvolvimento que pode conter várias seções. | Delimitação, execução, fechamento. |
| Entrega | Arquivo ou formulário enviado para uma finalidade. | Matriz bibliográfica, capítulo, protótipo. |
| Marco | Evento que fecha uma fase ou prepara uma avaliação. | Qualificação, defesa, entrega final. |
| Versão | Registro imutável de uma submissão ou devolução. | Introdução v2, aprovada com ressalvas. |
| Parecer | Avaliação do orientador, da IA ou de ambos. | Triagem, revisão, comparação de versões. |

## 2. Taxonomia recomendada de modelos

A primeira versão do SOAI pode ser lançada com oito modelos de produto. Eles cobrem os casos mais frequentes sem transformar o sistema em um formulário excessivamente genérico.

| Código | Modelo | Uso principal | Produto final típico |
|---|---|---|---|
| `PROJ_PESQ` | Projeto ou pré-projeto de pesquisa | Definir investigação antes da coleta ou desenvolvimento. | Projeto submetível ao curso, com protocolo e cronograma. |
| `MONO` | Monografia acadêmica | TCC, especialização ou trabalho de conclusão baseado em capítulos. | Monografia ou trabalho final em formato tradicional. |
| `ART_EMP` | Artigo científico empírico | Pesquisa com dados, campo, experimento, estudo de caso ou intervenção. | Manuscrito para periódico ou evento. |
| `REV_EST` | Revisão de literatura | Revisão narrativa, integrativa, sistemática ou de escopo. | Artigo ou capítulo de revisão. |
| `PROD_TEC` | Produto técnico ou tecnológico | Desenvolvimento de protocolo, software, guia, modelo, processo ou intervenção. | Produto + memorial/relatório técnico + validação. |
| `DISS` | Dissertação | Pesquisa de mestrado em formato tradicional ou híbrido. | Dissertação com qualificação e defesa. |
| `TESE_ART` | Tese tradicional ou por artigos | Pesquisa de doutorado com maior contribuição original. | Tese, eventualmente composta por artigos. |
| `REL_TEC` | Relatório técnico ou institucional | Acompanhamento, avaliação, diagnóstico ou prestação de resultados. | Relatório técnico com evidências e recomendações. |

A modalidade acadêmica não precisa criar uma nova estrutura para cada curso. Ela deve aplicar regras de profundidade sobre o modelo. Por exemplo, `ART_EMP` pode ser usado na iniciação científica, no mestrado ou no doutorado, mas a quantidade de estudos, a discussão de contribuição original e o grau de validação serão diferentes.

### 2.1 Perfis de exigência por modalidade

| Modalidade | Profundidade esperada | Quantidade de produtos principais | Marcos mínimos |
|---|---|---:|---|
| Iniciação científica | Formação em pesquisa, delimitação, método básico e comunicação dos resultados. | 1 | Projeto, acompanhamento, relatório ou apresentação. |
| TCC | Demonstração de domínio do problema, método e redação acadêmica. | 1 | Projeto, versão completa, revisão final e defesa. |
| Especialização | Aplicação profissional ou acadêmica com recorte factível e produto claro. | 1 ou 2 articulados | Projeto, desenvolvimento, produto/monografia, apresentação. |
| Mestrado | Pesquisa metodologicamente consistente e contribuição delimitada. | 1 principal + derivados | Projeto, qualificação, dissertação/artigo, defesa. |
| Doutorado | Contribuição original, autonomia, robustez teórica e metodológica. | 1 principal + derivados | Projeto, qualificação, produção intermediária, tese, defesa. |
| Pós-doutorado | Plano de trabalho, produção independente, colaboração e disseminação. | Produtos pactuados | Plano, resultados, produção e relatório final. |

## 3. Camadas comuns a todos os modelos

Independentemente do tipo de produto, todo projeto do SOAI deve conter uma camada de planejamento, uma camada de produção e uma camada de fechamento. As seções específicas do texto entram na camada de produção; a agenda, as atas e o controle de versões atravessam todas as camadas.

| Camada | Pergunta que responde | Componentes |
|---|---|---|
| Planejamento | O que será feito, por quê, como e até quando? | Ficha do projeto, problema, pergunta, objetivos, método preliminar, cronograma, riscos. |
| Produção | Que texto ou artefato o aluno precisa construir? | Seções, instrumentos, matriz bibliográfica, dados, análises, produto técnico. |
| Validação | Como saberemos que o trabalho é coerente e defensável? | Critérios de aceite, revisão do orientador, validação externa, pareceres e ajustes. |
| Fechamento | O trabalho está pronto para submissão ou defesa? | Dossiê consolidado, versão final, documentos obrigatórios, ensaio e checklist. |

## 4. Ficha inicial do projeto

A ficha inicial é obrigatória antes de o aluno começar a enviar capítulos. Ela transforma uma intenção ampla em um projeto orientável e alimenta automaticamente o painel, a linha do tempo, o cronômetro e os modelos de seção.

| Campo | Tipo | Obrigatório | Orientação ao aluno |
|---|---|---:|---|
| Título provisório | Texto curto | Sim | Escreva um título informativo, ainda que provisório. |
| Modalidade acadêmica | Seleção | Sim | Escolha IC, TCC, especialização, mestrado, doutorado ou pós-doc. |
| Tipo de produto | Seleção | Sim | Escolha monografia, artigo, revisão, produto técnico e outros. |
| Programa/curso/instituição | Texto | Sim | Informe o contexto institucional e as normas aplicáveis. |
| Orientador(a) | Relação | Sim | Vincule o projeto ao orientador responsável. |
| Coorientador(a) | Relação opcional | Não | Inclua somente se houver pactuação. |
| Data de início | Data | Sim | Início formal do percurso no SOAI. |
| Prazo de entrega | Data | Sim | Data de submissão ou defesa, conforme a etapa. |
| Área e subárea | Seleção/texto | Sim | Use a classificação do programa quando existir. |
| Tema em uma frase | Texto longo curto | Sim | Explique o assunto sem apresentar ainda toda a justificativa. |
| Problema percebido | Texto longo | Sim | Descreva a situação que exige investigação, análise ou intervenção. |
| Pergunta de pesquisa | Texto longo | Conforme modelo | Deve orientar objetivos, método e produto. |
| Objetivo geral | Texto longo | Sim | Declare uma ação central que possa ser concluída. |
| Público ou contexto | Texto longo | Sim | Informe quem, onde ou qual material será estudado/atendido. |
| Produto esperado | Texto longo | Sim | Declare o que estará disponível ao final. |
| Acesso a campo/dados | Seleção + justificativa | Sim | Sem acesso confirmado, registre “a confirmar” e indique alternativa. |
| Situação ética | Seleção | Sim | Não se aplica, análise documental, submissão necessária, aprovação em andamento ou aprovado. |
| Apoios e restrições | Texto longo | Não | Liste tempo, equipe, recursos, dependências e limitações. |
| Normas de entrega | Arquivo/link/texto | Sim | Anexe regulamento, manual ou instruções de defesa. |

### Texto inicial que o aluno deve enviar ao orientador

O SOAI deve oferecer um editor guiado com o seguinte comando:

> “Escreva um texto de uma a duas páginas apresentando o tema, o problema que você observa, por que ele importa, quem ou o que será estudado, o que pretende produzir, quais dados ou fontes poderá acessar, quais são suas principais limitações e qual resultado considera possível entregar dentro do prazo. Não tente escrever a introdução definitiva; produza um diagnóstico inicial para ser discutido com o orientador.”

A IA pode extrair campos desse texto, mas o aluno deve confirmar cada extração. Nenhum campo deve ser considerado aprovado apenas porque foi preenchido automaticamente.

## 5. Modelo universal de plano do aluno

O plano do aluno é o roteiro operacional que acompanha o trabalho inteiro. Ele deve ser criado a partir da ficha inicial e permanecer versionado. A cada orientação, o aluno atualiza somente as partes que mudaram e registra a justificativa.

### Seção A — Identidade e finalidade do trabalho

O aluno deve registrar o tipo de trabalho, o destinatário, a etapa acadêmica, o formato de entrega, o prazo e a contribuição pretendida. O orientador deve verificar se a contribuição é compatível com o nível acadêmico e com os recursos disponíveis.

**Entrega:** ficha preenchida e texto de apresentação do projeto.  
**Critério de aceite:** qualquer leitor do programa consegue compreender o que será produzido e para quem.

### Seção B — Delimitação do tema e do problema

O aluno deve distinguir tema, contexto, problema prático, problema científico, lacuna e recorte. O campo deve impedir o preenchimento por uma única frase vaga. Recomenda-se um formulário em cinco partes: situação observada, consequência, evidência disponível, lacuna a investigar e limite do estudo.

**Entrega:** matriz “situação–problema–evidência–lacuna–recorte”.  
**Critério de aceite:** o problema não pode ser apenas “falta de estudos” ou “necessidade de melhorar”; deve indicar o que está acontecendo e qual decisão o trabalho pretende apoiar.

### Seção C — Pergunta, hipótese ou questão orientadora

O sistema deve mostrar campos diferentes conforme o modelo. Pesquisas empíricas podem usar pergunta e hipótese; revisões podem usar pergunta estruturada; produtos técnicos podem usar problema de desenvolvimento e requisitos; relatórios podem usar perguntas de diagnóstico e avaliação.

**Entrega:** uma pergunta principal e, quando necessário, até quatro subperguntas.  
**Critério de aceite:** cada objetivo específico responde a uma parte da pergunta e cada método produz evidência para respondê-la.

### Seção D — Objetivos e resultados

O aluno deve preencher objetivo geral, objetivos específicos e resultado verificável de cada objetivo. O SOAI deve exigir a relação entre objetivo, atividade, produto e critério de aceite.

| Objetivo específico | Atividade | Evidência produzida | Produto relacionado | Critério de conclusão |
|---|---|---|---|---|
|  |  |  |  |  |

**Critério de aceite:** não aprovar objetivos que descrevam apenas atividades (“estudar”, “pesquisar”, “analisar melhor”) sem indicar resultado observável.

### Seção E — Fundamentação e matriz bibliográfica

O aluno deve manter uma matriz viva das referências usadas para decidir, não apenas uma lista bibliográfica. Cada referência precisa ser associada a um argumento, conceito, método ou evidência.

| Referência | Tipo de fonte | Ideia principal | Trecho/página | Uso no trabalho | Limitação | Seção relacionada |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

**Texto a enviar:** “Apresente a discussão dos conceitos centrais em três a cinco páginas. Não faça apenas resumos artigo por artigo; organize o texto por problemas, convergências, divergências e lacunas.”

**Critério de aceite:** a revisão mostra como a literatura sustenta o problema, o método e a contribuição; não é apenas uma sequência de citações.

### Seção F — Método ou plano de desenvolvimento

O aluno deve explicar desenho, contexto, participantes ou materiais, critérios de inclusão/exclusão, instrumentos, procedimentos, estratégia de análise, limitações e cuidados éticos. Para produto técnico, a seção deve incluir requisitos, processo de desenvolvimento, prototipagem e validação.

**Entrega:** protocolo metodológico em versão 1.  
**Critério de aceite:** outro pesquisador consegue compreender o que será feito, com quais materiais, em que ordem e por que esse procedimento responde à pergunta.

### Seção G — Dados, fontes, materiais e ética

O sistema deve obrigar o aluno a declarar a origem de cada dado ou fonte, a finalidade de uso, o nível de sensibilidade, a autorização, o modo de armazenamento e a forma de descarte ou retenção. Quando não houver dados reais, o aluno deve indicar a alternativa usada para demonstração.

| Fonte/material | Origem | Sensibilidade | Autorização | Finalidade | Armazenamento | Risco | Mitigação |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |

**Critério de aceite:** nenhum trabalho avança para análise ou prototipagem com dados sensíveis sem indicação clara de autorização e procedimento seguro.

### Seção H — Desenvolvimento e análise

O aluno deve enviar a execução como uma cadeia de evidências, e não apenas como um texto final. O modelo deve permitir anexar tabelas, instrumentos, atas de oficina, código, mapas, imagens, registros de decisão e versões de protótipo.

**Entrega:** diário de desenvolvimento ou caderno de pesquisa, atualizado quinzenalmente.  
**Critério de aceite:** cada resultado apresentado pode ser rastreado até uma fonte, um procedimento ou uma decisão registrada.

### Seção I — Resultados e interpretação

O sistema deve separar “o que foi observado” de “o que isso significa”. Para cada resultado, o aluno deve informar a pergunta respondida, a evidência, a interpretação, a relação com a literatura e a limitação.

| Resultado | Evidência | Pergunta respondida | Interpretação | Relação com literatura | Limitação |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

### Seção J — Conclusão, contribuição e continuidade

O aluno deve concluir retomando problema, pergunta, objetivos, resultado e contribuição, sem apresentar afirmações maiores do que as evidências permitem. Também deve declarar o que o trabalho não demonstrou e quais etapas futuras são necessárias.

**Texto a enviar:** “Escreva a conclusão em três movimentos: o que o estudo respondeu; qual contribuição efetiva entregou; e quais limites e próximos passos permanecem.”

### Seção K — Preparação para a entrega e defesa

Essa seção é ativada quando todas as seções anteriores alcançam o estado “aprovada” ou “aprovada com ajustes finais”. Ela reúne versão consolidada, normas, documentos, apresentação, roteiro oral, perguntas prováveis e pendências administrativas.

**Critério de aceite:** o dossiê final é coerente, está na versão correta, contém anexos obrigatórios e foi revisado contra as exigências formais do programa.

## 6. Modelos de produto: estrutura de seções

### 6.1 `PROJ_PESQ` — projeto ou pré-projeto

| Ordem | Seção | Pergunta para o aluno | Entrega |
|---:|---|---|---|
| 1 | Título e resumo | O que será investigado e com qual finalidade? | Título, resumo provisório e palavras-chave. |
| 2 | Contexto e problema | Que situação exige investigação? | Texto de delimitação e matriz do problema. |
| 3 | Justificativa | Por que o estudo é relevante e viável? | Justificativa teórica, social, institucional e metodológica. |
| 4 | Pergunta/hipótese | Qual resposta o estudo buscará construir? | Questão principal, subquestões e/ou hipótese. |
| 5 | Objetivos | O que será realizado e entregue? | Objetivo geral, específicos e resultados verificáveis. |
| 6 | Fundamentação | Que conceitos e pesquisas sustentam o projeto? | Revisão dirigida e matriz bibliográfica. |
| 7 | Método | Como a investigação será realizada? | Protocolo metodológico. |
| 8 | Ética e riscos | Que riscos existem e como serão tratados? | Matriz ética, institucional e de proteção de dados. |
| 9 | Cronograma e recursos | O plano cabe no prazo e nos recursos? | Cronograma, dependências e plano de contingência. |
| 10 | Referências e anexos | Quais fontes e instrumentos sustentam o projeto? | Referências, instrumentos e autorizações disponíveis. |

### 6.2 `MONO` — monografia ou trabalho final tradicional

| Ordem | Seção | Entregável do aluno |
|---:|---|---|
| 1 | Elementos pré-textuais | Capa, folha de rosto, resumo, abstract e sumário conforme norma. |
| 2 | Introdução | Contexto, problema, pergunta, objetivos, justificativa, método resumido e estrutura do trabalho. |
| 3 | Fundamentação teórica | Discussão conceitual organizada por categorias analíticas. |
| 4 | Método | Desenho, fontes, participantes/material, procedimentos, análise, ética e limitações. |
| 5 | Resultados | Apresentação organizada das evidências. |
| 6 | Discussão | Interpretação, diálogo com literatura, implicações e limites. |
| 7 | Conclusão | Resposta à pergunta, contribuição, limitações e continuidade. |
| 8 | Referências | Lista normalizada e conferida. |
| 9 | Apêndices/anexos | Instrumentos, tabelas, termos, documentos e produtos complementares. |

### 6.3 `ART_EMP` — artigo científico empírico

| Ordem | Seção | Campo/entrega guiada |
|---:|---|---|
| 1 | Título e resumo | Problema, método, resultado principal e conclusão em formato conciso. |
| 2 | Introdução | O que se sabe, o que falta saber e qual pergunta o estudo responde. |
| 3 | Método | Desenho, cenário, amostra/material, procedimentos, análise e ética. |
| 4 | Resultados | Evidências sem antecipar discussão excessiva. |
| 5 | Discussão | Significado, comparação, implicações e limitações. |
| 6 | Conclusão | Mensagem principal proporcional aos resultados. |
| 7 | Declarações | Conflitos, financiamento, autoria, disponibilidade de dados e ética, quando aplicável. |
| 8 | Referências e material suplementar | Referências, instrumentos, tabelas e arquivos complementares. |

O orientador deve escolher, no cadastro do projeto, o periódico ou evento-alvo. O SOAI deve importar seus limites de palavras, estilo, estrutura, número de figuras, política de dados e documentos exigidos.

### 6.4 `REV_EST` — revisão de literatura

| Tipo de revisão | Seções adicionais obrigatórias |
|---|---|
| Narrativa | Estratégia de busca, critérios de seleção declarados e síntese crítica. |
| Integrativa | Questão estruturada, bases consultadas, estratégia de busca, critérios, avaliação e síntese. |
| Sistemática | Protocolo, registro quando aplicável, estratégia reproduzível, fluxograma de seleção, avaliação de qualidade e síntese. |
| Escopo | Pergunta de mapeamento, critérios, busca ampla, categorização e lacunas do campo. |

O modelo não deve permitir que o aluno selecione “revisão sistemática” como etiqueta apenas por preferência. Ele deve ativar campos sobre protocolo, busca, seleção, avaliação e rastreabilidade, que serão validados pelo orientador.

### 6.5 `PROD_TEC` — produto técnico ou tecnológico

| Ordem | Seção | Entrega |
|---:|---|---|
| 1 | Demanda e público | Problema, usuário, contexto e decisão que o produto apoiará. |
| 2 | Diagnóstico | Evidências da demanda, atores, fluxo atual e lacunas. |
| 3 | Requisitos | Requisitos funcionais, não funcionais, legais, éticos e de acessibilidade. |
| 4 | Referenciais | Bases teóricas, normativas e técnicas. |
| 5 | Desenvolvimento | Método de concepção, prototipagem, iterações e decisões. |
| 6 | Produto | Arquivo, protótipo, protocolo, software, guia, modelo ou processo. |
| 7 | Validação | Participantes, critérios, instrumentos, resultados e ajustes. |
| 8 | Implementação | Recursos, riscos, responsáveis, manutenção e escalabilidade. |
| 9 | Memorial técnico | Como usar, limitações, versão, autoria e condições de reprodução. |
| 10 | Relatório/reflexão | Contribuição, limitações e relação com o problema inicial. |

### 6.6 `DISS` e `TESE_ART` — dissertação e tese

Esses modelos devem reaproveitar as seções da monografia, mas acrescentar governança de projeto, qualificação, produção intermediária e contribuição. Na tese por artigos, o sistema deve tratar cada artigo como subprojeto versionado e manter uma seção integradora com problema geral, coerência entre artigos, contribuição original e síntese final.

| Componente | Dissertação | Tese |
|---|---|---|
| Pergunta | Delimitada e respondível no período do curso. | Original, relevante e capaz de sustentar contribuição nova. |
| Fundamentação | Demonstra domínio crítico do campo. | Constrói posicionamento e lacuna original. |
| Método | Consistente e justificável. | Robusto, transparente e adequado à contribuição pretendida. |
| Produto | Dissertação, artigo ou produto pactuado. | Tese tradicional ou conjunto de artigos articulados. |
| Validação | Qualificação e defesa. | Qualificação, produção intermediária, defesa e, quando exigido, publicações. |
| Fechamento | Texto, anexos, apresentação e resposta à banca. | Dossiê integrado, contribuição original e plano de disseminação. |

### 6.7 `REL_TEC` — relatório técnico

O relatório deve ser orientado por decisão. Suas seções são: demanda e finalidade; escopo e período; método de levantamento; evidências; análise; riscos; recomendações priorizadas; plano de ação; responsáveis; anexos e fonte dos dados. O sistema deve exigir que cada recomendação tenha problema de origem, evidência, responsável, prazo e indicador.

## 7. Etapas do percurso no SOAI

A etapa é diferente da seção. Uma seção é algo que se escreve ou produz; uma etapa é um estado do projeto que deve ser concluído antes de avançar.

| Código | Etapa | Entrada | Saída obrigatória | Estado de fechamento |
|---|---|---|---|---|
| `E0` | Acolhimento e diagnóstico | Cadastro e regulamento. | Ficha inicial, riscos e agenda. | Projeto criado e escopo inicial reconhecido. |
| `E1` | Delimitação | Tema e contexto. | Problema, pergunta, objetivos e recorte. | Orientador aprova a pergunta e o produto. |
| `E2` | Fundamentação | Pergunta validada. | Matriz bibliográfica e marco conceitual. | Fontes centrais e lacuna identificadas. |
| `E3` | Método/projeto | Marco conceitual. | Protocolo, instrumentos, ética e cronograma. | Método executável e riscos tratados. |
| `E4` | Desenvolvimento/coleta | Método aprovado. | Dados, fontes, diário de pesquisa ou produto em construção. | Evidências suficientes e rastreáveis. |
| `E5` | Análise/validação | Material produzido. | Análises, resultados, validação e ajustes. | Perguntas respondidas e limitações registradas. |
| `E6` | Redação integrada | Seções aprovadas isoladamente. | Texto completo e coerente. | Dossiê consolidado aprovado para revisão final. |
| `E7` | Pré-defesa | Versão completa. | Apresentação, respostas e checklist institucional. | Aluno apto a defender. |
| `E8` | Pós-defesa | Ata/parecer da banca. | Versão final, depósito, publicação ou produto entregue. | Pendências encerradas e projeto arquivado. |

## 8. Campos padronizados de toda seção

Cada seção textual ou técnica criada no SOAI deve possuir metadados comuns. Isso permitirá que a IA faça triagem, que o orientador compare versões e que o dossiê consolidado seja gerado sem perder contexto.

| Campo | Descrição |
|---|---|
| `sectionCode` | Código estável da seção, por exemplo `INTRO_PROBLEMA`. |
| `title` | Título exibido ao aluno. |
| `purpose` | Para que a seção existe no trabalho. |
| `promptAluno` | Enunciado que orienta o aluno a produzir o texto/artefato. |
| `required` | Define se é obrigatória para o modelo selecionado. |
| `order` | Ordem de apresentação ou de produção. |
| `inputType` | Texto, tabela, arquivo, link, seleção, data, matriz, protótipo ou combinação. |
| `minWords` / `maxWords` | Limites sugeridos, quando aplicável. |
| `evidenceRequired` | Se exige fonte, dado, instrumento, autorização ou anexo. |
| `dependencies` | Seções que precisam estar concluídas antes. |
| `acceptanceCriteria` | Critérios que o orientador usará para aprovar. |
| `status` | Rascunho, enviado, em revisão, ajustes solicitados, aprovado com ressalvas, aprovado, congelado. |
| `visibility` | Privado, compartilhado com orientador, liberado ao aluno, consolidado. |
| `aiAllowed` | Define se a IA pode extrair, resumir, comparar ou sugerir. |
| `aiDisclosure` | Registro de como a IA foi usada na seção. |
| `version` | Versão imutável da submissão. |
| `reviewDeadline` | Prazo de devolutiva pactuado. |
| `finalInclusion` | Se a seção entra automaticamente no dossiê consolidado. |

### Prompt-padrão para o aluno escrever uma seção

O sistema deve montar o prompt a partir dos metadados:

> “Você está escrevendo a seção **{título}** do trabalho **{título do projeto}**, no modelo **{tipo de produto}**. A finalidade desta seção é **{finalidade}**. Escreva um texto/artefato de **{extensão ou formato}**, respondendo a **{pergunta orientadora}**. Use as fontes e evidências anexadas, identifique limites e não invente dados, referências, resultados ou autorizações. Ao final, informe quais pontos ainda dependem de decisão do orientador.”

## 9. Critérios de aprovação de seções

O orientador deve poder aprovar uma seção sem reescrever tudo. Para isso, cada modelo terá uma rubrica curta de cinco dimensões. A nota não substitui o parecer textual, mas torna a decisão comparável entre versões.

| Dimensão | 0 — ausente | 1 — insuficiente | 2 — adequado | 3 — forte |
|---|---|---|---|---|
| Pertinência | Não responde ao trabalho. | Relaciona-se de modo indireto. | Responde ao objetivo da seção. | Responde e fortalece o argumento geral. |
| Coerência | Contradiz outras partes. | Há saltos ou lacunas. | Mantém encadeamento compreensível. | Integra conceitos, método e resultado. |
| Evidência | Sem fonte ou suporte. | Evidência frágil ou incompleta. | Fontes/dados adequados. | Evidência robusta e bem delimitada. |
| Clareza | Texto/artefato incompreensível. | Requer grande reconstrução. | Pode ser compreendido e revisado. | É preciso, fluido e econômico. |
| Conformidade | Viola regra do modelo. | Atende parcialmente à norma. | Atende ao modelo e às instruções. | Atende e antecipa exigências de entrega. |

**Regra sugerida:** uma seção somente pode ser marcada como “aprovada” se atingir pelo menos nível 2 em todas as dimensões e não possuir pendência crítica. A aprovação com ressalvas deve registrar até cinco ajustes objetivos e prazo para nova versão.

## 10. Texto que o aluno envia ao orientador em cada ciclo

O SOAI deve oferecer um formulário de submissão com quatro blocos curtos, além do arquivo principal. Isso reduz o tempo de leitura e ajuda o orientador a capturar decisões.

> **O que produzi:** descreva o que foi feito desde a última reunião e indique a seção/entrega correspondente.
>
> **O que mudou:** registre alterações de pergunta, objetivo, método, fonte, análise, produto ou cronograma.
>
> **Onde tenho dúvida:** formule até três perguntas que exigem decisão do orientador; não envie apenas “favor revisar”.
>
> **O que preciso para avançar:** informe se depende de leitura, autorização, dados, decisão metodológica, correção textual ou reunião.

Campos adicionais devem registrar arquivos vinculados, versão anterior, prazo desejado e confirmação de que o texto é de autoria do aluno ou identifica claramente o uso de ferramentas de IA.

## 11. Modelos de reunião e ata

O SOAI já possui uma ata com sete seções canônicas. Ela deve ser vinculada à etapa, ao modelo e às seções discutidas. A ata não deve ser apenas um registro narrativo: precisa funcionar como contrato operacional do próximo ciclo.

| Seção da ata existente | Extensão recomendada |
|---|---|
| Cabeçalho | Acrescentar etapa, modelo, versão do projeto, prazo da defesa e seções discutidas. |
| Síntese de avanço | Vincular cada entrega ao objetivo específico e ao critério de aceite. |
| Decisões tomadas | Registrar decisão, justificativa, impacto no escopo e responsável. |
| Questões críticas e riscos | Relacionar risco a probabilidade, impacto e ação de mitigação. |
| Plano até o próximo encontro | Gerar tarefas diretamente na agenda do aluno. |
| Perguntas orientadoras | Usar como prompt da próxima submissão. |
| Próximo encontro | Vincular data, pauta, pré-leitura e prazo de envio. |

## 12. Fechamento para defesa

Quando o trabalho alcançar a etapa `E7`, o SOAI deve gerar um “Dossiê de Defesa” separado do dossiê de versões de trabalho. O dossiê deve preservar o histórico, mas apresentar ao aluno e ao orientador somente a versão consolidada e os documentos finais.

| Bloco | Conteúdo |
|---|---|
| Identificação | Título final, aluno, orientador, programa, modalidade e data. |
| Texto final | Documento integral com seções aprovadas e referências. |
| Produto | Arquivo final, protótipo, memorial, relatório ou material suplementar. |
| Conformidade | Checklist de normas, template institucional, paginação, anexos e assinaturas. |
| Ética e autoria | Situação de aprovação, declarações, uso de IA e fontes de dados. |
| Apresentação | Slides, roteiro oral, tempo, mensagem central e divisão de fala. |
| Perguntas prováveis | Questões da banca, respostas preparadas e pontos de limite. |
| Pendências | Tabela com responsável, prazo e evidência de fechamento. |
| Pós-defesa | Correções da banca, versão depositada, publicação e arquivamento. |

### Checklist de aptidão para defesa

O sistema deve apresentar uma trava de fechamento quando houver pendências críticas. O trabalho somente pode ser marcado como “pronto para defesa” se o orientador confirmar que a pergunta está respondida, os objetivos foram tratados, o método foi descrito, os resultados estão apoiados por evidências, as limitações foram explicitadas, as referências foram conferidas, o produto está anexado quando aplicável, as normas institucionais foram verificadas e as questões éticas e de autoria estão registradas.

## 13. Prioridade de implementação no SOAI

Para evitar que o catálogo vire uma grande mudança de software, a implementação pode ser feita em três blocos. O primeiro bloco cria o núcleo universal, que já conversa diretamente com as funcionalidades descritas no README. O segundo adiciona os modelos de produto mais usados. O terceiro libera a preparação para defesa e os controles avançados de autoria e IA.

| Prioridade | Entrega funcional | Benefício |
|---|---|---|
| P0 | Entidade `Modelo`, campos de projeto, etapas, seções, critérios, status e vínculo com agenda/ata. | Torna a orientação estruturada e versionável. |
| P0 | Ficha inicial, plano universal e submissão com quatro blocos do aluno. | Reduz mensagens dispersas e melhora a qualidade da pré-leitura. |
| P0 | Modelos `PROJ_PESQ`, `MONO`, `ART_EMP` e `PROD_TEC`. | Cobre a maior parte dos usos acadêmicos e profissionais. |
| P1 | `REV_EST`, `DISS`, `TESE_ART` e `REL_TEC`. | Amplia o catálogo sem alterar o núcleo. |
| P1 | Critérios de aceite, rubrica, travas de etapa e dossiê consolidado por modelo. | Permite ao orientador fechar etapas com segurança. |
| P1 | Dossiê de defesa, checklist institucional e pós-defesa. | Conecta orientação cotidiana ao resultado final. |
| P2 | IA para extração, comparação, triagem e preenchimento sugerido. | Acelera tarefas repetitivas, mantendo aprovação humana. |
| P2 | Auditoria de autoria e painel de indicadores do percurso. | Apoia acompanhamento e integridade, sem substituir julgamento docente. |

## 14. Decisões de produto que precisam ser fixadas

Antes do desenvolvimento, o SOAI deve definir se modelos poderão ser duplicados e editados pelo orientador, se o programa poderá publicar modelos institucionais, se o aluno poderá sugerir uma nova seção, como lidar com modelos alterados durante o projeto, se os critérios de aceite ficam visíveis antes da submissão e quais dados da IA serão mantidos no histórico.

Recomenda-se que o modelo-base seja versionado pelo sistema, que cada projeto receba uma cópia congelável do modelo no momento da criação, que alterações posteriores sejam registradas como migrações e que o orientador possa adaptar campos opcionais sem apagar a estrutura original. O aluno deve visualizar os critérios de aceite antes de escrever; isso torna a orientação mais pedagógica e reduz retrabalho.

## 15. Resultado esperado

Com essa arquitetura, o SOAI deixa de ser apenas um repositório de atas, documentos e pareceres. Ele passa a funcionar como um **sistema de percurso acadêmico**, no qual o aluno sabe o que precisa produzir, o orientador consegue avaliar em que nível o material está e o sistema mantém a ligação entre pergunta, objetivo, método, evidência, seção, decisão e versão final.

A primeira versão do catálogo deve priorizar consistência e rastreabilidade. É preferível oferecer quatro modelos bem definidos, com prompts e critérios de aceite claros, do que disponibilizar muitos modelos que apenas trocam títulos de capítulos. O ganho principal para o orientador será conseguir capturar, em cada encontro, não somente “o que foi discutido”, mas **qual decisão foi tomada, qual parte do trabalho mudou e qual evidência encerrará a próxima etapa**.
