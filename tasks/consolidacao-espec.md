# Spec: Consolidador de Texto Acadêmico (Download/Upload)

## Objective
Permitir que o aluno, a partir dos capítulos que escreveu diretamente na plataforma (seções aprovadas ou em andamento), consolide todo o texto em um **único arquivo para download**, possa editar localmente (fora da plataforma) e depois **reenviar o arquivo editado** de volta, substituindo ou versionando os textos originais.

## User Story
> Como aluno do SOIA, quero baixar o texto que escrevi no sistema em formato .docx ou .pdf para editar no Word/LibreOffice, e depois reenviar o arquivo corrigido para a plataforma — de modo que meu orientador veja as alterações feitas diretamente no documento.

## Capability Map

| Módulo | Responsabilidade | Depende de |
|---|---|---|
| `template` | Escolher/gerenciar template de formatação do documento consolidado | — |
| `consolidacao` | Juntar capítulos, ordenar, aplicar template, gerar .docx | template |
| `download` | Servir o arquivo consolidado pro usuário baixar | consolidacao |
| `upload` | Receber arquivo editado, extrair texto, criar nova versão | — |
| `versao` | Gerenciar versões do arquivo consolidado (histórico de downloads/uploads) | consolidacao, upload |

Build order: `template → consolidacao → download, upload → versao`

## Funcionalidades por Módulo

### M1 Template
- O sistema tem um template .docx padrão (capa, margens ABNT, fontes, numeração)
- O orientador pode definir qual template usar por projeto
- Na ausência de template, o sistema cria um documento simples (Times 12, margens 3cm)

### M2 Consolidação
- Reúne todas as seções do projeto em ordem (por campo `ordem` no schema)
- Inclui apenas seções com conteúdo não vazio
- Aplica formatação do template:
  - Capa com título, autor, orientador, instituição
  - Sumário automático (se template suportar)
  - Cada seção como um heading numerado
  - Notas de rodapé para correções (opcional)
- Gera .docx (primário) e .pdf (opcional por demanda)

### M3 Download
- Botão "Baixar Documento Consolidado" no dashboard do aluno
- Geração pode ser:
  - **Automática:** sempre que um capítulo é aprovado, o arquivo é re-gerado em background
  - **Por demanda:** usuário clica "Baixar" e espera (ou recebe notificação quando pronto)
- Progresso visível durante geração (se for síncrona)

### M4 Upload
- Aluno faz upload de .docx (ou .pdf) editado
- Sistema extrai o texto do arquivo enviado
- Substitui/atualiza o conteúdo das seções correspondentes OU cria uma nova versão do consolidado
- Dispara notificação pro orientador: "Aluno reenviou o documento consolidado com alterações"

### M5 Versão
- Cada download gera uma versão registrada no histórico
- Cada upload gera uma nova versão
- Orientador pode comparar versões (diff textual)
- Mantém as últimas N versões (configurável)

## Tech Stack
- **DOCX:** `docx` (npm) — biblioteca nativa de geração de .docx sem precisar de LibreOffice
- **PDF:** conversão via docx → puppeteer/playwright ou markdown → weasyprint (avaliar)
- **Extrair texto:** `mammoth` (docx → html/text) ou `pdf-parse`
- **Armazenamento:** sistema de arquivos no servidor (pasta `/opt/soai/uploads/`)
- **Download:** Next.js API route com streaming do arquivo

## Commands
```bash
npm install docx mammoth pdf-parse
npm run build
```

## Project Structure
```
src/
  lib/
    template.ts         # Gerenciamento de templates
    consolidacao.ts     # Lógica de consolidação
    exportar-docx.ts    # Geração do arquivo .docx
    importar-docx.ts    # Extração de texto de .docx enviado
  app/api/aluno/
    consolidado/
      route.ts          # GET: download, POST: upload
prisma/
  schema.prisma         # + model VersaoConsolidado
```

## Testing Strategy
- Unit tests para `exportar-docx.ts` e `importar-docx.ts`
- Teste manual: baixar, editar no Word, reenviar, verificar se texto foi atualizado
- Verificar formatação do .docx (capa, fontes, margens)

## Boundaries
- **Always:** validar .docx enviado, sanitizar texto extraído, versionar
- **Ask first:** adicionar suporte a .pdf, templates customizados pelo orientador
- **Never:** executar macros ou scripts dentro do .docx enviado

## Success Criteria
- [ ] Aluno pode baixar .docx com todos os capítulos aprovados
- [ ] Documento baixado tem capa, sumário, seções numeradas
- [ ] Aluno pode editar localmente e reenviar o .docx
- [ ] Sistema extrai o texto e atualiza as seções
- [ ] Histórico de versões mantém os últimos 5 downloads/uploads
- [ ] Orientador é notificado quando aluno reenvia

## Ondas de Desenvolvimento

### Onda 1: Geração de .docx básica (M1 + M2 + M3)
- Instalar `docx`
- Criar `exportar-docx.ts`: função que recebe capítulos e gera Buffer .docx
- Template simples: Times New Roman 12, margens ABNT (3cm), capa com título/autor
- API route `GET /api/aluno/consolidado` que gera e serve o arquivo
- Botão "Baixar" no dashboard do aluno

### Onda 2: Upload e reimportação (M4)
- API route `POST /api/aluno/consolidado` que recebe .docx
- Instalar `mammoth` para extrair texto
- Atualizar seções com base no texto extraído
- Notificação pro orientador

### Onda 3: Versionamento e diff (M5)
- Model `VersaoConsolidado` no schema
- Histórico de versões visível no dashboard
- Comparação entre versões (diff textual)

### Onda 4: Polimento
- Template customizável por projeto/orientador
- Suporte a .pdf
- Geração automática em background quando capítulo é aprovado