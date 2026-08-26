# Plano de Correções — SOAI

## Problema 1: Auditoria de IA retorna 50/100 "sem chave de API"
**Causa raiz:** O modelo `google/gemini-2.5-flash:free` foi descontinuado pela OpenRouter. A API retorna 404, cai no catch, retorna fallback 50/100.

**Solução:** 
1. Atualizar `.env` na VPS: `google/gemini-2.5-flash` (sem `:free`)
2. Atualizar `gemini.ts` pra usar o modelo sem `:free` como default
3. Melhorar mensagens de erro da auditoria (fallback diferenciado: "modelo indisponível" vs "sem chave")

## Problema 2: Orientador não vê conteúdo dos capítulos
**Causa:** Na página de revisão do orientador, o conteúdo do aluno é exibido num bloco com `max-h-[250px] overflow-y-auto`. Pode não estar claro se:
- O aluno escreveu texto (longo, precisa scroll)
- O aluno escreveu pouco texto
- O aluno anexou arquivo em vez de texto

**Solução:**
1. Adicionar indicador de tamanho do conteúdo (curto/médio/longo)
2. Indicador visual de "com texto" vs "sem texto substancial"
3. Destacar `linkAnexo` mais visivelmente
4. Adicionar resumo no topo: "Texto: X caracteres | Anexo: sim/não"

## Tarefas

### Task 1: Corrigir modelo OpenRouter + auditoria
- [ ] Atualizar `.env` VPS
- [ ] Atualizar `gemini.ts` default model
- [ ] Melhorar fallback da auditoria

### Task 2: Melhorar visibilidade dos capítulos
- [ ] Adicionar indicadores na página do orientador
- [ ] Mostrar status do conteúdo (com texto, vazio, só anexo)