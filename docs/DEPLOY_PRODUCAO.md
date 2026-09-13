# Deploy em produção (SOIA)

VPS: `143.95.219.149` (SSH porta `22022`)  
App: `/opt/soai` · PM2: `soai-app` · URL: `https://soiaia.duckdns.org`

## Integridade (o que este release faz e não faz)

Faz:
- Colunas opcionais em `Documento` (`secaoId`, `storagePath`, `nomeArquivoOriginal`, `mimeType`)
- Código de upload com persistência em disco, notificação e vínculo a seção
- Correção de roteamento ADMIN → painel do orientador

Não faz:
- Não apaga linhas de `Documento`, `SecaoTexto`, usuários ou projetos
- Não roda `seed:local` em produção
- Não força rewrite de binários antigos (uploads anteriores sem `storagePath` continuam como metadado)

## Rollback

Antes de publicar este release, crie (ou use) a tag:

```text
rollback-pre-docs-visibility-2026-09-13
```

Aponta para o commit de produção estável anterior (`fecae1f` ou o SHA anotado no momento do tag).

### Reverter código na VPS

```bash
ssh -p 22022 root@143.95.219.149
cd /opt/soai
git fetch --tags origin
git checkout rollback-pre-docs-visibility-2026-09-13
npm ci
npx prisma generate
# NÃO rode migrate/db push destrutivo no rollback de código se o schema novo
# já estiver aplicado: as colunas novas são nullable e o código antigo as ignora.
npm run build
pm2 restart soai-app
pm2 logs soai-app --lines 40 --nostream
```

As colunas novas podem permanecer no banco sem prejuízo (nullable). Removê-las só se for estritamente necessário e com backup prévio.

## Deploy deste release

No laptop (repositório):

```bash
git push origin main
git push origin rollback-pre-docs-visibility-2026-09-13
```

Na VPS:

```bash
cd /opt/soai
git status
git rev-parse HEAD          # anote o SHA atual
cp -a uploads uploads.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || mkdir -p uploads/documentos

git fetch origin
git checkout main
git pull --ff-only origin main

npm ci
npx prisma generate
npx prisma db push          # apenas adiciona colunas; confirme o prompt se aparecer
mkdir -p uploads/documentos
chmod -R u+rwX uploads

npm run build
pm2 restart soai-app
pm2 status
curl -sI https://soiaia.duckdns.org | head -5
```

## Checagem pós-deploy

1. Login como professor/admin: deve ir para `/orientador`, não para proposta de aluno
2. Abrir o aluno Matheus: bloco **Documentos Enviados** visível
3. Login como aluno: upload com seção vinculada gera notificação ao orientador
4. Download autenticado em `/api/documentos/[id]/download` para arquivos novos

## Resumo das correções deste release

1. Admin/professor não cai mais no formulário “Cadastrar Proposta”
2. Documentos do aluno passam a aparecer no painel do orientador
3. Upload notifica o orientador
4. Documento pode (e deve) vincular a um capítulo/seção
5. Arquivos novos são gravados em `uploads/documentos/`
6. Timeline de marcos do aluno aparece na página do orientador
7. Status “Revisão Pendente” só quando há texto; seções vazias ficam “Ausente/Pendente”
8. Seed local documentado para testes (`npm run seed:local`) — só desenvolvimento
