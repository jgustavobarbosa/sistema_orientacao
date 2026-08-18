import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario, StatusReuniao } from '@prisma/client';
import { FormAta } from '@/components/form-ata';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { enviarEmailAtaRegistrada } from '@/lib/mail';
import { criarEventoCalendar } from '@/lib/google';

// Server Action que será passada para o componente Client FormAta
async function salvarAta(data: any) {
  'use server';

  const {
    projetoId,
    numeroEncontro,
    dataHoraInicio,
    versaoMaterial,
    participantes,
    perguntaVigente,
    produtoEmDesenvolvimento,
    situacaoCronograma,
    sinteseAvanco,
    decisoes,
    riscos,
    planoTrabalho,
    perguntasProximaEntrega,
    proximoEncontro
  } = data;

  try {
    // Buscar informações do orientando previamente
    const projetoComAluno = await prisma.projetoOrientacao.findUnique({
      where: { id: projetoId },
      include: { orientando: true }
    });

    if (!projetoComAluno) {
      throw new Error('Projeto de orientação não encontrado.');
    }

    // Agendar compromisso no Google Calendar se houver próximo encontro definido
    let calendarEventId: string | null = null;
    if (proximoEncontro && proximoEncontro.dataHora) {
      try {
        calendarEventId = await criarEventoCalendar({
          numeroEncontro: numeroEncontro + 1,
          dataHoraInicio: new Date(proximoEncontro.dataHora),
          descricao: `SOAI: Encontro #${numeroEncontro + 1} de Orientação Acadêmica.\nCritério de Entrega: ${proximoEncontro.criterioAdequado || 'A combinar'}\nMaterial prévio (72h antes): ${proximoEncontro.materialPrevio || 'Nenhum'}`,
          emailAluno: projetoComAluno.orientando.email,
          nomeAluno: projetoComAluno.orientando.nome
        });
      } catch (err) {
        console.error('Falha ao registrar compromisso no Google Calendar:', err);
      }
    }

    // 1. Criar a reunião no banco de dados com o ID do evento do calendário
    const reuniao = await prisma.reuniao.create({
      data: {
        projetoId,
        numeroEncontro,
        dataHoraInicio,
        versaoMaterial,
        participantes,
        perguntaVigente,
        produtoEmDesenvolvimento,
        situacaoCronograma,
        sinteseAvanco,
        decisoes,
        riscos,
        planoTrabalho,
        perguntasProximaEntrega,
        proximoEncontro,
        calendarEventId,
        status: StatusReuniao.REALIZADA,
      },
    });

    // 2. Criar as tarefas associadas a essa reunião na tabela normalizada TarefaReuniao
    if (planoTrabalho && Array.isArray(planoTrabalho)) {
      await prisma.$transaction(
        planoTrabalho.map((t: any) => 
          prisma.tarefaReuniao.create({
            data: {
              reuniaoId: reuniao.id,
              responsavelId: t.responsavelId,
              descricao: t.tarefa,
              prazo: new Date(t.prazo),
              concluida: false
            }
          })
        )
      );
    }

    // 3. Atualizar a pergunta de pesquisa vigente no projeto
    await prisma.projetoOrientacao.update({
      where: { id: projetoId },
      data: { perguntaPesquisa: perguntaVigente }
    });

    // 4. Disparar o e-mail de notificação para o aluno
    const dataHoraFormatada = new Date(dataHoraInicio).toLocaleString('pt-BR');
    await enviarEmailAtaRegistrada({
      emailDestino: projetoComAluno.orientando.email,
      nomeAluno: projetoComAluno.orientando.nome,
      numeroEncontro,
      dataHora: dataHoraFormatada,
      reuniaoId: reuniao.id
    });

    return { success: true, reuniaoId: reuniao.id };
  } catch (error: any) {
    console.error('Erro ao salvar ata de reunião:', error);
    return { success: false, error: error.message || 'Falha ao salvar a ata no banco de dados.' };
  }
}

interface NovaAtaPageProps {
  searchParams: Promise<{ projetoId?: string }>;
}

export default async function NovaAtaPage({ searchParams }: NovaAtaPageProps) {
  const session = await getServerSession(authOptions);
  const { projetoId } = await searchParams;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR) {
    redirect('/login');
  }

  if (!projetoId) {
    redirect('/orientador');
  }

  // Buscar dados do projeto de orientação
  const projeto = await prisma.projetoOrientacao.findUnique({
    where: { id: projetoId },
    include: {
      orientando: true,
      reunioes: {
        select: { numeroEncontro: true }
      }
    }
  });

  if (!projeto) {
    redirect('/orientador');
  }

  // Calcular número sugerido para o encontro (total de encontros + 1)
  const numeroSugerido = projeto.reunioes.length + 1;
  const perguntaPesquisaSugerida = projeto.perguntaPesquisa || '';

  const alunosOption = [
    { id: projeto.orientando.id, nome: projeto.orientando.nome }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Voltar */}
      <Link
        href={`/orientador/alunos/${projeto.orientandoId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a página do aluno
      </Link>

      {/* Cabeçalho */}
      <div className="border-b border-slate-900/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Nova Ata de Orientação</h1>
        </div>
        <p className="text-slate-400 mt-1">
          Preencha o registro oficial do encontro com <span className="font-semibold text-slate-300">{projeto.orientando.nome}</span>.
        </p>
      </div>

      {/* Formulário de Ata */}
      <FormAta
        projetoId={projeto.id}
        alunos={alunosOption}
        numeroSugerido={numeroSugerido}
        perguntaPesquisaSugerida={perguntaPesquisaSugerida}
        onSubmitAction={salvarAta}
      />
    </div>
  );
}
