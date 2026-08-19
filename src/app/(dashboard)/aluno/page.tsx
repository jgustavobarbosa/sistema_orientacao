'use client';

import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StatusProjeto } from '@prisma/client';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle2, 
  Cpu,
  BookOpen
} from 'lucide-react';
import { alternarTarefa, alternarMarcoStatus } from '@/app/actions';
import { CountdownTimer } from '@/components/countdown-timer';
import { FormOnboardingFichaInicial } from '@/components/form-onboarding-ficha-inicial';

function AlunoDashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();

  const [projeto, setProjeto] = React.useState<any>(null);
  const [tarefas, setTarefas] = React.useState<any[]>([]);
  const [orientadores, setOrientadores] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Estados de formulário de proposta de projeto
  const [titulo, setTitulo] = React.useState('');
  const [descricao, setDescricao] = React.useState('');
  const [nivel, setNivel] = React.useState('TCC');
  const [orientadorId, setOrientadorId] = React.useState('');
  const [loadingProposta, setLoadingProposta] = React.useState(false);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/aluno/dashboard-data');
      const data = await res.json();
      if (data.projeto) {
        setProjeto(data.projeto);
        setTarefas(data.tarefas);
      } else {
        setOrientadores(data.orientadores || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmeterProposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !orientadorId) return;
    setLoadingProposta(true);
    try {
      const res = await fetch('/api/aluno/submeter-proposta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descricao, nivel, orientadorId }),
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProposta(false);
    }
  };

  const handleToggleMarco = async (marcoId: string, atualStatus: string) => {
    const novoStatus = atualStatus === 'CONCLUIDO' ? 'A_FAZER' : 'CONCLUIDO';
    // Otimista
    setProjeto((prev: any) => {
      const novosMarcos = prev.marcos.map((m: any) => 
        m.id === marcoId ? { ...m, status: novoStatus, dataConclusao: novoStatus === 'CONCLUIDO' ? new Date().toISOString() : null } : m
      );
      return { ...prev, marcos: novosMarcos };
    });
    try {
      await alternarMarcoStatus(marcoId, session?.user?.id || '', atualStatus);
    } catch (err) {
      // Reverter
      fetchDashboardData();
    }
  };

  const handleToggleTarefa = async (tarefaId: string, concluida: boolean) => {
    // Otimista
    setTarefas((prev) => 
      prev.map((t) => t.id === tarefaId ? { ...t, concluida: !concluida } : t)
    );
    try {
      await alternarTarefa(tarefaId, concluida);
    } catch (err) {
      // Reverter
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Carregando portal acadêmico...
      </div>
    );
  }

  // 1. Caso não tenha projeto cadastrado nem proposta sob análise
  if (!projeto) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-left">
        <div className="glass p-8 rounded-3xl border border-slate-900/60 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Cadastrar Proposta de Orientação</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Inicie sua jornada no SOIA submetendo seu projeto de pesquisa para análise e aceite de um dos orientadores disponíveis.
            </p>
          </div>

          <form onSubmit={handleSubmeterProposta} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Trabalho</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="ex: Desenvolvimento de rede neural convolucional para triagem de patologias"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resumo do Projeto / Escopo</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva brevemente o tema, hipóteses e objetivos da pesquisa..."
                rows={4}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nível de Pesquisa</label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
                >
                  <option value="TCC">Trabalho de Conclusão (TCC)</option>
                  <option value="MESTRADO">Dissertação de Mestrado</option>
                  <option value="DOUTORADO">Tese de Doutorado</option>
                  <option value="INICIACAO_CIENTIFICA">Iniciação Científica (IC)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orientador Escolhido</label>
                <select
                  required
                  value={orientadorId}
                  onChange={(e) => setOrientadorId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
                >
                  <option value="">Selecione o professor...</option>
                  {orientadores.map((o) => (
                    <option key={o.id} value={o.id}>{o.nome} ({o.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingProposta || !titulo || !orientadorId}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-blue-600/10 cursor-pointer disabled:opacity-40"
            >
              {loadingProposta ? 'Submetendo proposta...' : 'Submeter Proposta de Orientação'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Proposta pendente de validação
  if (projeto.status === StatusProjeto.PROPOSTA) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center glass rounded-3xl border border-slate-900/60 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
        <Clock className="h-12 w-12 text-blue-400 animate-pulse" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-200">Proposta sob Análise</h2>
          <p className="text-sm text-slate-400">
            Você propôs o projeto de pesquisa &ldquo;<strong>{projeto.titulo}</strong>&rdquo;.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            A proposta foi encaminhada com sucesso para o orientador <strong>{projeto.orientador.nome}</strong>. Aguarde a validação do professor para iniciar seu cronograma acadêmico.
          </p>
        </div>
      </div>
    );
  }

  // 3. Caso o projeto esteja na etapa inicial E0_ACOLHIMENTO e precise preencher a Ficha Inicial de Onboarding
  if (projeto.etapaAtual === 'E0_ACOLHIMENTO') {
    return (
      <FormOnboardingFichaInicial projeto={projeto} onComplete={fetchDashboardData} />
    );
  }

  // 4. Projeto Ativo: Renderizar Dashboard Preditivo & Estrutural Completo
  const hoje = new Date();

  // Mapeamento dos Pilares Estruturais da conformidade ABNT / Acadêmica
  const pilaresEstruturais = [
    { key: 'introducao', label: 'Introdução', keywords: ['introdução', 'introducao', 'intro'] },
    { key: 'justificativa', label: 'Justificativa', keywords: ['justificativa'] },
    { key: 'objetivos', label: 'Objetivos', keywords: ['objetivo', 'objetivos'] },
    { key: 'hipoteses', label: 'Hipóteses', keywords: ['hipótese', 'hipóteses', 'hipotese', 'hipoteses'] },
    { key: 'pergunta', label: 'Pergunta de Pesquisa', keywords: ['pergunta', 'problema', 'questão'] },
    { key: 'desenvolvimento', label: 'Desenvolvimento / Teoria', keywords: ['desenvolvimento', 'teoria', 'referencial', 'fundamentação', 'revisão', 'capitulo', 'capítulo'] },
    { key: 'metodologia', label: 'Metodologia', keywords: ['metodologia', 'método', 'metodo'] },
    { key: 'conclusao', label: 'Considerações Finais', keywords: ['conclusão', 'considerações', 'conclusao', 'consideracoes'] },
    { key: 'referencias', label: 'Referências', keywords: ['referências', 'referencias', 'bibliografia'] },
  ];

  const pilaresStatus = pilaresEstruturais.map(pilar => {
    const secoes = projeto.secoesTexto || [];
    const secaoCorrespondente = secoes.find((secao: any) => 
      pilar.keywords.some(keyword => secao.titulo.toLowerCase().includes(keyword))
    );

    let status: 'PENDENTE' | 'EM_REVISAO' | 'CONCLUIDO' = 'PENDENTE';
    if (secaoCorrespondente) {
      status = secaoCorrespondente.status === 'APROVADO' ? 'CONCLUIDO' : 'EM_REVISAO';
    }

    return {
      ...pilar,
      status,
      secaoId: secaoCorrespondente?.id || null
    };
  });

  // Próximo marco pendente
  const proximoMarco = projeto.marcos.find((m: any) => m.status === 'A_FAZER');
  const diasRestantesProximoMarco = proximoMarco
    ? Math.max(0, Math.ceil((new Date(proximoMarco.dataPrevista).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Estatísticas de predição acadêmica
  const primeiroPendente = pilaresStatus.find(p => p.status === 'PENDENTE');
  let focoEstudoIA = '';
  let dicaPredicaoIA = '';

  if (primeiroPendente) {
    if (primeiroPendente.key === 'introducao') {
      focoEstudoIA = 'Defina o tema geral e o contexto do seu trabalho. A introdução deve guiar o leitor sobre a relevância do seu tema.';
      dicaPredicaoIA = `Se você escrever 150 palavras por dia, fechará o rascunho completo de sua Introdução em apenas 7 dias, adiantando em ${Math.max(1, diasRestantesProximoMarco - 7)} dias seu próximo marco.`;
    } else if (primeiroPendente.key === 'justificativa') {
      focoEstudoIA = 'Foque no "porquê". Mostre a importância acadêmica, social e prática da sua pesquisa.';
      dicaPredicaoIA = `Escrevendo 200 palavras por dia nos próximos 5 dias você terá a Justificativa validada bem antes da sua entrega agendada.`;
    } else if (primeiroPendente.key === 'objetivos') {
      focoEstudoIA = 'Escreva 1 objetivo geral (verbo no infinitivo) e 3 objetivos específicos (etapas metodológicas).';
      dicaPredicaoIA = `Mapeie os objetivos hoje em apenas 30 minutos na aba Redação para manter seu planejamento acadêmico perfeitamente em dia.`;
    } else if (primeiroPendente.key === 'hipoteses') {
      focoEstudoIA = 'Esboce respostas provisórias para a sua pergunta de pesquisa. O que você espera obter como resultado?';
      dicaPredicaoIA = `Escrever 2 hipóteses claras levará menos de 1 hora e estruturará a etapa teórica do seu projeto.`;
    } else if (primeiroPendente.key === 'pergunta') {
      focoEstudoIA = 'Elabore a pergunta central da pesquisa. Ela deve ser delimitada, clara e viável de ser respondida.';
      dicaPredicaoIA = `Alinhe o problema de pesquisa com seu orientador na próxima reunião para economizar dias de reescrita.`;
    } else if (primeiroPendente.key === 'desenvolvimento') {
      focoEstudoIA = 'Foque no referencial teórico. Conecte autores clássicos e recentes que dão base ao seu trabalho.';
      dicaPredicaoIA = `Escrevendo 300 palavras por dia (cerca de 1 página), você conclui o Desenvolvimento teórico em 10 dias, sobrando tempo para revisões.`;
    } else if (primeiroPendente.key === 'metodologia') {
      focoEstudoIA = 'Descreva a abordagem (quali/quanti), instrumentos de coleta de dados e método de análise.';
      dicaPredicaoIA = `Escrever 250 palavras por dia permitirá entregar a Metodologia completa em 10 dias de forma extremamente robusta.`;
    } else if (primeiroPendente.key === 'conclusao') {
      focoEstudoIA = 'Retome seus objetivos, discuta as respostas para a pergunta de pesquisa, limitações e propostas futuras.';
      dicaPredicaoIA = `Escrever 300 palavras por dia permitirá concluir suas Considerações Finais antes do prazo de entrega final.`;
    } else if (primeiroPendente.key === 'referencias') {
      focoEstudoIA = 'Organize todas as fontes citadas no texto seguindo as normas da ABNT ou estilo exigido.';
      dicaPredicaoIA = `Verifique se todos os autores citados constam na lista de referências para evitar correções de banca.`;
    }
  } else {
    focoEstudoIA = 'Parabéns! Todos os pilares estruturais canônicos possuem trechos enviados. Refine a escrita com o orientador.';
    dicaPredicaoIA = 'Continue revisando os pareceres e os laudos de IA para otimizar o texto final do seu trabalho.';
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md uppercase tracking-wider">
            {projeto.nivel} — {projeto.programa || 'Portal do Orientando'}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">{projeto.titulo}</h1>
          <p className="text-slate-400 mt-1">
            Orientador: <span className="font-semibold text-slate-350">{projeto.orientador.nome}</span>
          </p>
        </div>

        {projeto.prazoDefesa && (
          <CountdownTimer prazoDefesa={projeto.prazoDefesa} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Estatísticas de conformidade e Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PAINEL DINÂMICO DE AÇÕES E CRONOGRAMA DE METAS */}
          {(() => {
            const secoesParaCorrigir = projeto.secoesTexto?.filter((s: any) => s.status === 'REVISAR') || [];
            const secoesAguardandoFeedback = projeto.secoesTexto?.filter((s: any) => s.status === 'PENDENTE' && s.conteudo.trim() !== '') || [];
            
            const etapaAtiva = projeto.etapasProjeto?.find((e: any) => e.statusGate === 'LIBERADO');
            let aguardandoGate = false;
            if (etapaAtiva) {
              const secoesObrigatoriasEtapa = projeto.secoesTexto?.filter((s: any) => s.etapaProjetoId === etapaAtiva.id && s.obrigatoria) || [];
              const aprovadas = secoesObrigatoriasEtapa.filter((s: any) => s.status === 'APROVADO');
              aguardandoGate = secoesObrigatoriasEtapa.length > 0 && aprovadas.length === secoesObrigatoriasEtapa.length;
            }

            // Mapear cronograma sugerido baseado no prazo de defesa
            const dataDefesa = projeto.prazoDefesa ? new Date(projeto.prazoDefesa) : null;
            const diasAteDefesa = dataDefesa ? Math.max(1, Math.ceil((dataDefesa.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))) : 0;
            
            const etapasRestantes = projeto.etapasProjeto?.filter((e: any) => e.statusGate !== 'APROVADO') || [];
            const cronogramaRecomendado: { titulo: string; prazoEstimado: string }[] = [];
            
            if (diasAteDefesa > 0 && etapasRestantes.length > 0) {
              const diasPorEtapa = Math.floor(diasAteDefesa / etapasRestantes.length);
              etapasRestantes.forEach((e: any, idx: number) => {
                const dataPrazo = new Date();
                dataPrazo.setDate(hoje.getDate() + (diasPorEtapa * (idx + 1)));
                cronogramaRecomendado.push({
                  titulo: e.titulo,
                  prazoEstimado: dataPrazo.toLocaleDateString('pt-BR')
                });
              });
            }

            return (
              <div className="space-y-4">
                {/* 🎯 Card de Próximas Ações Acadêmicas */}
                <div className="glass p-5 rounded-2xl border border-slate-900/60 bg-gradient-to-r from-slate-950 via-slate-900/10 to-slate-950 space-y-4">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    Diretrizes de Ação & Foco Atual
                  </h3>

                  {secoesParaCorrigir.length > 0 ? (
                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl space-y-1">
                      <p className="font-bold">⚠️ Ação Requerida (Ajustes do Professor):</p>
                      <p className="text-[11px] text-slate-350 leading-relaxed">
                        O orientador solicitou correções em {secoesParaCorrigir.length} capítulo(s): 
                        <strong> {secoesParaCorrigir.map((s: any) => s.titulo).join(', ')}</strong>.
                        Acesse a aba **Redação de Capítulos** para visualizar as pendências granulares e ajustar o texto.
                      </p>
                    </div>
                  ) : secoesAguardandoFeedback.length > 0 ? (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs rounded-xl space-y-1">
                      <p className="font-bold">⏳ Aguardando Avaliação:</p>
                      <p className="text-[11px] text-slate-350 leading-relaxed">
                        Seu capítulo <strong>"{secoesAguardandoFeedback[0].titulo}"</strong> foi enviado e está sendo avaliado pelo professor. 
                        Aproveite para revisar fontes teóricas ou preparar as próximas seções.
                      </p>
                    </div>
                  ) : aguardandoGate ? (
                    <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs rounded-xl space-y-1 animate-pulse">
                      <p className="font-bold">🚪 Aguardando Liberação de Gate:</p>
                      <p className="text-[11px] text-slate-350 leading-relaxed">
                        Excelente! Você concluiu todas as seções obrigatórias da etapa **{etapaAtiva?.titulo}**. 
                        O professor precisa fechar o gate científico desta etapa para liberar as próximas diretrizes.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-xl space-y-1">
                      <p className="font-bold">📝 Próxima Entrega Científica:</p>
                      <p className="text-[11px] text-slate-350 leading-relaxed">
                        Seu foco atual é a etapa **{etapaAtiva?.titulo || 'Delimitação'}**. 
                        Inicie a redação e envie as seções obrigatórias pendentes desta fase para avaliação.
                      </p>
                    </div>
                  )}
                </div>

                {/* 📅 Cronograma Sugerido baseado na Defesa */}
                {cronogramaRecomendado.length > 0 && (
                  <div className="glass p-5 rounded-2xl border border-slate-900/60 space-y-3.5">
                    <h3 className="font-bold text-slate-200 text-xs tracking-wide uppercase text-slate-400">
                      Cronograma Recomendado de Metas
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {cronogramaRecomendado.slice(0, 4).map((c, i) => (
                        <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl space-y-1 text-center">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase truncate">{c.titulo}</span>
                          <span className="text-xs font-bold text-slate-250 block">{c.prazoEstimado}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Caixa de Predição & Plano de Estudos por IA */}
          <div className="glass p-6 rounded-2xl border border-blue-500/15 bg-gradient-to-br from-slate-950 via-blue-950/5 to-slate-950 space-y-5 shadow-lg shadow-blue-500/5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md">
                <Cpu className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-lg font-bold text-slate-200">Plano de Estudos & Predição Pessoal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Foco de Escrita Recomendado</h4>
                <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                  {primeiroPendente ? `Próximo Pilar: ${primeiroPendente.label}` : 'Revisão e Ajustes Finais'}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {focoEstudoIA}
                </p>
              </div>

              <div className="space-y-2 bg-slate-900/35 border border-slate-900/50 p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Predição de Ritmo de Escrita</h4>
                <p className="text-xs text-slate-350 leading-relaxed">
                  {dicaPredicaoIA}
                </p>
                <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-900/40 pt-2 flex justify-between">
                  <span>Próximo marco:</span>
                  <span className="font-semibold text-slate-400">{diasRestantesProximoMarco} dias restantes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estrutura Canônica (Conformidade com os Goals Acadêmicos) */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-200">Estrutura Canônica do Trabalho</h2>
              <p className="text-xs text-slate-450 mt-1 leading-normal">
                Verificação de conformidade acadêmica com base nas seções de texto submetidas para avaliação.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {pilaresStatus.map((pilar) => (
                <div 
                  key={pilar.key} 
                  className={`p-3 border rounded-xl flex items-center justify-between transition-all duration-200 ${
                    pilar.status === 'CONCLUIDO'
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-300'
                      : pilar.status === 'EM_REVISAO'
                      ? 'bg-amber-500/5 border-amber-500/10 text-slate-300'
                      : 'bg-slate-900/20 border-slate-900/60 text-slate-500'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{pilar.label}</span>
                  
                  {pilar.status === 'CONCLUIDO' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                      Concluído
                    </span>
                  )}
                  {pilar.status === 'EM_REVISAO' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
                      Em Revisão
                    </span>
                  )}
                  {pilar.status === 'PENDENTE' && (
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-md">
                      Pendente
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline de Marcos */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-200">Timeline de Marcos</h2>
            <div className="glass p-6 rounded-2xl border border-slate-900/60 relative space-y-6">
              {projeto.marcos.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhum marco definido para este projeto.</p>
              ) : (
                <div className="relative border-l border-slate-800 ml-4 space-y-8">
                  {projeto.marcos.map((marco: any) => {
                    const dataPrevista = new Date(marco.dataPrevista);
                    const isAtrasado = marco.status !== 'CONCLUIDO' && dataPrevista < hoje;
                    const isConcluido = marco.status === 'CONCLUIDO';

                    return (
                      <div key={marco.id} className="relative pl-8 group">
                        {/* Ponto na timeline */}
                        <span className={`absolute left-0 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border-4 ${
                          isConcluido
                            ? 'bg-emerald-500 border-slate-950'
                            : isAtrasado
                            ? 'bg-amber-500 border-slate-950'
                            : 'bg-slate-700 border-slate-950'
                        }`} />

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h3 className={`font-bold text-sm ${isConcluido ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                              {marco.titulo}
                            </h3>
                            {marco.descricao && (
                              <p className="text-xs text-slate-450">{marco.descricao}</p>
                            )}
                            <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-650" />
                                Prazo: {dataPrevista.toLocaleDateString('pt-BR')}
                              </span>
                              {isAtrasado && (
                                <span className="flex items-center gap-1 text-amber-500 font-semibold animate-pulse">
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
                          <button
                            onClick={() => handleToggleMarco(marco.id, marco.status)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isConcluido
                                ? 'bg-slate-900 text-slate-500 border-slate-850 hover:bg-slate-850'
                                : 'bg-blue-600/10 hover:bg-blue-600/25 text-blue-450 border-blue-500/20 shadow-sm'
                            }`}
                          >
                            {isConcluido ? 'Reabrir Marco' : 'Concluir'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Coluna Direita: Minhas Atividades / Plano de Trabalho das Reuniões */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-bold text-slate-200">Plano de Trabalho</h2>

          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Compromissos Acadêmicos</span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400 font-semibold">
                {tarefas.filter((t) => !t.concluida).length} pendentes
              </span>
            </div>

            {tarefas.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-xs leading-relaxed">
                Nenhum compromisso ou encaminhamento de reunião pendente.
              </div>
            ) : (
              <div className="space-y-3.5">
                {tarefas.map((tarefa) => (
                  <div key={tarefa.id} className="flex items-start gap-3 p-3 bg-slate-900/30 border border-slate-900/40 rounded-xl hover:border-slate-800 transition-colors">
                    <button 
                      onClick={() => handleToggleTarefa(tarefa.id, tarefa.concluida)}
                      className="text-slate-500 hover:text-blue-450 transition-colors mt-0.5 cursor-pointer"
                    >
                      {tarefa.concluida ? (
                        <CheckSquare className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <p className={`text-xs font-semibold text-slate-250 leading-relaxed ${tarefa.concluida ? 'line-through text-slate-550' : ''}`}>
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

export default function AlunoDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Carregando portal acadêmico...
      </div>
    }>
      <AlunoDashboardContent />
    </Suspense>
  );
}
