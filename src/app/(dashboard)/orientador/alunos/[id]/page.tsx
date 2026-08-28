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
  BookOpen,
  Trophy,
  Activity,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  criarMarcoPersonalizado, 
  alternarMarcoStatus, 
  deletarMarco, 
  editarProjeto, 
  agendarReuniao, 
  reagendarReuniao, 
  agendarReuniaoLivre,
  decidirStageGate
} from '@/app/actions';
import { CountdownTimer } from '@/components/countdown-timer';
import { FormDecisaoGate } from '@/components/form-decisao-gate';

interface AlunoPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalhesAlunoPage({ params }: AlunoPageProps) {
  const session = await getServerSession(authOptions);
  const { id: alunoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN) {
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
      secoesTexto: {
        orderBy: { ordem: 'asc' }
      }
    },
  });

  if (!projeto) {
    redirect('/orientador');
  }

  // Buscar as etapas do projeto do aluno instanciadas
  const etapasProjeto = await prisma.etapaProjeto.findMany({
    where: { projetoId: projeto.id },
    include: {
      secoes: {
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { ordem: 'asc' }
  });

  const hoje = new Date();

  // Calcular Risco de atraso do projeto
  const marcosAtrasados = projeto.marcos.filter(m => m.status !== StatusMarco.CONCLUIDO && new Date(m.dataPrevista) < hoje);
  const nivelRisco = marcosAtrasados.length > 0 ? 'ALTO' : 'BAIXO';

  // Calcular prontidão para defesa (% de seções obrigatórias aprovadas)
  const secoesObrigatorias = projeto.secoesTexto.filter(s => s.obrigatoria);
  const secoesAprovadas = secoesObrigatorias.filter(s => s.status === 'APROVADO');
  const prontidaoDefesa = secoesObrigatorias.length > 0 
    ? Math.round((secoesAprovadas.length / secoesObrigatorias.length) * 100)
    : 0;

  // Buscar disponibilidades do orientador logado para agendamentos
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

      {/* Identificação Principal do Aluno / Eixo Duplo */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-slate-900/60 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">{aluno.nome}</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md">
              {projeto.modalidade}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
              {projeto.tipoProduto}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono italic">
            Projeto: &ldquo;{projeto.titulo}&rdquo;
          </p>
        </div>

        {/* Métricas e Prontidão */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="glass px-4 py-2.5 rounded-xl border border-slate-900 flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-blue-400" />
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Risco de Atraso</span>
              <span className={`text-xs font-bold ${nivelRisco === 'ALTO' ? 'text-amber-400' : 'text-emerald-400'}`}>{nivelRisco}</span>
            </div>
          </div>

          <div className="glass px-4 py-2.5 rounded-xl border border-slate-900 flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-indigo-400" />
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold">Prontidão para Defesa</span>
              <span className="text-xs font-bold text-slate-200">{prontidaoDefesa}% aprovado</span>
            </div>
          </div>

          {projeto.prazoDefesa && (
            <CountdownTimer prazoDefesa={projeto.prazoDefesa} />
          )}

          <div className="flex gap-2">
            <Link
              href={`/orientador/alunos/${alunoId}/biblioteca`}
              className="py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-indigo-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Biblioteca
            </Link>

            <Link
              href={`/orientador/alunos/${alunoId}/redacao`}
              className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Revisar Capítulos
            </Link>
          </div>
        </div>
      </div>

      {projeto.etapaAtual === 'E0_ACOLHIMENTO' ? (
        <div className="glass p-12 text-center rounded-3xl border border-slate-900/60 max-w-xl mx-auto space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-200 text-lg">Aguardando Onboarding</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O aluno orientando ainda não completou a **Ficha Inicial de Onboarding** (Etapa E0). 
              Assim que o estudante preencher a ficha e o texto de diagnóstico, a trilha científica do modelo acadêmico correspondente será instanciada e liberada automaticamente para você.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline de Etapas e Seções (Esquerda) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-slate-200">Trilha Metodológica do Modelo</h2>

            <div className="space-y-4">
              {etapasProjeto.map((e) => {
                const isAprovado = e.statusGate === 'APROVADO';
                const isLiberado = e.statusGate === 'LIBERADO';
                const isBloqueado = e.statusGate === 'BLOQUEADO';

                // Verificar se todas as seções obrigatórias estão aprovadas
                const secoesEtapa = e.secoes;
                const obrigatorias = secoesEtapa.filter(s => s.obrigatoria);
                const aprovadas = obrigatorias.filter(s => s.status === 'APROVADO');
                const gatePronto = obrigatorias.length > 0 && aprovadas.length === obrigatorias.length;

                return (
                  <div 
                    key={e.id} 
                    className={`glass p-5 rounded-2xl border transition-all duration-300 ${
                      isAprovado 
                        ? 'border-emerald-500/20 bg-emerald-950/5' 
                        : isLiberado 
                        ? 'border-indigo-500/20 bg-indigo-950/5'
                        : 'border-slate-900/40 opacity-50'
                    }`}
                  >
                    {/* Cabeçalho da Etapa */}
                    <div className="flex items-center justify-between gap-4 border-b border-slate-900/60 pb-3 mb-4">
                      <div>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded uppercase tracking-wider">
                          {e.etapa}
                        </span>
                        <h3 className="font-bold text-slate-200 text-sm mt-1">{e.titulo}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {isAprovado && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                            Gate Aprovado
                          </span>
                        )}
                        {isLiberado && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                            Em Desenvolvimento
                          </span>
                        )}
                        {isBloqueado && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lista de Seções da Etapa */}
                    <div className="space-y-3.5">
                      {e.secoes.map((secao) => (
                        <div key={secao.id} className="flex items-center justify-between gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-300">
                              {secao.titulo} {secao.obrigatoria ? '*' : ''}
                            </span>
                            {secao.criteriosAceite && (
                              <p className="text-[10px] text-slate-500 leading-normal max-w-md">{secao.criteriosAceite}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {secao.status === 'APROVADO' && (
                              <span className="text-[10px] text-emerald-400 font-bold">Aprovado</span>
                            )}
                            {secao.status === 'REVISAR' && (
                              <span className="text-[10px] text-red-400 font-bold">Revisar</span>
                            )}
                            {secao.status === 'PENDENTE' && (
                              <span className="text-[10px] text-amber-400 font-bold animate-pulse">Revisão Pendente</span>
                            )}

                            <Link 
                              href={`/orientador/alunos/${alunoId}/redacao`} 
                              className="text-[10px] text-indigo-400 hover:underline font-bold"
                            >
                              Revisar
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ação de Decisão do Gate (apenas se liberado e não aprovado ainda) */}
                    {isLiberado && !isAprovado && (
                      <div className="mt-5 pt-4 border-t border-slate-900/60 space-y-3">
                        <div className="flex items-start gap-2.5 p-3 bg-indigo-950/15 border border-indigo-900/20 rounded-xl text-[10px] text-slate-400 leading-normal">
                          <HelpCircle className="h-4 w-4 shrink-0 text-indigo-400" />
                          <p>
                            Para vencer o gate científico e avançar para a próxima fase, certifique-se de que todas as seções obrigatórias (*) estão avaliadas com status Aprovado e nota da Rubrica superior a 2.
                          </p>
                        </div>

                        <FormDecisaoGate etapaProjetoId={e.id} desabilitado={!gatePronto} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel do Escopo e Resumo do Plano (Direita) */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-slate-200">Resumo do Plano (Ficha)</h2>

            <div className="glass p-5 rounded-2xl border border-slate-900/60 space-y-4 text-xs leading-relaxed">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Tema do Trabalho</span>
                <p className="text-slate-350 mt-0.5">{projeto.temaFrase || 'A definir'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Problema Científico</span>
                <p className="text-slate-350 mt-0.5">{projeto.problemaPercebido || 'A definir'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Pergunta Central</span>
                <p className="text-slate-350 mt-0.5">{projeto.perguntaPesquisa || 'A definir'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Objetivo Geral</span>
                <p className="text-slate-350 mt-0.5">{projeto.objetivoGeral || 'A definir'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Público ou Contexto</span>
                <p className="text-slate-350 mt-0.5">{projeto.publicoContexto || 'A definir'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Acesso a Campo & Dados</span>
                <p className="text-slate-350 mt-0.5">{projeto.acessoCampo || 'A confirmar'}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-900/60">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Normas de Defesa</span>
                <p className="text-slate-350 mt-0.5 truncate">{projeto.normasEntrega || 'Regulamento ABNT geral'}</p>
              </div>
            </div>

            {/* Agendamentos Rápidos de Reunião */}
            <div className="glass p-5 rounded-2xl border border-slate-900/60 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm">Próximos Encontros</h3>
              
              <form action={agendarReuniaoLivre.bind(null, projeto.id)} className="space-y-3">
                <input type="hidden" name="projetoId" value={projeto.id} />
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Escolha um horário vago:</label>
                  <select 
                    name="slotId" 
                    required 
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                  >
                    <option value="">Selecione...</option>
                    {slotsCombinados.map(slot => (
                      <option key={slot.id} value={`${slot.dataIso}_${slot.slotId}`}>{slot.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Pauta / Objetivo:</label>
                  <input 
                    type="text" 
                    name="objetivo"
                    required
                    placeholder="ex: Discussão do referencial teórico"
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Agendar Orientação
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
