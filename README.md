# SOIA — Sistema de Orientação Acadêmica Inteligente

Plataforma para o orientador acompanhar orientandos (IC, TCC, mestrado, doutorado e pós-doc) num só lugar: projeto, prazos, redação, atas, documentos e apoio de IA.

O nome no código ainda aparece como SOAI em alguns pontos; o produto em uso é **SOIA**.

---

## O que o sistema faz

### Autenticação e usuários
- Login por e-mail e senha (bcrypt)
- Confirmação de e-mail e ativação pelo orientador/admin
- Recuperação de senha por link temporário

### Onboarding e ficha do projeto
- Ficha inicial com os campos técnicos do plano (tema, problema, objetivos, ética etc.)
- Preenchimento assistido por IA a partir de um texto livre do aluno
- Ao concluir o onboarding, a trilha do modelo acadêmico é copiada para o projeto

### Trilha metodológica
Modelos disponíveis: projeto de pesquisa, monografia, artigo empírico e produto técnico.  
Cada etapa tem gate: o professor só libera a próxima quando as seções obrigatórias estão em ordem.

### Redação e revisão
- Submissão de capítulo com o protocolo em 4 blocos (o que produzi / o que mudou / dúvidas / próximos passos)
- Ajustes corretivos pontuais feitos pelo orientador
- Dossiê com trechos aprovados; seções obrigatórias em aberto bloqueiam a defesa

### Documentos
- Upload de manuscritos e anexos pelo aluno, com vínculo a uma seção/capítulo
- O orientador vê, baixa e recebe notificação do envio
- Parecer de IA do documento fica com o professor até liberação explícita

### Agenda e atas
- Janelas de disponibilidade do orientador
- Agendamento com Meet (link configurável)
- Atas estruturadas (síntese, decisões, riscos, plano de trabalho)

### IA
- Comparação entre versões de texto
- Score de autoria (humano vs. IA)
- Notificações no portal (e e-mail, quando SMTP estiver configurado)

---

## Isolamento de dados

Cada aluno só acessa o próprio projeto. Tentativas de acesso cruzado são bloqueadas e registradas em auditoria.

---

## Stack

- Next.js 16 (App Router)
- PostgreSQL + Prisma
- CSS próprio (tema escuro / glass)
- OpenRouter (Gemini) para LLM
- Nodemailer / Resend para e-mail

---

## Ambiente local

```bash
npm install
```

Variáveis mínimas no `.env` (exemplo):

```env
DATABASE_URL="postgresql://soai_user:SENHA@localhost:5432/soai_prod?schema=public"
NEXTAUTH_SECRET="um-segredo-longo"
NEXTAUTH_URL="http://localhost:3000"
ORIENTADOR_EMAIL="janioguga@gmail.com"
```

Para desenvolvimento local, `NEXTAUTH_URL` precisa ser `http://localhost:3000`. Em produção use o domínio real (ex.: `https://soiaia.duckdns.org`).

```bash
npm run db:ready   # prisma db push + generate + seed de teste
npm run dev
```

Credenciais do seed local e o fluxo de teste estão em [docs/TESTE_LOCAL.md](docs/TESTE_LOCAL.md).

| Papel | E-mail | Senha |
|---|---|---|
| Admin / Professor | `janioguga@gmail.com` | `senha123` |
| Aluno (teste) | `matheus@soia.local` | `senha123` |

Só o seed: `npm run seed:local` (idempotente; **não** rode em produção).

---

## Produção e rollback

Procedimento de deploy, checklist de integridade e ponto de rollback: [docs/DEPLOY_PRODUCAO.md](docs/DEPLOY_PRODUCAO.md).

Resumo:
1. Tag de rollback no `main` atual antes do push
2. Push para `origin/main`
3. Na VPS: `git pull`, `prisma db push` (colunas novas, sem apagar dados), `build`, reinício PM2
4. Conferir login de professor e lista de documentos do aluno
