import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario, TipoMarco, StatusMarco, NivelProjeto } from '@prisma/client';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  FileText, 
  ArrowLeft,
  GraduationCap,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Edit3,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { criarMarcoPersonalizado, alternarMarcoStatus, deletarMarco, editarProjeto, agendarReuniao, reagendarReuniao, agendarReuniaoLivre } from '@/app/actions';
import { CountdownTimer } from '@/components/countdown-timer';

interface AlunoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalhesAlunoPage({ params }: AlunoPageProps) {
  const session = await getServerSession(authOptions);
  const { id: alunoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR) {
    redirect('/login');
  }

  // Obter o aluno
  const aluno = await prisma.usuario.findUnique({
    where: { id: alunoId },
  });

  if (!aluno) {
    redirect('/orientador');
  }

  // Obter o projeto ativo do aluno
  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: aluno.id },
    include: {
      marcos: {
        orderBy: { dataPrevista: 'asc' },
      },
      reunioes: {
        orderBy: { dataHoraInicio: 'desc' },
      },
      documentos: {
        include: { parecerLLM: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const hoje = new Date();

  // Buscar disponibilidades do orientador logado
  const disponibilidades = await prisma.disponibilidadeOrientador.findMany({
    where: { orientadorId: session.user.id },
    orderBy: [
      { diaSemana: 'asc' },
      { horaInicio: 'asc' }
    ]
  });

  const diasSemanaDisponiveis = Array.from(new Set(disponibilidades.map(d => d.diaSemana)));
  const datasDisponiveis: { dataFormatada: string; dataIso: string; diaSemana: number }[] = [];
  
  for (let i = 0; i < 30; i++) {
    const dataFocus = new Date();
    dataFocus.setDate(hoje.getDate() + i);
    if (diasSemanaDisponiveis.includes(dataFocus.getDay())) {
      datasDisponiveis.push({
        dataFormatada: dataFocus.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
        dataIso: dataFocus.toISOString().split('T')[0],
        diaSemana: dataFocus.getDay()
      });
    }
  }

  const slotsCombinados: { id: string; slotId: string; dataIso: string; label: string }[] = [];
  datasDisponiveis.forEach(dt => {
    const slotsDoDia = disponibilidades.filter(d => d.diaSemana === dt.diaSemana);
    slotsDoDia.forEach(slot => {
      slotsCombinados.push({
        id: `${dt.dataIso}_${slot.id}`,
        slotId: slot.id,
        dataIso: dt.dataIso,
        label: `${dt.dataFormatada} às ${slot.horaInicio} - ${slot.horaFim}`
      });
    });
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Botão Voltar */}
      <Link
        href="/orientador"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Painel
      </Link>

      {/* Identificação do Aluno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">{aluno.nome}</h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
              {aluno.ativo ? 'Autorizado' : 'Suspenso'}
            </span>
          </div>
          <p className="text-slate-400 text-sm">{aluno.email}</p>
        </div>

        {projeto && (
          <div className="flex items-center gap-4">
            {projeto.prazoDefesa && (
              <CountdownTimer prazoDefesa={projeto.prazoDefesa} />
            )}

            <div className="flex gap-3">
              <Link
                href={`/orientador/alunos/${alunoId}/biblioteca`}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-350 border border-slate-800 font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" />
                Biblioteca
              </Link>

              <Link
                href={`/orientador/alunos/${alunoId}/redacao`}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-350 border border-slate-800 font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4" />
                Revisar Capítulos
              </Link>

              <Link
                href={`/orientador/reunioes/nova?projetoId=${projeto.id}`}
                className="py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Registrar Encontro (Ata)
              </Link>
            </div>
          </div>
        )}
      </div>

      {projeto && (
        <details className="glass p-6 rounded-2xl border border-slate-900/60 group">
          <summary className="list-none flex items-center justify-between cursor-pointer outline-none select-none">
            <div className="space-y-1">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
                {projeto.nivel} | {projeto.programa || 'Geral'}
              </span>
              <h2 className="text-xl font-bold text-slate-200 mt-1 line-clamp-1">{projeto.titulo}</h2>
              {projeto.perguntaPesquisa && (
                <p className="text-xs italic text-slate-400 font-mono mt-1">
                  &ldquo;{projeto.perguntaPesquisa}&rdquo;
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {projeto.prazoDefesa && (
                <span className="text-xs text-slate-500 hidden md:flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Defesa: {new Date(projeto.prazoDefesa).toLocaleDateString('pt-BR')}
                </span>
              )}
              <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-xl group-open:hidden flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                <Edit3 className="h-3.5 w-3.5" />
                Editar Projeto
              </span>
              <span className="text-xs font-bold px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl hidden group-open:inline-block transition-colors">
                Fechar Edição
              </span>
            </div>
          </summary>

          <form action={editarProjeto} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t border-slate-900/60 animate-in slide-in-from-top-3 duration-200">
            <input type="hidden" name="projetoId" value={projeto.id} />
            <input type="hidden" name="orientandoId" value={aluno.id} />

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block">Título do Projeto</label>
              <input
                type="text"
                name="titulo"
                defaultValue={projeto.titulo}
                required
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block">Pergunta de Pesquisa Vigente</label>
              <textarea
                name="perguntaPesquisa"
                defaultValue={projeto.perguntaPesquisa || ''}
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Nível do Projeto</label>
              <select
                name="nivel"
                defaultValue={projeto.nivel}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              >
                <option value={NivelProjeto.IC}>Iniciação Científica (IC)</option>
                <option value={NivelProjeto.TCC}>Trabalho de Conclusão (TCC)</option>
                <option value={NivelProjeto.MESTRADO}>Mestrado</option>
                <option value={NivelProjeto.DOUTORADO}>Doutorado</option>
                <option value={NivelProjeto.POS_DOC}>Pós-Doutorado (Pós-Doc)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Programa Acadêmico</label>
              <input
                type="text"
                name="programa"
                defaultValue={projeto.programa || ''}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Prazo Final / Data Limite de Defesa</label>
              <input
                type="date"
                name="prazoDefesa"
                defaultValue={projeto.prazoDefesa ? new Date(projeto.prazoDefesa).toISOString().substring(0, 10) : ''}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Salvar Alterações do Projeto
              </button>
            </div>
          </form>
        </details>
      )}

      {!projeto ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center space-y-4">
          <GraduationCap className="h-12 w-12 text-slate-600" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">Nenhum projeto vinculado a este orientando.</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Volte ao Painel de Orientação e crie um projeto de pesquisa vinculando este aluno.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline de Marcos */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200">Cronograma de Marcos</h2>
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-900/60 relative space-y-6">
              {projeto.marcos.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhum marco definido para este projeto.</p>
              ) : (
                <div className="relative border-l border-slate-800 ml-4 space-y-8">
                  {projeto.marcos.map((marco) => {
                    const dataPrevista = new Date(marco.dataPrevista);
                    const isAtrasado = marco.status !== StatusMarco.CONCLUIDO && dataPrevista < hoje;
                    const isConcluido = marco.status === StatusMarco.CONCLUIDO;

                    return (
                      <div key={marco.id} className="relative pl-8 group">
                        {/* Ponto da timeline */}
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
                              <span className="text-xs font-medium px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                                {marco.tipo}
                              </span>
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
                                  Concluído em: {new Date(marco.dataConclusao).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Toggle de Status */}
                            <form action={alternarMarcoStatus.bind(null, marco.id, aluno.id, marco.status)}>
                              <button
                                type="submit"
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                  isConcluido
                                    ? 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-850'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {isConcluido ? 'Reabrir' : 'Concluir'}
                              </button>
                            </form>

                            {/* Deletar Marco */}
                            <form action={deletarMarco.bind(null, marco.id, aluno.id)}>
                              <button
                                type="submit"
                                className="p-1 text-slate-500 hover:text-red-400 border border-transparent hover:border-slate-800 hover:bg-slate-900/60 rounded-md transition-all cursor-pointer"
                                title="Excluir marco"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Documentos Enviados e Parecer LLM */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-200">Documentos e Manuscritos</h2>
              <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
                {projeto.documentos.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2 text-center">Nenhum documento anexado ainda.</p>
                ) : (
                  <div className="divide-y divide-slate-900/60">
                    {projeto.documentos.map((doc) => (
                      <div key={doc.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-md">
                              {doc.categoria}
                            </span>
                            <span className="text-xs text-slate-500">v{doc.versao}</span>
                          </div>
                          <h4 className="font-bold text-slate-200 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {doc.titulo}
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Enviado em: {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {doc.parecerLLM ? (
                            <Link
                              href={`/orientador/reunioes/${doc.id}/parecer`} // rota placeholder de parecer
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                              Ver Parecer LLM
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-slate-500 border border-slate-800 rounded-lg text-xs">
                              Sem Parecer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Adicionar Marco Lateral & Histórico de Reuniões */}
          <div className="lg:col-span-1 space-y-6">
            {/* Adicionar Marco */}
            <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-900/60 pb-4 mb-2">
                <PlusCircle className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Novo Marco</h3>
              </div>

              <form action={criarMarcoPersonalizado} className="space-y-4">
                <input type="hidden" name="projetoId" value={projeto.id} />
                <input type="hidden" name="orientandoId" value={aluno.id} />

                <div className="space-y-1.5">
                  <label htmlFor="titulo" className="text-xs font-semibold text-slate-400">
                    Título do Marco
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    required
                    placeholder="Ex: Escrita do Capítulo 1"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tipo" className="text-xs font-semibold text-slate-400">
                    Tipo do Marco
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm transition-all outline-none"
                  >
                    <option value={TipoMarco.CAPITULO}>Capítulo</option>
                    <option value={TipoMarco.REVISAO}>Revisão</option>
                    <option value={TipoMarco.APRESENTACAO}>Apresentação</option>
                    <option value={TipoMarco.CHECKLIST}>Checklist</option>
                    <option value={TipoMarco.QUALIFICACAO}>Qualificação</option>
                    <option value={TipoMarco.DEFESA}>Defesa</option>
                    <option value={TipoMarco.SUBMISSAO}>Submissão</option>
                    <option value={TipoMarco.OUTRO}>Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="descricao" className="text-xs font-semibold text-slate-400">
                    Descrição/Detalhes
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    placeholder="O que deve ser entregue..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="dataPrevista" className="text-xs font-semibold text-slate-400">
                    Prazo Limite
                  </label>
                  <input
                    type="date"
                    id="dataPrevista"
                    name="dataPrevista"
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm transition-all outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Adicionar Marco
                </button>
              </form>
            </div>

            {/* Agendar Reunião com o Aluno */}
            <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-indigo-400">
                <Calendar className="h-5 w-5 shrink-0" />
                <h3 className="font-bold text-slate-200">Agendar Novo Encontro</h3>
              </div>

              <details className="group border-b border-slate-900/40 pb-3" open={slotsCombinados.length > 0}>
                <summary className="text-xs font-bold text-slate-450 hover:text-slate-200 cursor-pointer list-none flex items-center justify-between select-none outline-none">
                  <span>Usar Disponibilidade Semanal</span>
                  <span className="text-[10px] text-indigo-400 group-open:hidden">Abrir</span>
                  <span className="text-[10px] text-indigo-400 hidden group-open:inline">Fechar</span>
                </summary>
                {slotsCombinados.length > 0 ? (
                  <form action={agendarReuniao.bind(null, alunoId)} className="space-y-3 mt-3">
                    <div className="space-y-1">
                      <label htmlFor="horarioCombinado" className="text-[10px] font-semibold text-slate-400">
                        Selecione o Horário Disponível
                      </label>
                      <select
                        id="horarioCombinado"
                        name="horarioCombinado"
                        required
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                      >
                        <option value="">Escolha uma data livre...</option>
                        {slotsCombinados.map((slot) => (
                          <option key={slot.id} value={`${slot.dataIso}_${slot.slotId}`}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="objetivoSlot" className="text-[10px] font-semibold text-slate-400">
                        Objetivo da Reunião
                      </label>
                      <textarea
                        id="objetivoSlot"
                        name="objetivo"
                        rows={2}
                        required
                        placeholder="Descreva o objetivo do encontro..."
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Confirmar Encontro
                    </button>
                  </form>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-2">Você não possui slots livres configurados para as próximas semanas.</p>
                )}
              </details>

              <details className="group pt-1" open={slotsCombinados.length === 0}>
                <summary className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer list-none flex items-center justify-between select-none outline-none">
                  <span>Agendamento Livre (Sem dependência de slots)</span>
                  <span className="text-[10px] text-indigo-400 group-open:hidden">Abrir</span>
                  <span className="text-[10px] text-indigo-400 hidden group-open:inline">Fechar</span>
                </summary>
                <form action={agendarReuniaoLivre.bind(null, projeto.id)} className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="dataLivre" className="text-[10px] font-semibold text-slate-400">
                        Data da Reunião
                      </label>
                      <input
                        type="date"
                        id="dataLivre"
                        name="data"
                        required
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="horaLivre" className="text-[10px] font-semibold text-slate-400">
                        Horário de Início
                      </label>
                      <input
                        type="time"
                        id="horaLivre"
                        name="hora"
                        required
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="objetivoLivre" className="text-[10px] font-semibold text-slate-400">
                      Objetivo da Reunião
                    </label>
                    <textarea
                      id="objetivoLivre"
                      name="objetivo"
                      rows={2}
                      required
                      placeholder="Descreva o objetivo do encontro..."
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Confirmar Encontro Livre
                  </button>
                </form>
              </details>
            </div>

            {/* Histórico de Atas/Reuniões */}
            <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Reuniões Recentes</h3>
              </div>

              {projeto.reunioes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">Nenhum encontro registrado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {projeto.reunioes.map((reuniao) => {
                    const isFutura = new Date(reuniao.dataHoraInicio) >= hoje;
                    return (
                      <div
                        key={reuniao.id}
                        className="p-3 bg-slate-900/30 border border-slate-900/40 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/orientador/reunioes/${reuniao.id}`}
                            className="space-y-0.5 hover:text-indigo-400 transition-colors animate-all"
                          >
                            <div className="text-xs font-bold text-slate-200">
                              Encontro #{reuniao.numeroEncontro}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(reuniao.dataHoraInicio).toLocaleDateString('pt-BR')} às {new Date(reuniao.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {reuniao.objetivo && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-[200px] truncate">
                                &ldquo;{reuniao.objetivo}&ldquo;
                              </div>
                            )}
                          </Link>
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </div>

                        {isFutura && slotsCombinados.length > 0 && (
                          <details className="group border-t border-slate-900/50 pt-2">
                            <summary className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer list-none flex items-center gap-1 select-none outline-none">
                              Reagendar Horário
                            </summary>
                            <form action={reagendarReuniao.bind(null, reuniao.id)} className="mt-2 space-y-2">
                              <select
                                name="horarioCombinado"
                                required
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-[10px] text-slate-250 outline-none"
                              >
                                <option value="">Novo horário...</option>
                                {slotsCombinados.map(slot => (
                                  <option key={slot.id} value={`${slot.dataIso}_${slot.slotId}`}>
                                    {slot.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="submit"
                                className="w-full py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-[9px] rounded-lg transition-all cursor-pointer"
                              >
                                Alterar Horário
                              </button>
                            </form>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
