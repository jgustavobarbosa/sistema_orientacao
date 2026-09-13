<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Teste local (permanente)

- Doc: `docs/TESTE_LOCAL.md`
- Seed: `npm run seed:local` (ou `npm run db:ready`)
- Credenciais após seed:
  - Admin/Professor: `janioguga@gmail.com` / `senha123`
  - Aluno: `matheus@soia.local` / `senha123`
- Login local exige `NEXTAUTH_URL=http://localhost:3000`
