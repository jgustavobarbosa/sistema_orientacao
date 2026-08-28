import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { Calendar, Clock, Trash2, Plus, Users, Video, Sparkles } from 'lucide-react';
import { salvarDisponibilidade, removerDisponibilidade, salvarConfigAgendaAutomatica } from '@/app/actions';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

export default async function OrientadorAgendaPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN) {
    redirect('/login');
  }

  // Buscar orientador no BD
  const orientadorDb = await prisma.usuario.findUnique({
    where: { email: session.user.email!.toLowerCase() }
  });

  if (!orientadorDb) {
    redirect('/login?error=ErroInterno');
  }

  // Buscar configuração automática ativa
  const configAuto = await prisma.configAgendaAutomatica.findFirst({
    where: { orientadorId: orientadorDb.id }
  });

  // Buscar disponibilidades configuradas
  const disponibilidades = await prisma.disponibilidadeOrientador.findMany({
    where: { orientadorId: orientadorDb.id },
    orderBy: [
      { diaSemana: 'asc' },
      { horaInicio: 'asc' }
    ]
  });

  // Buscar reuniões ativas futuras vinculadas ao orientador
  const reunioes = await prisma.reuniao.findMany({
    where: {
      projeto: { orientadorId: orientadorDb.id },
      dataHoraInicio: { gte: new Date() }
    },
    include: {
      projeto: {
        include: { orientando: true }
      }
    },
    orderBy: { dataHoraInicio: 'asc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gerenciamento de Agenda</h1>
        <p className="text-slate-400 mt-1">
          Defina seus slots de horários livres semanais para que seus alunos orientandos possam propor reuniões diretamente de acordo com sua disponibilidade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Adicionar Horário Disponível */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-200">Adicionar Slot Livre</h3>
            </div>

            <form action={salvarDisponibilidade.bind(null, orientadorDb.id)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="diaSemana" className="text-xs font-semibold text-slate-400">
                  Dia da Semana
                </label>
                <select
                  id="diaSemana"
                  name="diaSemana"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
                >
                  <option value="1">Segunda-feira</option>
                  <option value="2">Terça-feira</option>
                  <option value="3">Quarta-feira</option>
                  <option value="4">Quinta-feira</option>
                  <option value="5">Sexta-feira</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="horaInicio" className="text-xs font-semibold text-slate-400">
                    Hora de Início
                  </label>
                  <input
                    type="time"
                    id="horaInicio"
                    name="horaInicio"
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="horaFim" className="text-xs font-semibold text-slate-400">
                    Hora de Término
                  </label>
                  <input
                    type="time"
                    id="horaFim"
                    name="horaFim"
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-650/10 cursor-pointer"
              >
                Salvar Horário
              </button>
            </form>
          </div>

          {/* Lista de Disponibilidades Cadastradas */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-slate-200">Meus Slots Disponíveis</h3>
            </div>

            {disponibilidades.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum slot cadastrado.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {disponibilidades.map((disp) => (
                  <div key={disp.id} className="p-3 bg-slate-900/30 border border-slate-900/60 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-200">{DIAS_SEMANA[disp.diaSemana]}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-indigo-400" />
                        {disp.horaInicio} às {disp.horaFim}
                      </p>
                    </div>
                    <form action={removerDisponibilidade.bind(null, disp.id)}>
                      <button
                        type="submit"
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                        title="Remover horário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Configuração de Agenda Automática (Rotina Periódica) */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg animate-pulse">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-200">Rotina Automática de Encontros</h3>
            </div>

            <form action={salvarConfigAgendaAutomatica.bind(null, orientadorDb.id)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="frequencia" className="text-xs font-semibold text-slate-400">
                  Frequência de Encontros
                </label>
                <select
                  id="frequencia"
                  name="frequencia"
                  required
                  defaultValue={configAuto?.frequencia || 'QUINZENAL'}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                >
                  <option value="QUINZENAL">A cada 15 dias (Quinzenal)</option>
                  <option value="MENSAL">A cada 30 dias (Mensal)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="diaSemanaAuto" className="text-xs font-semibold text-slate-400">
                  Dia da Semana Preferencial
                </label>
                <select
                  id="diaSemanaAuto"
                  name="diaSemana"
                  required
                  defaultValue={configAuto?.diaSemana !== undefined ? configAuto.diaSemana.toString() : '2'}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                >
                  <option value="1">Segunda-feira</option>
                  <option value="2">Terça-feira</option>
                  <option value="3">Quarta-feira</option>
                  <option value="4">Quinta-feira</option>
                  <option value="5">Sexta-feira</option>
                  <option value="6">Sábado</option>
                  <option value="0">Domingo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="horaAuto" className="text-xs font-semibold text-slate-400">
                    Horário Preferencial
                  </label>
                  <input
                    type="time"
                    id="horaAuto"
                    name="hora"
                    required
                    defaultValue={configAuto?.hora || '14:00'}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ativo" className="text-xs font-semibold text-slate-400">
                    Status da Rotina
                  </label>
                  <select
                    id="ativo"
                    name="ativo"
                    required
                    defaultValue={configAuto?.ativo ? 'true' : 'false'}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                  >
                    <option value="true">Ativo (Agendar auto)</option>
                    <option value="false">Desativado</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-all duration-200 shadow-md shadow-indigo-650/15 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                Salvar e Aplicar Rotina
              </button>
            </form>
          </div>
        </div>

        {/* Reuniões Marcadas e Próximos Eventos */}
        <div className="lg:col-span-2 glass rounded-2xl border border-slate-900/60 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              Compromissos Agendados
            </h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
              {reunioes.length} Reunião(ões) futura(s)
            </span>
          </div>

          {reunioes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Calendar className="h-10 w-10 text-slate-650" />
              <p className="text-sm text-slate-400 font-medium">Nenhum compromisso agendado para o futuro.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-900/40 overflow-y-auto max-h-[550px]">
              {reunioes.map((reuniao) => (
                <div key={reuniao.id} className="p-6 hover:bg-slate-900/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
                        ENCONTRO #{reuniao.numeroEncontro}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Orientando: {reuniao.projeto.orientando.nome}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-200">{reuniao.projeto.titulo}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-450" />
                      {new Date(reuniao.dataHoraInicio).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} às {new Date(reuniao.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {reuniao.linkVideoconferencia && (
                    <a
                      href={reuniao.linkVideoconferencia}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-350 border border-slate-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Video className="h-4 w-4" />
                      Entrar no Meet
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
