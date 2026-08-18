# SOAI — Sistema de Orientação Acadêmica Inteligente

Sistema **pessoal** para gestão dos seus orientandos (IC, TCC, Mestrado, Doutorado, Pós-Doc).

## Conteúdo desta pasta

| Arquivo | Descrição |
|---------|-----------|
| `PRD-SOAI-Sistema-Orientacao-Academica.md` | Documento completo de requisitos, casos de uso (com diagramas Mermaid), modelo de dados e arquitetura técnica |
| `academic-orientation-system/SKILL.md` | Skill customizada para o Antigravity (e outras ferramentas agentic) |

## Como usar no Google Antigravity

### 1. Instalar a skill customizada

**Opção A — Workspace (recomendado para este projeto):**
```bash
mkdir -p .agent/skills
cp -r academic-orientation-system .agent/skills/
```

**Opção B — Global (disponível em todos os projetos):**
```bash
mkdir -p ~/.gemini/antigravity/skills
cp -r academic-orientation-system ~/.gemini/antigravity/skills/
```

### 2. Ativar skills de código recomendadas

```bash
npx antigravity-awesome-skills --antigravity
```

Skills especialmente úteis:
- `fullstack-architect`
- `backend-engineer`
- `frontend-specialist`
- `api-designer`
- `database-expert`
- `security-engineer`
- `test-engineer`

### 3. Começar o desenvolvimento

No Agent Manager do Antigravity, abra o arquivo `PRD-SOAI-Sistema-Orientacao-Academica.md` e peça:

```
Atue como Senior Full-Stack Engineer.
Leia o PRD completo e a skill academic-orientation-system.
Gere o plano de implementação detalhado (sprints, estrutura de pastas, 
modelo de dados SQL, endpoints e ordem de desenvolvimento).
Não escreva código ainda.
```

Depois:

```
Implemente o Sprint 1: autenticação (Google + Magic Link), 
CRUD de usuários e autorização do orientador, 
seguindo rigorosamente a skill academic-orientation-system.
```

## Escopo da v1

- Uso pessoal (você + seus orientandos)
- Isolamento total entre alunos
- Parecer LLM visível **somente** ao orientador
- Integração Google Calendar + Drive + Docs + Sheets
- Registro de ata baseado no template oficial
- Notificações por e-mail

## Próximos passos sugeridos

1. Coloque esta pasta como workspace no Antigravity
2. Instale a skill customizada
3. Peça o plano de implementação
4. Implemente Sprint 1 → 2 → 3 → 4 conforme o PRD

---

**Versão:** 1.0 — 17/08/2026
