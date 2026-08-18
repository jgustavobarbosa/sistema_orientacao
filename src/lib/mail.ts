import { enviarEmail } from './email';

interface EmailAtaParams {
  emailDestino: string;
  nomeAluno: string;
  numeroEncontro: number;
  dataHora: string;
  reuniaoId: string;
}

export async function enviarEmailAtaRegistrada({
  emailDestino,
  nomeAluno,
  numeroEncontro,
  dataHora,
  reuniaoId
}: EmailAtaParams) {
  const subject = `SOIA: Encontro de Orientação #${numeroEncontro} Registrado`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
      <h2 style="color: #2563eb; margin-bottom: 5px;">SOIA — Sistema de Orientação Acadêmica</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 25px;">Registro oficial de atividade acadêmica</p>
      
      <p style="color: #1e293b; font-size: 16px;">Olá, <strong>${nomeAluno}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        A ata correspondente ao nosso <strong>Encontro de Orientação #${numeroEncontro}</strong> realizado em <strong>${dataHora}</strong> foi registrada e disponibilizada no portal.
      </p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/aluno/reunioes/${reuniaoId}" 
           style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Visualizar Ata Completa & Tarefas
        </a>
      </div>
      
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Por favor, revise o plano de trabalho estabelecido na ata e verifique as tarefas e prazos sob sua responsabilidade diretamente no seu painel de orientando.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        E-mail enviado automaticamente pelo SOIA. Não responda a esta mensagem.
      </p>
    </div>
  `;

  // 1. Logar simulação no terminal
  console.log('\n===== [SMTP SOIA: DISPARO DE E-MAIL - ATA] =====');
  console.log(`Para: ${emailDestino}`);
  console.log(`Assunto: ${subject}`);
  console.log('================================================\n');

  // 2. Disparar e-mail SMTP real
  await enviarEmail(emailDestino, subject, html);
}

interface EmailAlertaParams {
  emailDestino: string;
  nomeAluno: string;
  tituloMarco: string;
  dataPrazo: string;
  diasRestantes: number;
}

export async function enviarEmailAlertaPrazo({
  emailDestino,
  nomeAluno,
  tituloMarco,
  dataPrazo,
  diasRestantes
}: EmailAlertaParams) {
  const isAtrasado = diasRestantes < 0;
  const subject = isAtrasado 
    ? `CRÍTICO: Marco Acadêmico Atrasado — ${tituloMarco}`
    : `ALERTA: Prazo de Marco Acadêmico em ${diasRestantes} dias — ${tituloMarco}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
      <h2 style="color: ${isAtrasado ? '#dc2626' : '#f59e0b'}; margin-bottom: 5px;">SOIA — Alerta de Cronograma</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 25px;">Notificação automática de prazo de entrega</p>
      
      <p style="color: #1e293b; font-size: 16px;">Olá, <strong>${nomeAluno}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        Este é um lembrete automático sobre o marco acadêmico <strong>"${tituloMarco}"</strong>.
      </p>
      
      <div style="padding: 15px; background-color: ${isAtrasado ? '#fef2f2' : '#fffbeb'}; border-left: 4px solid ${isAtrasado ? '#ef4444' : '#f59e0b'}; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #374151;">
        <strong>Marco:</strong> ${tituloMarco}<br/>
        <strong>Prazo Limite:</strong> ${dataPrazo}<br/>
        <strong>Situação:</strong> ${isAtrasado ? 'ATRASADO' : `Faltam ${diasRestantes} dias para a entrega.`}
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/aluno" 
           style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Ver minha timeline de marcos
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        E-mail enviado automaticamente pelo SOIA. Não responda a esta mensagem.
      </p>
    </div>
  `;

  console.log('\n===== [SMTP SOIA: DISPARO DE E-MAIL - ALERTA] =====');
  console.log(`Para: ${emailDestino}`);
  console.log(`Assunto: ${subject}`);
  console.log('===================================================\n');

  await enviarEmail(emailDestino, subject, html);
}

interface EmailReservaReuniaoParams {
  emailAluno: string;
  emailOrientador: string;
  nomeAluno: string;
  nomeOrientador: string;
  dataHora: string;
  objetivo: string;
  linkMeet: string;
  acao: 'AGENDAMENTO' | 'REAGENDAMENTO';
}

export async function enviarEmailReservaReuniao({
  emailAluno,
  emailOrientador,
  nomeAluno,
  nomeOrientador,
  dataHora,
  objetivo,
  linkMeet,
  acao
}: EmailReservaReuniaoParams) {
  const isReagendamento = acao === 'REAGENDAMENTO';
  const subject = `SOIA: ${isReagendamento ? 'Reagendamento' : 'Agendamento'} de Encontro de Orientação Confirmado`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
      <h2 style="color: #2563eb; margin-bottom: 5px;">SOIA — Encontro de Orientação</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 25px;">Confirmação de agendamento de reuniões</p>
      
      <p style="color: #1e293b; font-size: 16px;">Olá,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        Um encontro de orientação foi ${isReagendamento ? 'reagendado' : 'agendado'} com sucesso na plataforma SOIA.
      </p>
      
      <div style="padding: 15px; background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #374151; line-height: 1.6;">
        <strong>Aluno:</strong> ${nomeAluno}<br/>
        <strong>Orientador:</strong> ${nomeOrientador}<br/>
        <strong>Data/Hora do Encontro:</strong> ${dataHora}<br/>
        <strong>Objetivo/Pauta:</strong> ${objetivo || 'Reunião geral de progresso'}<br/>
        <strong>Link do Google Meet (Fixo por aluno):</strong> <a href="${linkMeet}" style="color: #2563eb; text-decoration: underline; font-weight: bold;">Acessar Sala Virtual</a>
      </div>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/login" 
           style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Acessar Portal SOIA
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        E-mail enviado automaticamente pelo SOIA. Não responda a esta mensagem.
      </p>
    </div>
  `;

  const destinatarios = [emailAluno, emailOrientador];

  console.log(`\n===== [SMTP SOIA: DISPARO DE E-MAIL - ${acao}] =====`);
  console.log(`Destinatários: ${destinatarios.join(', ')}`);
  console.log(`Assunto: ${subject}`);
  console.log('=======================================================\n');

  // Disparar e-mail SMTP individual para aluno e orientador para preservar privacidade e garantir entrega
  await Promise.all(
    destinatarios.map(email => enviarEmail(email, subject, html))
  );
}
