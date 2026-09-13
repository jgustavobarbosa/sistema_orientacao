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

Pontos de restauração deste release:

| Tipo | Identificador |
|---|---|
| Git (código) | tag `rollback-pre-docs-visibility-2026-09-13` (= commit `fecae1f`) |
| VPS (snapshot) | `/root/backups/soai/soai-pre-docs-20260913085619.tar.gz` |
| VPS (.env) | `/root/backups/soai/env-20260913085619.bak` |

### Reverter código na VPS (rápido)

Como a VPS não usa git checkout (deploy por rsync), restaure o tarball:

```bash
ssh -p 22022 root@143.95.219.149
cd /opt
pm2 stop soai-app
# preserve env atual se quiser
cp soai/.env /root/backups/soai/env-before-rollback.bak
rm -rf soai.broken && mv soai soai.broken
mkdir soai && tar -xzf /root/backups/soai/soai-pre-docs-20260913085619.tar.gz -C /opt
# soai/ sai do tar; ajustar se o tar contiver o diretório soai/
cd /opt/soai
cp /root/backups/soai/env-20260913085619.bak .env
npm ci
npx prisma generate
npm run build
pm2 restart soai-app
```

As colunas novas no Postgres (`secaoId`, `storagePath`, etc.) são nullable e o código antigo as ignora — não é obrigatório removê-las no rollback.

## Deploy deste release

No laptop (repositório):

```bash
git push origin main
git push origin rollback-pre-docs-visibility-2026-09-13
```

Backup na VPS (já feito neste release):

```text
/root/backups/soai/soai-pre-docs-20260913085619.tar.gz
```

Sincronizar código (sem `--delete`, preserva `.env` e `uploads`):

```bash
rsync -az \
  --exclude node_modules --exclude .next --exclude .env --exclude uploads \
  --exclude '*.mp4' --exclude .git \
  -e 'ssh -p 22022' \
  ./ root@143.95.219.149:/opt/soai/
```

Na VPS:

```bash
cd /opt/soai
npm ci
npx prisma generate
npx prisma db push          # só adiciona colunas nullable
mkdir -p uploads/documentos
npm run build
pm2 restart soai-app
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

**Não** rode `npm run seed:local` na VPS.
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
