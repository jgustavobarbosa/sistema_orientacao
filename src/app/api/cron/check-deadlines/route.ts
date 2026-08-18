import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { enviarEmailAlertaPrazo } from '@/lib/mail';
import { StatusMarco } from '@prisma/client';

export async function GET(req: Request) {
  // 1. Validação de Segurança do Cron Job
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');
  const secretHeader = req.headers.get('authorization')?.replace('Bearer ', '');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secretParam !== cronSecret && secretHeader !== cronSecret) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas

    // Buscar marcos acadêmicos não concluídos
    const marcos = await prisma.marcoAcademico.findMany({
      where: {
        status: { not: StatusMarco.CONCLUIDO }
      },
      include: {
        projeto: {
          include: { orientando: true }
        }
      }
    });

    let alertasEnviados = 0;
    let marcosAtualizados = 0;

    for (const marco of marcos) {
      const dataPrevista = new Date(marco.dataPrevista);
      dataPrevista.setHours(0, 0, 0, 0);

      // Diferença em milissegundos convertida para dias
      const diffTime = dataPrevista.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const emailAluno = marco.projeto.orientando.email;
      const nomeAluno = marco.projeto.orientando.nome;
      const dataPrazoFormatada = dataPrevista.toLocaleDateString('pt-BR');

      // Caso 1: Marco Atrasado
      if (diffDays < 0) {
        if (marco.status !== StatusMarco.ATRASADO) {
          // Atualizar o status do marco para ATRASADO no banco
          await prisma.marcoAcademico.update({
            where: { id: marco.id },
            data: { status: StatusMarco.ATRASADO }
          });
          marcosAtualizados++;

          // Disparar e-mail de alerta de atraso
          await enviarEmailAlertaPrazo({
            emailDestino: emailAluno,
            nomeAluno,
            tituloMarco: marco.titulo,
            dataPrazo: dataPrazoFormatada,
            diasRestantes: diffDays
          });
          alertasEnviados++;
        }
      } 
      // Caso 2: Alertas Críticos de Prazo (D-30, D-15, D-7)
      else if (diffDays === 30 || diffDays === 15 || diffDays === 7) {
        await enviarEmailAlertaPrazo({
          emailDestino: emailAluno,
          nomeAluno,
          tituloMarco: marco.titulo,
          dataPrazo: dataPrazoFormatada,
          diasRestantes: diffDays
        });
        alertasEnviados++;
      }
    }

    return NextResponse.json({
      success: true,
      mensagem: `Checagem concluída.`,
      marcosAnalisados: marcos.length,
      marcosAtualizadosParaAtrasado: marcosAtualizados,
      alertasEmailDisparados: alertasEnviados
    });
  } catch (error: any) {
    console.error('Erro ao executar Cron Job de prazos:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
