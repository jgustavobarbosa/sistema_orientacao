# SOAI — Sistema de Orientação Acadêmica Inteligente

O **SOAI** é uma plataforma acadêmica colaborativa desenvolvida pessoalmente para orientadores gerenciarem seus orientandos (Iniciação Científica, TCC, Mestrado, Doutorado e Pós-Doc) de forma unificada, com auxílio de Inteligência Artificial para triagem, comparação de redações e auditoria de escrita por IA.

---

## 🚀 Principais Funcionalidades

### 1. Painel Administrativo & Gestão de Orientados
- Controle de cadastro e status de autorização de alunos (Ativo/Suspenso).
- Linha do tempo acadêmica individual com marcos do projeto (Introdução, Qualificação, Defesa, etc.).
- Relógio Regressivo dinâmico exibindo a contagem precisa de dias/horas até o prazo final de defesa.

### 2. Agenda Inteligente & Automação de Rotinas
- **Slots Semanais**: O professor define suas janelas de tempo disponíveis.
- **Agendamento pelo Aluno**: O orientando solicita encontros com base nas janelas, informando o objetivo do encontro.
- **Agendamento Livre**: O orientador pode agendar livremente qualquer dia e horário para o aluno diretamente.
- **Automação Quinzenal/Mensal**: O professor agenda rotinas periódicas e o sistema cria automaticamente as reuniões para os próximos 30 dias de todos os orientandos.
- **Meet Fixo & E-mails**: Geração automática de Meet por aluno e notificações bilaterais automáticas de agendamento/reagendamento.
- **Prevenção de Choques**: Validação algorítmica rigorosa impedindo reuniões em horários sobrepostos.

### 3. Registro de Atas Padrão SOAI
Ata estruturada contendo as 7 seções canônicas de documentação científica:
1. Cabeçalho (Encontro, Cronograma, Pergunta).
2. Síntese de Avanço (Tabela de entregas).
3. Decisões Tomadas (Justificativas e impacto).
4. Questões Críticas e Riscos (Ações de mitigação).
5. Plano de Trabalho até o próximo encontro.
6. Perguntas Orientadoras da próxima entrega.
7. Detalhes do Próximo Encontro.

### 4. Controle de Redação Científica & Versionamento
- **Bilateralidade**: O aluno submete os capítulos da tese; o professor insere observações corretivas ou aprova.
- **Dossiê Consolidado**: Concatenação automática de todos os trechos marcados como aprovados.
- **Histórico de Versões**: Cada submissão é arquivada, permitindo acompanhar o progresso temporal do texto.
- **Réplicas do Professor**: O orientador pode colar e enviar rascunhos corrigidos diretamente no histórico de versões para o aluno baixar e refinar.

### 5. Assistência por Inteligência Artificial (Gemini/OpenRouter)
- **Extração de Capítulos**: IA analisa arquivos enviados pelo aluno em "Meus Documentos" e pré-preenche as seções de redação correspondentes.
- **Triagem Diagnóstica**: Avaliação automática de manuscritos com resumo, pontos fortes, lacunas e recomendações de correção.
- **Compartilhamento Controlado**: Parecer da IA originalmente oculto do aluno até ser liberado manualmente pelo orientador.
- **IA Comparadora de Versões**: Ao receber uma v2, a IA compara o texto com a v1 e com as anotações do orientador, gerando um laudo de atendimento de revisões.
- **Humanização**: Pareceres pragmáticos sem jargões ou formatações de IA.

### 6. Sistema de Auditoria de Autoria (Humano vs. IA)
- O professor pode submeter qualquer seção escrita do aluno para auditoria de autoria.
- A IA analisa repetições sintáticas, vocabulário e conectores típicos de modelos de linguagem.
- Retorna pontuação (0 a 100), classificação de autoria e justificativa detalhada das evidências.

### 7. Central de Notificações
- Sino de Notificações dinâmico no cabeçalho do portal mantendo alunos e professores alertados sobre novidades de agendamentos, envios de textos e avaliações.

---

## 🔒 Hardening & Segurança (Isolamento de Dados)
O sistema aplica a regra de ownership estrito na camada de banco de dados e rotas. Um orientando **nunca** possui permissão de leitura sobre atas, reuniões, documentos ou laudos de IA pertencentes a outros projetos de orientação do professor. Qualquer tentativa ilegal é interceptada e gravada em `AuditoriaLog`.

---

## 🛠️ Stack Tecnológica
- **Framework**: Next.js 16 (App Router com Turbopack)
- **Banco de Dados**: PostgreSQL (Prisma ORM)
- **Estilização**: TailwindCSS
- **Provedor LLM**: OpenRouter (Gemini 2.5 Flash)
- **E-mails**: Resend API

---

## 🚀 Como Executar Localmente

1. **Instalar Dependências**:
   ```bash
   npm install
   ```
2. **Configurar Variáveis de Ambiente (`.env`)**:
   ```env
   DATABASE_URL="sua-string-conexao-postgres"
   OPENROUTER_API_KEY="sua-chave-openrouter"
   OPENROUTER_MODEL="google/gemini-2.5-flash:free"
   RESEND_API_KEY="sua-chave-resend"
   NEXTAUTH_SECRET="seu-segredo"
   ```
3. **Sincronizar Banco**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
4. **Executar Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```
