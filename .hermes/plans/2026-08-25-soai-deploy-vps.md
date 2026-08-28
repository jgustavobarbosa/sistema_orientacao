# SOAI — Deploy para VPS (143.95.219.149)

> **Executor:** Hermes Agent (Ray) — subagent-driven execution  
> **VPS:** root@143.95.219.149:22022 (Ubuntu 22.04, 98G SSD)  
> **Projeto:** Next.js 16 + PostgreSQL + Prisma

**Goal:** Colocar o SOAI (Sistema de Orientação Acadêmica Inteligente) em produção na VPS 143.95.219.149, rodando com PM2 + Nginx reverse proxy + SSL.

**Arquitetura:** Nginx (porta 80/443) → proxy_pass → Next.js (porta 3000) via PM2. PostgreSQL local na VPS. Prisma ORM. OpenRouter para LLM.

**Tech Stack:** Next.js 16, React 19, PostgreSQL 16, Prisma 7, PM2, Nginx, Let's Encrypt

---

## Global Constraints

- Node.js 20 LTS via NodeSource (não usar nvm — ambiente VPS limpo)
- PostgreSQL 16 local
- App roda na porta 3000, Nginx faz proxy reverso
- PM2 mantém app online (startup + save)
- .env extraído do .env local (valores de produção)
- Nenhuma modificação no código-fonte — apenas deploy e config

---

## Fase 0: VPS Infrastructure Setup

**Subagent:** VPS-Infra

- [ ] **0.1** SSH na VPS e atualizar pacotes: `apt update && apt upgrade -y`
- [ ] **0.2** Instalar Node.js 20 LTS (NodeSource): `curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs`
- [ ] **0.3** Verificar versão: `node --version && npm --version`
- [ ] **0.4** Instalar Nginx: `apt install -y nginx`
- [ ] **0.5** Instalar PostgreSQL 16: 
  ```bash
  sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
  apt update && apt install -y postgresql-16
  ```
- [ ] **0.6** Criar database e usuário PostgreSQL:
  ```bash
  sudo -i -u postgres psql -c "CREATE DATABASE soai_prod;"
  sudo -i -u postgres psql -c "CREATE USER soai_user WITH PASSWORD '$(openssl rand -base64 32)';"
  sudo -i -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE soai_prod TO soai_user;"
  ```
- [ ] **0.7** Instalar PM2 global: `npm install -g pm2`
- [ ] **0.8** Instalar certbot: `apt install -y certbot python3-certbot-nginx`
- [ ] **0.9** Verificar todas as instalações

## Fase 1: Transferir Projeto

**Subagent:** VPS-Transfer

- [ ] **1.1** Criar diretório no VPS: `mkdir -p /opt/soai && mkdir -p /var/log/soai`
- [ ] **1.2** Criar .gitignore temporário para SCP (excluir node_modules, .next, .git, .DS_Store, vídeos, arquivos desnecessários)
- [ ] **1.3** SCP dos arquivos do projeto (excluindo node_modules, .next, .git, .DS_Store, arquivos .mp4 grandes)
- [ ] **1.4** SCP do arquivo .env (com valores de produção)
- [ ] **1.5** Verificar estrutura no VPS: `ls -la /opt/soai/`

## Fase 2: Configurar Banco e Build

**Subagent:** VPS-Build

- [ ] **2.1** No VPS, cd /opt/soai && npm install
- [ ] **2.2** npx prisma generate
- [ ] **2.3** npx prisma migrate deploy
- [ ] **2.4** npm run build
- [ ] **2.5** Verificar se build foi bem-sucedido (exit code 0, sem erros)

## Fase 3: PM2 + Nginx

**Subagent:** VPS-Deploy

- [ ] **3.1** PM2 start: `pm2 start npm --name "soai-app" -- start -- -p 3000`
- [ ] **3.2** PM2 startup: `pm2 startup && pm2 save`
- [ ] **3.3** Configurar Nginx (sites-available/soai):
  ```nginx
  server {
      listen 80;
      server_name SOAI_DOMAIN_PLACEHOLDER;

      access_log /var/log/soai/access.log;
      error_log /var/log/soai/error.log;

      location / {
          proxy_pass http://127.0.0.1:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- [ ] **3.4** Ativar site: `ln -sf /etc/nginx/sites-available/soai /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx`
- [ ] **3.5** Testar se app responde: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`

## Fase 4: ECC Hermes

**Subagent:** VPS-ECC

- [ ] **4.1** No VPS, cd /opt/soai && bash <(curl -s https://raw.githubusercontent.com/nousresearch/hermes/main/install.sh) --target hermes --profile minimal
  ou verificar se ecc já está disponível no hermes-agent
- [ ] **4.2** npx ecc doctor --target hermes
- [ ] **4.3** Verificar resultado

## Fase 5: SSL & Finalização

**Subagent:** VPS-SSL

- [ ] **5.1** Quando o domínio for apontado, executar: `certbot --nginx -d soai.seudominio.com.br`
- [ ] **5.2** Verificar renovação automática: `certbot renew --dry-run`

## Fase 6: Verificação Final

**Subagent:** VPS-Verify

- [ ] **6.1** pm2 status (verificar se soai-app está online)
- [ ] **6.2** curl http://localhost:3000 (verificar se retorna HTML)
- [ ] **6.3** Verificar logs: `pm2 logs soai-app --lines 20 --nostream`
- [ ] **6.4** nginx -t (configuração válida)
- [ ] **6.5** Consolidar memória com informações do deploy