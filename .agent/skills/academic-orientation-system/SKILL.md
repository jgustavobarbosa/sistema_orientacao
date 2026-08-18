---
name: academic-orientation-system
description: >
  Skill especializada para o Sistema de Orientação Acadêmica Inteligente (SOAI).
  Use esta skill sempre que o usuário pedir para implementar, evoluir, corrigir,
  documentar ou testar qualquer parte do sistema de gestão de orientandos,
  atas de orientação, marcos acadêmicos, integração Google Workspace,
  parecer LLM de documentos ou painéis de orientador/aluno.
  Ativa automaticamente regras de domínio, modelo de dados, isolamento multi-aluno
  e o template oficial de ata de orientação.
---

# Skill: Sistema de Orientação Acadêmica Inteligente (SOAI)

## Contexto do Domínio

Este é um **sistema pessoal** do orientador para gerenciar seus próprios orientandos
(IC, TCC, Mestrado, Doutorado, Pós-Doc). Não é multi-instituição nesta versão.

**Princípios inegociáveis:**
1. O orientador é o dono absoluto do sistema.
2. Um orientando **nunca** vê dados, documentos, atas ou pareceres de outro orientando.
3. O **parecer LLM** de qualquer documento é **visível somente ao orientador**.
4. Google Calendar, Drive, Docs e Sheets são a fonte principal de arquivos e agenda.
5. O formulário de ata deve seguir fielmente o template oficial de registro de orientação.

## Template Oficial de Ata (obrigatório)

Ao criar ou editar o formulário de encontro, use exatamente estas seções:

1. **Cabeçalho**: Encontro nº, Data, Versão do material analisado, Participantes, Pergunta de pesquisa vigente, Produto em desenvolvimento, Situação do cronograma (Verde / Amarelo / Vermelho)
2. **Síntese do avanço** desde o encontro anterior (tabela: Entrega prevista | Situação | Evidência/link | Observação)
3. **Decisões tomadas** (tabela: Decisão | Justificativa acadêmica ou operacional | Impacto no escopo/produto | Responsável)
4. **Questões críticas e riscos** (tabela: Dimensão | Situação observada | Nível de risco | Ação de mitigação | Data de revisão)
5. **Plano de trabalho** até o próximo encontro (tabela: Tarefa | Produto ou critério de aceite | Responsável | Prazo | Status)
6. **Perguntas que devem orientar a próxima entrega**
7. **Próximo encontro**: Data e horário, Material a encaminhar com 72h de antecedência, Três decisões que o aluno precisa destravar, Critério para considerar a entrega adequada

## Modelo de Dados Canônico

Sempre use estas entidades e nomes (PostgreSQL + JSONB):

- `Usuario` (papel: ORIENTADOR | ORIENTANDO, campo `ativo` controlado pelo orientador)
- `ProjetoOrientacao`
- `MarcoAcademico` (tipos: CAPITULO, APRESENTACAO, REVISAO, CHECKLIST, QUALIFICACAO, DEFESA, SUBMISSAO, OUTRO)
- `Reuniao` (campos JSON para as seções da ata)
- `TarefaReuniao`
- `Documento`
- `ParecerLLM` (sempre com flag de visibilidade apenas orientador)

## Regras de Segurança (aplicar em todo código)

```typescript
// Pseudocódigo obrigatório em toda rota/serviço
if (session.user.papel === 'ORIENTANDO') {
  if (recurso.projeto.orientando_id !== session.user.id) {
    throw new ForbiddenError('Acesso negado a recurso de outro orientando');
  }
}
```

- Nunca retorne `ParecerLLM` em endpoints acessíveis pelo aluno.
- Toda tentativa 403 deve ser logada em tabela de auditoria.

## Integrações Google (escopos mínimos)

- `calendar.events`
- `drive.file` (ou drive se necessário)
- `documents`
- `spreadsheets`

Ao criar um novo projeto, crie automaticamente a estrutura de pastas no Drive:

```
SOAI - [Nome do Aluno] - [Título curto]/
├── 00 - Plano de Orientação
├── 01 - Plano de Pesquisa
├── 02 - Capítulos e Manuscritos
├── 03 - Atas de Reunião
├── 04 - Dados e Scripts
├── 05 - Ética e Autorizações
└── 06 - Apresentações e Slides
```

## Parecer LLM — Prompt Padrão

Ao gerar parecer de documento, use estrutura fixa:

```
Você é um orientador acadêmico experiente. Analise o documento a seguir e produza:

1. Resumo executivo (máximo 150 palavras)
2. Pontos fortes
3. Lacunas, riscos ou inconsistências acadêmicas
4. Orientações concretas e priorizadas para as próximas 2–3 etapas do aluno

Seja direto, técnico e acionável. Não invente conteúdo que não está no documento.
```

O resultado deve ser salvo **apenas** na tabela `ParecerLLM` e nunca exposto ao endpoint do aluno.

## Stack Preferida (v1)

- Frontend: Next.js 15 (App Router) + Tailwind + shadcn/ui
- Backend: Next.js API Routes ou NestJS
- DB: PostgreSQL (Neon/Supabase)
- Auth: NextAuth.js (Google Provider + Magic Link)
- Filas: BullMQ + Redis ou Inngest
- LLM: Gemini (preferencial) ou Claude
- E-mail: Resend ou Gmail API
- Deploy: Vercel + Neon

## Comportamento do Agente ao Usar Esta Skill

1. **Sempre** leia o PRD (`PRD-SOAI-Sistema-Orientacao-Academica.md`) antes de implementar features novas.
2. Ao criar endpoints, aplique o middleware de ownership.
3. Ao criar o formulário de ata, replique fielmente as 7 seções do template.
4. Nunca exponha parecer LLM para o papel ORIENTANDO.
5. Prefira Server Actions + React Server Components quando possível.
6. Escreva testes de isolamento multi-aluno (CT-02 e CT-07 do PRD).
7. Ao integrar Google, use tokens criptografados e escopos mínimos.

## Exemplos de Gatilhos

- "Implemente o módulo de ata de orientação"
- "Crie a integração com Google Calendar"
- "Faça o upload de documento gerar parecer LLM"
- "Adicione o CRUD de marcos acadêmicos"
- "Garanta o isolamento entre alunos"
- "Gere o painel do orientador com status Verde/Amarelo/Vermelho"
- "Crie a skill de autorização de aluno"

## O que NÃO fazer

- Não criar multi-tenancy institucional nesta versão.
- Não permitir que aluno veja parecer LLM.
- Não hardcodar dados de alunos reais.
- Não omitir logs de auditoria em ações sensíveis.
- Não usar escopos Google excessivos.

---

**Versão da skill:** 1.0  
**Compatível com:** Google Antigravity 2.0+, Claude Code, Cursor  
**Projeto:** SOAI — Sistema Pessoal de Orientação Acadêmica
