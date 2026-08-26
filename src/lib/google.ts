/**
 * Utilitário de integração Google — modo independente (sem Service Account).
 * 
 * Drive: o orientador cola manualmente o link da sua pasta do Google Drive.
 * Meet: o orientador cola manualmente o link da reunião (Meet, Teams, Zoom, etc).
 * 
 * Nenhuma chamada de API Google é feita — zero dependência de credenciais.
 */

/**
 * Gera um ID amigável para a pasta do projeto (usado como referência)
 */
export function gerarIdPastaDrive(nomeAluno: string, tituloProjeto: string): string {
  const curto = tituloProjeto.substring(0, 20).replace(/\s+/g, '-');
  return `SOAI-${nomeAluno.replace(/\s+/g, '-')}-${curto}`;
}

/**
 * Mock: cria estrutura de pastas (apenas log, sem API)
 */
export async function criarEstruturaPastasDrive(
  nomeAluno: string,
  tituloProjeto: string,
  _emailOrientador?: string | null
): Promise<string> {
  const id = gerarIdPastaDrive(nomeAluno, tituloProjeto);
  console.log(`[SOAI DRIVE] Pasta de referência criada: "${id}"`);
  console.log(`[SOAI DRIVE] Oriente o professor a criar/copiar o link da pasta no Google Drive.`);
  return id;
}

/**
 * Mock: cria evento no calendário (apenas log, sem API)
 * Retorna um ID mock e NENHUM hangoutLink — o orientador deve colar o link manualmente.
 */
export async function criarEventoCalendar(_params: {
  numeroEncontro: number;
  dataHoraInicio: Date;
  descricao: string;
  emailAluno: string;
  nomeAluno: string;
}): Promise<{ eventId: string; hangoutLink: string | null }> {
  console.log(`[SOAI CALENDAR] Evento registrado em modo local (sem integração Google Calendar).`);
  console.log(`[SOAI CALENDAR] O orientador deve colar manualmente o link da reunião.`);
  return {
    eventId: `local-${Date.now()}`,
    hangoutLink: null,
  };
}

/**
 * Mock: compartilha pasta (apenas log, sem API)
 */
export async function compartilharPastaDrive(
  _folderId: string,
  _emailOrientador: string
): Promise<boolean> {
  console.log(`[SOAI DRIVE] Compartilhamento manual. Oriente o professor a compartilhar a pasta pelo Google Drive.`);
  return true;
}