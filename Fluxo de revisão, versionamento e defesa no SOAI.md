# Fluxo de revisão, versionamento e defesa no SOAI

## 1. Finalidade

Este documento traduz os modelos acadêmicos em estados operacionais do sistema. O objetivo é que cada texto ou artefato tenha uma situação clara, um responsável, uma próxima ação e um critério para avançar. A existência de uma versão não deve significar que ela foi lida, aceita ou incorporada ao trabalho final.

## 2. Estados do projeto

| Estado | Significado | Quem pode alterar | Condição de entrada | Condição de saída |
|---|---|---|---|---|
| `DRAFT` | Projeto em configuração inicial. | Orientador e aluno, conforme permissão. | Cadastro criado. | Ficha inicial e modelo selecionados. |
| `ACTIVE` | Projeto em acompanhamento regular. | Orientador. | Escopo inicial reconhecido. | Entrega final, pausa ou encerramento. |
| `PAUSED` | Projeto temporariamente suspenso. | Orientador, com motivo. | Impedimento formal, licença ou falta de acesso. | Novo plano e data de retomada. |
| `AT_RISK` | Projeto ativo com risco relevante de prazo, escopo, ética ou método. | Orientador. | Critério de risco acionado. | Risco mitigado ou projeto pausado/recortado. |
| `READY_FOR_DEFENSE` | Dossiê consolidado apto para banca. | Orientador. | Todos os gates de defesa concluídos. | Defesa realizada ou retorno para ajustes. |
| `POST_DEFENSE` | Defesa realizada, pendências da banca em tratamento. | Orientador. | Ata ou resultado registrado. | Versão depositada e encerramento. |
| `COMPLETED` | Percurso encerrado e arquivado. | Orientador/admin. | Entrega final ou pós-defesa concluída. | Nenhuma; apenas consulta autorizada. |

## 3. Estados de seção ou entrega

A seção precisa ter estados mais detalhados que o projeto. O aluno pode salvar rascunhos sem notificar o orientador; somente uma submissão formal entra na fila de revisão.

| Estado | Ação permitida ao aluno | Ação do orientador | Entra no dossiê consolidado? |
|---|---|---|---:|
| `DRAFT` | Editar e anexar material. | Consultar, se compartilhado. | Não |
| `SUBMITTED` | Não alterar a versão enviada; pode criar nova versão. | Aceitar para leitura ou devolver por falta de informação. | Não |
| `IN_REVIEW` | Aguardar ou responder em nova versão. | Comentar, usar triagem e preencher rubrica. | Não |
| `CHANGES_REQUESTED` | Corrigir conforme parecer. | Aguardar nova submissão. | Não |
| `APPROVED_WITH_NOTES` | Corrigir notas não críticas ou reconhecer pendências. | Definir se a seção pode avançar. | Não, salvo decisão explícita |
| `APPROVED` | Consultar e usar como base; não editar a versão congelada. | Reabrir somente com justificativa. | Sim |
| `FROZEN` | Não modificar; deve criar nova versão derivada. | Descongelar mediante registro. | Sim |
| `ARCHIVED` | Apenas consultar. | Apenas consultar, salvo permissão administrativa. | Não |

### 3.1 Regras de transição

| Origem | Destino | Regra |
|---|---|---|
| `DRAFT` | `SUBMITTED` | O aluno confirma que a entrega está pronta para leitura, informa versão e dúvidas. |
| `SUBMITTED` | `IN_REVIEW` | O orientador inicia a revisão ou libera a análise assistida. |
| `IN_REVIEW` | `CHANGES_REQUESTED` | Há pendências que impedem aprovação. O parecer precisa especificar ajustes. |
| `IN_REVIEW` | `APPROVED_WITH_NOTES` | A seção é utilizável, mas possui ajustes não críticos. |
| `IN_REVIEW` | `APPROVED` | A rubrica atende ao mínimo e não há pendência crítica. |
| `APPROVED_WITH_NOTES` | `APPROVED` | As notas foram atendidas ou formalmente aceitas pelo orientador. |
| `APPROVED` | `FROZEN` | A seção foi incluída na versão consolidada ou no dossiê de defesa. |
| Qualquer estado não arquivado | `ARCHIVED` | Projeto encerrado, substituição formal ou exclusão lógica. |

O sistema não deve permitir que o aluno altere o conteúdo de uma versão `APPROVED` ou `FROZEN`. O aluno sempre poderá criar uma nova versão derivada, que deve conservar o vínculo com a versão anterior e com o parecer que motivou a alteração.

## 4. Estrutura mínima do parecer do orientador

O parecer não deve ser apenas um campo de texto livre. Ele precisa permitir que o SOAI transforme a leitura em tarefas e compare o atendimento em versões futuras.

| Campo | Obrigatório | Finalidade |
|---|---:|---|
| Decisão | Sim | Solicitar ajustes, aprovar com notas ou aprovar. |
| Síntese | Sim | Explicar em linguagem direta o estado da seção. |
| Pontos fortes | Não | Registrar o que deve ser preservado. |
| Ajustes críticos | Sim quando houver | Itens que impedem a aprovação. |
| Ajustes recomendados | Não | Melhorias desejáveis, mas não bloqueadoras. |
| Referência ao trecho | Sim para ajustes textuais | Indicar parágrafo, página, tabela, arquivo ou item de requisito. |
| Critério afetado | Sim | Pertinência, coerência, evidência, clareza ou conformidade. |
| Responsável | Sim | Aluno, orientador, coorientador ou secretaria. |
| Prazo | Não | Data para correção ou decisão. |
| Parecer liberado ao aluno | Sim | Controle de compartilhamento do parecer. |
| Uso de IA no parecer | Sim | Registrar se houve triagem, comparação ou geração de sugestão. |

### Modelo de item de revisão

```text
ID: REV-{sectionCode}-{version}-{sequence}
Trecho/localização: {parágrafo, página, tabela ou requisito}
Tipo: crítico | recomendado | dúvida
Dimensão: pertinência | coerência | evidência | clareza | conformidade
Observação do orientador: {texto}
Ação solicitada ao aluno: {verbo + resultado esperado}
Critério de atendimento: {como saberemos que foi resolvido}
Responsável: {nome/perfil}
Prazo: {data opcional}
Status: aberto | atendido | parcialmente atendido | dispensado
```

## 5. Comparação entre versões

Quando o aluno submeter uma nova versão, o SOIA deve criar um laudo de atendimento vinculado ao parecer anterior. A comparação deve ser feita em três camadas: alterações no texto/artefato, atendimento das solicitações e impacto no argumento ou produto.

| Camada | Pergunta | Resultado esperado |
|---|---|---|
| Alteração | O que foi incluído, removido, deslocado ou reescrito? | Lista de mudanças com localização. |
| Atendimento | Cada ajuste pedido foi atendido, parcialmente atendido ou ignorado? | Tabela de rastreabilidade dos itens de revisão. |
| Coerência | A mudança criou contradição com outra seção? | Alertas de inconsistência para leitura humana. |
| Evidência | Foram incluídos dados, fontes ou anexos que sustentam a mudança? | Relação entre nova afirmação e suporte. |
| Decisão | A seção pode avançar? | Sugestão de decisão, sempre sujeita ao orientador. |

O aluno deve visualizar o status de atendimento de cada observação. O sistema não deve considerar uma correção “atendida” apenas porque palavras semelhantes apareceram na nova versão; é necessário registrar a evidência e manter a decisão humana.

## 6. Uso da IA no ciclo de orientação

A IA deve operar como assistência de leitura, organização e comparação. O SOIA deve preservar a distinção entre sugestão automática e decisão acadêmica.

| Função de IA | Entrada | Saída | Visibilidade inicial | Ação humana necessária |
|---|---|---|---|---|
| Extração de seções | Arquivo enviado pelo aluno. | Sugestão de título, seção, campos e trechos. | Orientador e/ou aluno, conforme configuração. | Aluno confirma ou corrige a classificação. |
| Triagem diagnóstica | Seção submetida. | Resumo, forças, lacunas e recomendações. | Oculta do aluno até liberação do orientador. | Orientador revisa e decide o que compartilhar. |
| Comparação de versões | Versão anterior, atual e parecer. | Laudo de alterações e atendimento. | Orientador primeiro; depois aluno. | Orientador valida os achados. |
| Sugestão de estrutura | Ficha inicial e modelo. | Perguntas e campos faltantes. | Aluno e orientador. | Usuário aceita, rejeita ou edita. |
| Auditoria de autoria | Seção ou documento. | Sinais e justificativas de padrões linguísticos. | Orientador. | Não aplicar sanção automática; realizar conversa e análise contextual. |

### 6.1 Registro obrigatório de IA

Cada execução de IA deve armazenar, em registro próprio e vinculado à seção, o modelo utilizado, data/hora, função, versão do prompt, documentos de entrada, saída, usuário que acionou, situação de revisão humana e decisão de liberação. A saída não deve substituir a versão do aluno nem o parecer do orientador.

A auditoria de autoria deve ser tratada como instrumento de apoio, não como detector conclusivo. Uma pontuação ou classificação não deve, isoladamente, produzir reprovação, acusação ou bloqueio do trabalho. O sistema deve mostrar limitações, permitir contestação e preservar a autonomia do orientador e as regras do programa.

## 7. Dossiê consolidado

O dossiê consolidado deve ser gerado por regras, não por simples concatenação de todos os arquivos. O sistema deve selecionar a versão mais recente aprovada ou congelada de cada seção obrigatória do modelo e informar as lacunas.

### Regra de composição

```text
Para cada seção obrigatória do modelo:
  localizar a versão mais recente com status APPROVED ou FROZEN;
  verificar se há pendência crítica aberta;
  inserir a seção na ordem definida pelo modelo;
  preservar referências, tabelas, imagens e anexos vinculados;
  registrar seção, versão, data e responsável no manifesto do dossiê;
se faltar seção obrigatória:
  impedir marcação de pronto para defesa;
  gerar relatório de lacunas;
```

### Manifesto do dossiê

| Campo | Conteúdo |
|---|---|
| Projeto | Identificador e título. |
| Modelo e versão | Tipo de produto e versão do template. |
| Data de geração | Momento do fechamento. |
| Seções incluídas | Código, título, versão e status. |
| Seções ausentes | Obrigatórias ainda não aprovadas. |
| Anexos | Arquivos e versões. |
| Pareceres | Último parecer por seção. |
| Declarações | Autoria, IA, ética, conflito e financiamento quando aplicável. |
| Hash/identificador | Identificação técnica do pacote gerado. |
| Aprovador | Orientador e data da aprovação. |

## 8. Gate de passagem entre etapas

O SOAI deve utilizar “gates” para evitar que o aluno avance apenas acumulando texto. O gate não é uma nota; é uma verificação de prontidão.

| Gate | Verificações mínimas | Decisão possível |
|---|---|---|
| `G1_SCOPE` | Problema, pergunta, objetivo, produto e recorte coerentes. | Aprovado / retornar à delimitação. |
| `G2_METHOD` | Método executável, fontes, instrumentos, ética e cronograma. | Aprovado / revisar método. |
| `G3_EVIDENCE` | Evidências suficientes, rastreáveis e compatíveis com o método. | Aprovado / coletar ou documentar mais. |
| `G4_INTEGRATION` | Seções articuladas, referências e argumentos sem contradições. | Aprovado / solicitar integração. |
| `G5_DEFENSE` | Dossiê completo, normas conferidas, apresentação e pendências encerradas. | Pronto para defesa / retornar para ajustes. |

Cada gate deve gerar um registro com data, participantes, pendências, decisão e prazo de reavaliação. A mudança de etapa não deve apagar histórico ou permitir que uma seção não aprovada seja tratada como parte final.

## 9. Permissões e isolamento

A regra de ownership descrita no README deve ser aplicada também aos modelos e pareceres. O orientando somente deve acessar modelos institucionais publicados, seu próprio projeto, suas versões, seus pareceres liberados e as atas das quais participa. O orientador pode acessar projetos sob sua responsabilidade. Um coorientador deve ter escopo explícito por projeto ou por seção.

| Recurso | Aluno | Orientador | Coorientador | Administrador |
|---|---:|---:|---:|---:|
| Modelo publicado | Ler | Ler/usar | Ler/usar | Criar/editar/publicar |
| Modelo em rascunho | Não | Conforme vínculo | Conforme vínculo | Sim |
| Ficha do próprio projeto | Ler/editar | Ler/editar | Ler conforme permissão | Auditoria |
| Projeto de outro aluno | Não | Não, salvo vínculo | Não | Acesso técnico auditado |
| Parecer de IA não liberado | Não | Sim | Conforme permissão | Conforme política |
| Parecer liberado | Sim | Sim | Sim, se vinculado | Auditoria |
| Versão congelada | Ler | Reabrir com motivo | Ler | Auditoria |
| Dossiê de defesa | Ler após liberação | Criar/aprovar | Conforme permissão | Auditoria |

## 10. Fluxo de fechamento para a defesa

O fechamento deve iniciar 30 a 60 dias antes da data prevista, conforme a modalidade. O sistema deve gerar tarefas progressivas, começando pela conferência do texto e terminando com o pós-defesa.

| Momento | Ação do aluno | Ação do orientador | Saída |
|---|---|---|---|
| Preparação | Confirma prazo, norma e versão-base. | Revisa escopo e lista lacunas. | Plano de fechamento. |
| Consolidação | Corrige seções e anexa produto. | Aprova ou solicita ajustes finais. | Dossiê preliminar. |
| Conformidade | Confere formatação, referências, anexos e declarações. | Faz leitura final de coerência e risco. | Checklist assinado. |
| Defesa | Prepara apresentação, roteiro e respostas. | Simula perguntas e ajusta mensagem central. | Apresentação e ensaio registrados. |
| Pós-defesa | Executa correções da banca. | Confere atendimento e autoriza depósito. | Versão final arquivada. |

## 11. Indicadores do percurso

O painel do orientador deve medir o processo sem reduzir a orientação a uma competição de produtividade. Recomenda-se exibir indicadores de situação, não rankings.

| Indicador | Definição |
|---|---|
| Seções aprovadas | Quantidade e proporção de seções obrigatórias aprovadas. |
| Idade da versão em revisão | Dias desde a submissão sem decisão. |
| Pendências críticas abertas | Quantidade de itens que impedem avanço. |
| Retrabalho por seção | Número de versões até aprovação. |
| Atraso do projeto | Diferença entre marco previsto e realizado. |
| Risco de prazo | Classificação baseada em marcos vencidos e entregas pendentes. |
| Cobertura de evidências | Proporção de afirmações/artefatos com fonte ou suporte registrado, quando aplicável. |
| Prontidão para defesa | Percentual de gates e checklist concluídos. |

## 12. Contrato pedagógico do sistema

O SOAI deve apresentar ao aluno, no início do projeto, três compromissos claros. Primeiro, o sistema orienta, mas não substitui a autoria intelectual nem a responsabilidade por dados, fontes e decisões. Segundo, toda entrega precisa ter finalidade, versão e pergunta para o orientador. Terceiro, a aprovação é uma decisão registrada do orientador; a IA pode sugerir, comparar e alertar, mas não aprova nem reprova o trabalho.

A interface deve tornar esses compromissos visíveis sem criar linguagem punitiva. O aluno precisa saber não somente que uma seção foi devolvida, mas por que foi devolvida, que critério precisa ser atendido e qual produto deve ser reenviado.
