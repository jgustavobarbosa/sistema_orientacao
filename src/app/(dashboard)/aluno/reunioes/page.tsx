import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { FileText, Calendar, ChevronRight, Video, Clock, HelpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { agendarReuniao, reagendarReuniao } from '@/app/actions';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export default async function AlunoReunioesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  // Buscar projeto do aluno para saber o orientador
  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: session.user.id },
    include: { orientador: true }
  });

  if (!projeto) {
    redirect('/aluno');
  }

  // Buscar disponibilidades do orientador
  const disponibilidades = await prisma.disponibilidadeOrientador.findMany({
    where: { orientadorId: projeto.orientadorId },
    orderBy: [
      { diaSemana: 'asc' },
      { horaInicio: 'asc' }
    ]
  });

  // Buscar reuniões já agendadas (histórico e futuras)
  const reunioes = await prisma.reuniao.findMany({
    where: { projetoId: projeto.id },
    orderBy: { dataHoraInicio: 'desc' }
  });

  // Dividir reuniões em futuras (agendadas) e passadas (histórico/concluídas)
  const hoje = new Date();
  const reunioesFuturas = reunioes.filter(r => new Date(r.dataHoraInicio) >= hoje);
  const reunioesPassadas = reunioes.filter(r => new Date(r.dataHoraInicio) < hoje);

  // Lógica inteligente de geração de datas para os próximos 30 dias que coincidem com as disponibilidades do orientador
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

  // Mapear os slots combinados de Data + SlotId
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
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Agendamento & Encontros</h1>
        <p className="text-slate-400 mt-1">
          Solicite reuniões nos horários de orientação disponibilizados pelo seu orientador ou acesse os detalhes e atas dos encontros anteriores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel Esquerdo: Agendar Reunião */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-200">Requerer Horário</h3>
            </div>

            {slotsCombinados.length === 0 ? (
              <div className="p-4 bg-slate-900/40 border border-slate-900/60 rounded-xl text-center space-y-1">
                <HelpCircle className="h-6 w-6 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Sem horários disponibilizados.</p>
                <p className="text-[10px] text-slate-500">Seu orientador {projeto.orientador.nome} ainda não cadastrou slots de disponibilidade.</p>
              </div>
            ) : (
              <form action={agendarReuniao.bind(null, session.user.id)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="horarioCombinado" className="text-xs font-semibold text-slate-400">
                    Selecione o Dia e Horário Disponível
                  </label>
                  <select
                    id="horarioCombinado"
                    name="horarioCombinado"
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
                  >
                    <option value="">Escolha um slot livre da agenda...</option>
                    {slotsCombinados.map((slot) => (
                      <option key={slot.id} value={`${slot.dataIso}_${slot.slotId}`}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="objetivo" className="text-xs font-semibold text-slate-400">
                    Objetivo / Pauta da Orientação
                  </label>
                  <textarea
                    id="objetivo"
                    name="objetivo"
                    rows={3}
                    required
                    placeholder="Descreva brevemente o objetivo da reunião e quais dúvidas quer sanar..."
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-650/10 cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </form>
            )}
          </div>

          {/* Agenda de Disponibilidade Semanal de Referência */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <h4 className="font-bold text-sm text-slate-200 border-b border-slate-900/40 pb-2">
              Agenda do Orientador
            </h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {disponibilidades.length === 0 ? (
                <p className="text-xs text-slate-500 text-center">Nenhum slot cadastrado.</p>
              ) : (
                disponibilidades.map((slot) => (
                  <div key={slot.id} className="p-2.5 bg-slate-900/20 border border-slate-900/50 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">{DIAS_SEMANA[slot.diaSemana]}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-900/40 px-2 py-0.5 rounded border border-slate-900">
                      {slot.horaInicio} - {slot.horaFim}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito: Compromissos Agendados e Histórico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reuniões Futuras */}
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-900/60 bg-slate-900/10">
              <h3 className="font-bold text-slate-200 text-sm">Próximos Encontros</h3>
            </div>
            {reunioesFuturas.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">Nenhuma reunião futura agendada.</p>
            ) : (
              <div className="divide-y divide-slate-900/40">
                {reunioesFuturas.map((reuniao) => (
                  <div key={reuniao.id} className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
                            ENCONTRO #{reuniao.numeroEncontro}
                          </span>
                          <span className="text-xs text-slate-450 font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(reuniao.dataHoraInicio).toLocaleDateString('pt-BR')} às {new Date(reuniao.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200">Reunião agendada com {projeto.orientador.nome}</h4>
                        {reuniao.objetivo && (
                          <p className="text-xs text-slate-400 italic">
                            Objetivo: &ldquo;{reuniao.objetivo}&rdquo;
                          </p>
                        )}
                      </div>
                      
                      {reuniao.linkVideoconferencia && (
                        <a
                          href={reuniao.linkVideoconferencia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-350 border border-slate-800 rounded-lg text-xs font-semibold transition-all shrink-0"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Entrar no Meet
                        </a>
                      )}
                    </div>

                    {slotsCombinados.length > 0 && (
                      <details className="group border-t border-slate-900/50 pt-3">
                        <summary className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer list-none flex items-center gap-1 select-none outline-none">
                          Reagendar Encontro
                        </summary>
                        <form action={reagendarReuniao.bind(null, reuniao.id)} className="mt-2 flex gap-3 max-w-md">
                          <select
                            name="horarioCombinado"
                            required
                            className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                          >
                            <option value="">Escolha um novo horário...</option>
                            {slotsCombinados.map((slot) => (
                              <option key={slot.id} value={`${slot.dataIso}_${slot.slotId}`}>
                                {slot.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="py-2 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            Confirmar
                          </button>
                        </form>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Encontros (Atas passadas) */}
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-900/60 bg-slate-900/10">
              <h3 className="font-bold text-slate-200 text-sm">Histórico de Atas</h3>
            </div>
            {reunioesPassadas.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">Nenhum encontro anterior registrado.</p>
            ) : (
              <div className="divide-y divide-slate-900/40">
                {reunioesPassadas.map((reuniao) => (
                  <Link
                    key={reuniao.id}
                    href={`/aluno/reunioes/${reuniao.id}`}
                    className="flex items-center justify-between p-5 hover:bg-slate-900/20 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          Encontro #{reuniao.numeroEncontro}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          reuniao.situacaoCronograma === 'VERDE' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {reuniao.situacaoCronograma === 'VERDE' ? '🟢 Em dia' : '🟡 Risco'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-semibold text-slate-400 flex items-center justify-end gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-500" />
                          {new Date(reuniao.dataHoraInicio).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(reuniao.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-350 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
