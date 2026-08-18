import { google } from 'googleapis';

// Carregar chaves a partir de variáveis de ambiente
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
// Corrigir quebras de linha na chave privada se vier do arquivo de variáveis de ambiente
const privateKey = privateKeyRaw ? privateKeyRaw.replace(/\\n/g, '\n') : null;

// Escopos necessários para ler/gravar arquivos e eventos da agenda
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/calendar.events',
];

function getAuthClient() {
  if (!clientEmail || !privateKey) {
    return null;
  }
  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });
}

/**
 * Cria a estrutura de 7 pastas exigida pela Skill do projeto para o Aluno
 */
export async function criarEstruturaPastasDrive(nomeAluno: string, tituloProjeto: string): Promise<string> {
  const auth = getAuthClient();
  const tituloCurto = tituloProjeto.substring(0, 20);
  const pastaRaizNome = `SOAI - ${nomeAluno} - ${tituloCurto}`;

  if (!auth) {
    console.log(`\n[GOOGLE DRIVE MOCK] Criando pasta raiz: "${pastaRaizNome}"`);
    console.log('[GOOGLE DRIVE MOCK] Subpastas criadas: 00-Plano, 01-Pesquisa, 02-Capitulos, 03-Atas, 04-Dados, 05-Etica, 06-Apresentacoes');
    return `mock-folder-raiz-${Date.now()}`;
  }

  try {
    const drive = google.drive({ version: 'v3', auth });

    // 1. Criar pasta raiz
    const metadataPasta = {
      name: pastaRaizNome,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const resRaiz = await drive.files.create({
      requestBody: metadataPasta,
      fields: 'id',
    });

    const folderRaizId = resRaiz.data.id!;

    // 2. Criar as 7 subpastas obrigatórias
    const subpastas = [
      '00 - Plano de Orientação',
      '01 - Plano de Pesquisa',
      '02 - Capítulos e Manuscritos',
      '03 - Atas de Reunião',
      '04 - Dados e Scripts',
      '05 - Ética e Autorizações',
      '06 - Apresentações e Slides',
    ];

    for (const sub of subpastas) {
      await drive.files.create({
        requestBody: {
          name: sub,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderRaizId],
        },
      });
    }

    console.log(`Estrutura de pastas criada no Google Drive com ID Raiz: ${folderRaizId}`);
    return folderRaizId;
  } catch (error) {
    console.error('Erro ao criar estrutura de pastas no Google Drive:', error);
    // Retorna fallback mesmo em caso de erro das credenciais para não crashar o fluxo principal
    return `fallback-folder-${Date.now()}`;
  }
}

/**
 * Cria compromisso no Google Calendar do Orientador convidando o Aluno
 */
interface EventoCalendarParams {
  numeroEncontro: number;
  dataHoraInicio: Date;
  descricao: string;
  emailAluno: string;
  nomeAluno: string;
}

export async function criarEventoCalendar({
  numeroEncontro,
  dataHoraInicio,
  descricao,
  emailAluno,
  nomeAluno
}: EventoCalendarParams): Promise<string> {
  const auth = getAuthClient();
  const summary = `SOAI: Orientação #${numeroEncontro} - ${nomeAluno}`;

  // Estimativa de 1h de duração por padrão
  const dataHoraFim = new Date(dataHoraInicio.getTime() + 60 * 60 * 1000);

  if (!auth) {
    console.log(`\n[GOOGLE CALENDAR MOCK] Agendando evento: "${summary}"`);
    console.log(`[GOOGLE CALENDAR MOCK] Início: ${dataHoraInicio.toISOString()}`);
    console.log(`[GOOGLE CALENDAR MOCK] Convidado: ${emailAluno}`);
    return `mock-calendar-event-${Date.now()}`;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary,
      description: descricao,
      start: {
        dateTime: dataHoraInicio.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: dataHoraFim.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: [{ email: emailAluno }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log(`Evento criado no Google Calendar com ID: ${res.data.id}`);
    return res.data.id!;
  } catch (error) {
    console.error('Erro ao agendar reunião no Google Calendar:', error);
    return `fallback-event-${Date.now()}`;
  }
}
