# Plano: Google Meet + Drive Integration

## Problema
- Reuniões usam link fixo do Meet, não geram links dinâmicos
- Pastas do Drive são criadas mas não compartilhadas com o orientador
- Service Account existe mas não gera Meet via `conferenceData`

## O que muda

### 1. Google Meet na criação de reunião
- `criarEventoCalendar()` → adicionar `conferenceDataVersion: 1` + `conferenceData.createRequest`
- Retornar o `hangoutLink` (URL do Meet) junto com o `eventId`
- Armazenar no campo `linkVideoconferencia` da Reuniao

### 2. Compartilhamento de pastas do Drive
- `criarEstruturaPastasDrive()` → aceitar `emailOrientador`, compartilhar pasta raiz como `writer`
- Adicionar campo `googleDriveEmail` no model Usuario (opcional, para o orientador configurar)

### 3. UI de configuração
- Página do orientador com campo pra informar email do Google Drive
- Pastas existentes são compartilhadas retroativamente

## Tasks
1. Atualizar `google.ts` — Meet + Drive share
2. Atualizar `actions.ts` — usar Meet dinâmico
3. Adicionar campo `googleDriveEmail` no schema + migration
4. Criar UI de configuração do Drive
5. Build + deploy