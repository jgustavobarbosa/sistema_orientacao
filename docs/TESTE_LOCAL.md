# Teste local do SOIA

Guia permanente para validar correções em `http://localhost:3000` sem depender dos dados de produção.

## Credenciais (seed)

| Papel | E-mail | Senha |
|---|---|---|
| Admin / Professor | `janioguga@gmail.com` | `senha123` |
| Aluno (Matheus) | `matheus@soia.local` | `senha123` |

Senha alternativa via env: `SOIA_LOCAL_PASSWORD=... npm run seed:local`

## Setup rápido (sempre que o banco local estiver vazio ou desatualizado)

```bash
# 1) Garantir Postgres local com DATABASE_URL do .env
# 2) Sincronizar schema
npx prisma db push
npx prisma generate

# 3) Popular usuários + projeto + marcos + trilha MONO
npm run seed:local

# 4) Para login local funcionar, no .env:
#    NEXTAUTH_URL="http://localhost:3000"

# 5) Subir app
npm run dev
```

Abra: [http://localhost:3000](http://localhost:3000)

## O que o seed cria

- Usuário **ADMIN** (Gustavo) — vê menu orientador + admin
- Usuário **ORIENTANDO** (Matheus)
- Projeto PGI-CCR vinculado entre os dois
- 5 marcos acadêmicos
- Trilha MONO (5 capítulos) com 1ª etapa liberada

O script é **idempotente**: pode rodar `npm run seed:local` quantas vezes quiser.

## Fluxos úteis para testar bugs de documentos

1. Login como `matheus@soia.local`
2. Ir em **Meus Documentos** → upload com seção vinculada
3. Logout → login como `janioguga@gmail.com`
4. **Meus Alunos** → Matheus → ver **Documentos Enviados**, notificação e timeline
5. **Revisar Capítulos** → arquivo vinculado na seção

## Produção vs local

- Produção: `https://soiaia.duckdns.org` (dados reais do Matheus)
- Local: banco `soai_prod` em `localhost` (seed de teste)
- **Não** misture `NEXTAUTH_URL` de produção com `npm run dev` local
