import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PapelUsuario, StatusProjeto } from '@prisma/client';
import { FormPropostaProjeto } from '@/components/form-proposta-projeto';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { alternarTarefa, alternarMarcoStatus } from '@/app/actions';
import { CountdownTimer } from '@/components/countdown-timer';

export default async function AlunoDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  const { prisma } = await import('@/lib/db');

  // Buscar o projeto ativo do aluno
  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: session.user.id },
    include: {
      orientador: true,
      marcos: {
        orderBy: { dataPrevista: 'asc' },
      },
      reunioes: {
        orderBy: { numeroEncontro: 'desc' },
        take: 5,
      },
    },
  });

  if (!projeto) {
    // Buscar todos os orientadores disponíveis
    const orientadores = await prisma.usuario.findMany({
      where: { papel: PapelUsuario.ORIENTADOR },
      select: { id: true, nome: true, email: true }
    });

    return (
      <FormPropostaProjeto orientandoId={session.user.id} orientadores={orientadores} />
    );
  }

  if (projeto.status === StatusProjeto.PROPOSTA) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass rounded-2xl border border-slate-900/60 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
        <Clock className="h-12 w-12 text-indigo-400 animate-pulse" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-200">Proposta sob Análise</h2>
          <p className="text-sm text-slate-400">
            Você propôs o projeto de pesquisa &ldquo;<strong>{projeto.titulo}</strong>&rdquo;.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            A proposta foi encaminhada com sucesso para o orientador <strong>{projeto.orientador.nome}</strong> ({projeto.orientador.email}). Aguarde a validação do professor para iniciar seu cronograma acadêmico.
          </p>
        </div>
      </div>
    );
  }

  // Buscar todas as tarefas de reuniões atribuídas a este aluno
  const reunioesIds = await prisma.reuniao.findMany({
    where: { projetoId: projeto.id },
    select: { id: true },
  });

  const tarefas = await prisma.tarefaReuniao.findMany({
    where: {
      reuniaoId: { in: reunioesIds.map((r) => r.id) },
      responsavelId: session.user.id,
    },
    orderBy: { prazo: 'asc' },
  });

  const hoje = new Date();

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            {projeto.nivel} — {projeto.programa || 'Geral'}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{projeto.titulo}</h1>
          <p className="text-slate-400 mt-1">
            Orientador: <span className="font-semibold text-slate-300">{projeto.orientador.nome}</span>
          </p>
        </div>

        {projeto.prazoDefesa && (
          <CountdownTimer prazoDefesa={projeto.prazoDefesa} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline de Marcos */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Timeline de Marcos</h2>

          <div className="glass p-6 rounded-2xl border border-slate-900/60 relative space-y-6">
            {projeto.marcos.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Nenhum marco definido para este projeto.</p>
            ) : (
              <div className="relative border-l border-slate-800 ml-4 space-y-8">
                {projeto.marcos.map((marco) => {
                  const dataPrevista = new Date(marco.dataPrevista);
                  const isAtrasado = marco.status !== 'CONCLUIDO' && dataPrevista < hoje;
                  const isConcluido = marco.status === 'CONCLUIDO';

                  return (
                    <div key={marco.id} className="relative pl-8 group">
                      {/* Ponto na timeline */}
                      <span className={`absolute left-0 top-1.5 -translate-x-1/2 w-4.5 h-4.5 rounded-full border-4 ${
                        isConcluido
                          ? 'bg-emerald-500 border-slate-950'
                          : isAtrasado
                          ? 'bg-amber-500 border-slate-950'
                          : 'bg-slate-700 border-slate-950'
                      }`} />

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className={`font-bold text-base ${isConcluido ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                            {marco.titulo}
                          </h3>
                          {marco.descricao && (
                            <p className="text-xs text-slate-400">{marco.descricao}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-600" />
                              Prazo: {dataPrevista.toLocaleDateString('pt-BR')}
                            </span>
                            {isAtrasado && (
                              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Clock className="h-3.5 w-3.5" />
                                Atrasado
                              </span>
                            )}
                            {isConcluido && marco.dataConclusao && (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Entregue em: {new Date(marco.dataConclusao).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ação para o Aluno marcar como Concluído */}
                        <form action={alternarMarcoStatus.bind(null, marco.id, session.user.id, marco.status)}>
                          <button
                            type="submit"
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isConcluido
                                ? 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-850'
                                : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border-indigo-500/20 shadow-sm'
                            }`}
                          >
                            {isConcluido ? 'Reabrir Marco' : 'Concluir'}
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quadro de Tarefas Pendentes */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Minhas Atividades</h2>

          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Plano de Trabalho</span>
              <span className="text-xs px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
                {tarefas.filter((t) => !t.concluida).length} pendentes
              </span>
            </div>

            {tarefas.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-xs">
                Nenhuma tarefa pendente cadastrada nas atas.
              </div>
            ) : (
              <div className="space-y-3.5">
                {tarefas.map((tarefa) => (
                  <div key={tarefa.id} className="flex items-start gap-3 p-3 bg-slate-900/30 border border-slate-900/40 rounded-xl hover:border-slate-800 transition-colors">
                    <form action={alternarTarefa.bind(null, tarefa.id, tarefa.concluida)}>
                      <button type="submit" className="text-slate-500 hover:text-indigo-400 transition-colors mt-0.5 cursor-pointer">
                        {tarefa.concluida ? (
                          <CheckSquare className="h-5 w-5 text-indigo-500" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </form>

                    <div className="space-y-1">
                      <p className={`text-xs font-semibold text-slate-200 leading-relaxed ${tarefa.concluida ? 'line-through text-slate-500' : ''}`}>
                        {tarefa.descricao}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>Prazo: {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
