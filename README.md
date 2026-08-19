# SOIA — Sistema de Orientação Acadêmica Inteligente

O **SOAI** é uma plataforma acadêmica colaborativa desenvolvida para orientadores gerenciarem seus orientandos (Iniciação Científica, TCC, Mestrado, Doutorado e Pós-Doc) de forma unificada, com auxílio de Inteligência Artificial para triagem, comparação de redações, auditoria de escrita por IA e acompanhamento em trilhas metodológicas baseadas em catálogo de modelos acadêmicos.

---

## 🚀 Principais Funcionalidades

### 1. Autenticação Própria e Gestão de Usuários
- **Fluxo Email/Senha**: Cadastro local e login protegidos com senhas seguras codificadas por criptografia (bcrypt).
- **Ativação e Confirmação**: Envio de links de ativação por SMTP Gmail real e fluxo de aprovação de novos cadastros de estudantes.
- **Bypass de Administrador**: Orientadores principais possuem bypass automático na aprovação de cadastro de usuário.
- **Redefinição de Senha**: Fluxo de recuperação contendo tokens temporários e envio automatizado.

### 2. Onboarding Científico & Ficha Técnica (`E0_ACOLHIMENTO`)
- **Ficha Inicial com 18 Campos**: Estruturação técnica do projeto abordando tema, delimitação, hipóteses, objetivos, limites práticos e ética.
- **Extração com Inteligência Artificial**: O estudante digita um diagnóstico livre e a IA (Gemini via OpenRouter) preenche automaticamente a ficha técnica para aprovação e validação rápida.
- **Snapshoting do Modelo**: No onboarding, o sistema clona a trilha metodológica de etapas e seções do catálogo para o escopo do aluno de forma imutável.

### 3. Trilha Metodológica & Catálogo de Modelos Acadêmicos
- **Catálogo de Produtos**: O sistema oferece templates padrão para 4 modalidades:
  - *Projeto de Pesquisa Científica* (`PROJ_PESQ`)
  - *Monografia Acadêmica Tradicional* (`MONO`)
  - *Artigo Científico Empírico* (`ART_EMP`)
  - *Produto Técnico ou Tecnológico* (`PROD_TEC`)
- **Gates Científicos de Etapa**: O professor decide e registra a aprovação formal do avanço de etapa, bloqueado caso haja seções obrigatórias incompletas.

### 4. Controle de Redação Científica & Versionamento
- **Protocolo de Submissão em 4 Blocos**: Cada envio de capítulo exige obrigatoriamente justificar o que foi produzido, o que mudou, gargalos e próximos passos.
- **Ajustes Corretivos Granulares**: O professor pode criar checklists acionáveis vinculados ao capítulo, exibidos como pendências interativas para o estudante marcar como resolvido.
- **Dossiê Acadêmico Consolidado**: Manifesto estruturado contendo as versões aprovadas e trava ativa contra lacunas obrigatórias para a defesa.

### 5. Agenda Inteligente & Automação de Rotinas
- **Slots Semanais**: Definição de janelas livres na agenda do professor orientador.
- **Google Meet Fixo**: Encontros marcados de forma integrada com link fixo (`https://meet.google.com/fxv-mbbh-rqj`).
- **Automação de Encontros**: Agendamentos quinzenais ou mensais programados em lote.
- **Atas Canônicas**: Geração de atas estruturadas contendo sínteses, riscos, mitigação e planos de ação.

### 6. Assistência de Inteligência Artificial & Auditoria de Autoria
- **IA Comparadora de Versões**: Laudo de comparação entre versões novas e anteriores com checagem de atendimento das correções do orientador.
- **Auditoria de Escrita por IA**: Avaliação estatística de similaridade textual com geradores artificiais (retorna score de 0 a 100).
- **Notificações em Tempo Real**: Alertas dinâmicos no sino do cabeçalho e e-mails transacionais automáticos.

---

## 🔒 Hardening & Segurança (Isolamento de Dados)
O sistema aplica a regra de ownership estrito na camada de banco de dados e rotas. Um orientando **nunca** possui permissão de leitura sobre atas, reuniões, documentos, notas ou laudos de IA pertencentes a outros projetos de orientação do professor. Qualquer tentativa ilegal é interceptada e gravada em logs de auditoria.

---

## 🛠️ Stack Tecnológica
- **Framework**: Next.js 16 (App Router com Turbopack)
- **Banco de Dados**: PostgreSQL (Prisma ORM)
- **Estilização**: CSS Vanilla (Aesthetics Premium Glassmorphism)
- **Provedor LLM**: OpenRouter (Gemini 2.5 Flash)
- **E-mails Transacionais**: Nodemailer com SMTP Gmail Real

---

## 🚀 Como Executar Localmente

1. **Instalar Dependências**:
   ```bash
   npm install
   ```
2. **Configurar Variáveis de Ambiente (`.env`)**:
   Crie um arquivo `.env` na raiz do projeto com:
   ```env
   DATABASE_URL="sua-string-conexao-postgres"
   OPENROUTER_API_KEY="sua-chave-openrouter"
   NEXTAUTH_SECRET="seu-segredo-de-sessao"
   NEXTAUTH_URL="http://localhost:3000"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="janioguga@gmail.com"
   SMTP_PASS="sua-senha-de-aplicativo"
   ORIENTADOR_EMAIL="janioguga@gmail.com"
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
