import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario, NivelProjeto, StatusProjeto } from '@prisma/client';
import { 
  Users, 
  FileText, 
  FolderPlus, 
  ArrowUpRight, 
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { criarProjeto, aprovarProjeto } from '@/app/actions';

export default async function OrientadorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN) {
    redirect('/login');
  }

  // Seeder automático do Catálogo de Modelos do SOIA
  const { seedCatalog } = await import('@/lib/seed-catalog');
  await seedCatalog();

  // Obter orientador do BD
  const orientadorDb = await prisma.usuario.findUnique({
    where: { email: session.user.email!.toLowerCase() },
  });

  if (!orientadorDb) {
    redirect('/login?error=ErroInterno');
  }

  // 1. Estatísticas de Projetos
  const totalAlunos = await prisma.usuario.count({
    where: { papel: PapelUsuario.ORIENTANDO },
  });

  const totalProjetos = await prisma.projetoOrientacao.count({
    where: { 
      orientadorId: orientadorDb.id,
      status: { not: StatusProjeto.PROPOSTA }
    },
  });

  // Projetos com marcos atrasados (estimativa simples para o semáforo)
  const hoje = new Date();
  const projetosComAtraso = await prisma.projetoOrientacao.findMany({
    where: {
      orientadorId: orientadorDb.id,
      status: { not: StatusProjeto.PROPOSTA },
      marcos: {
        some: {
          status: 'A_FAZER',
          dataPrevista: { lt: hoje },
        },
      },
    },
    select: { id: true },
  });

  const countAtrasados = projetosComAtraso.length;
  const countEmAndamento = Math.max(0, totalProjetos - countAtrasados);

  // 2. Buscar todos os projetos vinculados a este orientador
  const projetos = await prisma.projetoOrientacao.findMany({
    where: { orientadorId: orientadorDb.id },
    include: {
      orientando: true,
      marcos: {
        orderBy: { dataPrevista: 'asc' },
      },
      reunioes: {
        orderBy: { dataHoraInicio: 'desc' },
      },
      secoesTexto: {
        include: {
          auditoriasIA: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      },
      etapasProjeto: {
        orderBy: { ordem: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Separar projetos em ativos e propostas pendentes
  const projetosAtivos = projetos.filter(p => p.status !== StatusProjeto.PROPOSTA);
  const propostasPendentes = projetos.filter(p => p.status === StatusProjeto.PROPOSTA);

  // 3. Buscar alunos ativos para o select (somente alunos ativos e que NÃO têm projeto/proposta cadastrados ainda!)
  const todosAlunosProjetos = await prisma.projetoOrientacao.findMany({
    select: { orientandoId: true }
  });
  const alunosComProjetoIds = todosAlunosProjetos.map(p => p.orientandoId);

  const alunosDisponiveis = await prisma.usuario.findMany({
    where: {
      papel: PapelUsuario.ORIENTANDO,
      ativo: true,
      id: { notIn: alunosComProjetoIds }
    },
    orderBy: { nome: 'asc' },
  });

  // 4. Estatísticas de Mapeamento de Atividades e Redação para Dashboard Geral style Northstar
  const totalSecoes = projetosAtivos.reduce((acc, p) => acc + p.secoesTexto.length, 0);
  const secoesAprovadas = projetosAtivos.reduce((acc, p) => acc + p.secoesTexto.filter(s => s.status === 'APROVADO').length, 0);
  const secoesPendenteRevisao = projetosAtivos.reduce((acc, p) => acc + p.secoesTexto.filter(s => s.status === 'PENDENTE').length, 0);

  const secoesComAuditoria = projetosAtivos.flatMap(p =>
    p.secoesTexto
      .filter(s => s.auditoriasIA.length > 0 && s.conteudo.trim().length > 0)
      .map(s => ({
        auditoria: s.auditoriasIA[0],
        pesoTexto: s.conteudo.trim().length,
      }))
  );

  const auditoriasValidas = secoesComAuditoria.filter(
    a => a.auditoria.pontuacao !== 50 && a.auditoria.pontuacao > 0
  );

  const pesoTotal = auditoriasValidas.reduce((acc, a) => acc + a.pesoTexto, 0);
  const scoreIAMedio = pesoTotal > 0
    ? Math.round(
        auditoriasValidas.reduce((acc, a) => acc + (a.auditoria.pontuacao * a.pesoTexto), 0) / pesoTotal
      )
    : 0;

  const marcadoresIA = auditoriasValidas
    .filter(a => a.auditoria.pontuacao >= 60)
    .slice(0, 3)
    .map(a => ({
      justificativa: a.auditoria.justificativa,
      pontuacao: a.auditoria.pontuacao,
      pesoTexto: a.pesoTexto,
    }));

  const todosMarcos = projetosAtivos.flatMap(p => p.marcos);
  const totalMarcos = todosMarcos.length;
  const marcosConcluidos = todosMarcos.filter(m => m.status === 'CONCLUIDO').length;
  const marcosAtrasados = todosMarcos.filter(m => m.status === 'A_FAZER' && new Date(m.dataPrevista) < hoje).length;
  const marcosEmDia = totalMarcos - marcosAtrasados;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Painel de Orientação</h1>
          <p className="text-slate-400 mt-1">
            Métricas ativas de progresso, marcos de projetos, escrita por IA e revisões de orientandos.
          </p>
        </div>
      </div>

      {/* Dashboard de Estatísticas Ativas Gerais */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* KPI 1: Alunos e Saúde */}
        <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md uppercase tracking-wider">
            Orientandos
          </span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-4xl font-extrabold text-slate-100">{projetosAtivos.length}</h3>
            <p className="text-xs text-slate-500 font-semibold">alunos ativos</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-900/40">
            <div className="flex justify-between text-xs">
              <span className="text-slate-450">Em dia:</span>
              <span className="font-semibold text-emerald-450">{countEmAndamento}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-450">Com atraso:</span>
              <span className="font-semibold text-red-450">{countAtrasados}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Progresso Geral de Marcos */}
        <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md uppercase tracking-wider">
            Progresso Geral
          </span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-4xl font-extrabold text-slate-100">
              {totalMarcos > 0 ? Math.round((marcosConcluidos / totalMarcos) * 100) : 0}%
            </h3>
            <p className="text-xs text-slate-500 font-semibold">marcos concluídos</p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-900/40">
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${totalMarcos > 0 ? (marcosConcluidos / totalMarcos) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>{marcosConcluidos} concluídos</span>
              <span>{totalMarcos} no total</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Capítulos & Seções */}
        <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md uppercase tracking-wider">
            Capítulos & Seções
          </span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-4xl font-extrabold text-slate-100">{totalSecoes}</h3>
            <p className="text-xs text-slate-500 font-semibold">seções escritas</p>
          </div>
          <div className="space-y-1.5 pt-2 border-t border-slate-900/40">
            <div className="flex justify-between text-xs">
              <span className="text-slate-450">Aprovados:</span>
              <span className="font-semibold text-slate-200">{secoesAprovadas}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-450">Pendentes:</span>
              <span className="font-semibold text-amber-450">{secoesPendenteRevisao}</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Auditoria IA */}
        <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md uppercase tracking-wider">
            Escrita por IA
          </span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-4xl font-extrabold text-slate-100">{scoreIAMedio}%</h3>
            <p className="text-xs text-slate-500 font-semibold">score médio de IA</p>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-900/40">
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  scoreIAMedio >= 60 ? 'bg-red-500' : scoreIAMedio >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${scoreIAMedio}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>{auditoriasValidas.length} textos auditados</span>
              <span className={scoreIAMedio >= 50 ? 'text-amber-450' : 'text-emerald-450'}>
                {scoreIAMedio >= 50 ? 'Alerta IA' : scoreIAMedio > 0 ? 'Saudável' : 'Sem dados'}
              </span>
            </div>
          </div>

          {/* Marcadores de detecção de IA */}
          {marcadoresIA.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-slate-900/40">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Indícios detectados:</p>
              {marcadoresIA.map((m, i) => (
                <div key={i} className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg space-y-1">
                  <div className="flex justify-between text-[9px]">
                    <span className="font-bold text-red-400">Score: {m.pontuacao}/100</span>
                    <span className="text-slate-500">Texto: {m.pesoTexto} caracteres</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed line-clamp-2">{m.justificativa}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Propostas Pendentes de Alunos */}
      {propostasPendentes.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/5 to-slate-950 space-y-4 shadow-lg shadow-indigo-500/5">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-200">Propostas de Orientação Recebidas ({propostasPendentes.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propostasPendentes.map((prop) => (
              <div key={prop.id} className="p-4 bg-slate-900/35 border border-slate-900/60 rounded-xl flex flex-col justify-between gap-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-md">
                      {prop.nivel} | {prop.programa || 'Geral'}
                    </span>
                    <span className="text-xs text-slate-350 font-semibold">{prop.orientando.nome}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{prop.titulo}</h4>
                  {prop.perguntaPesquisa && (
                    <p className="text-xs text-slate-400 italic line-clamp-2 pl-2 border-l border-slate-800">
                      &ldquo;{prop.perguntaPesquisa}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-900/50">
                  <span className="text-[10px] text-slate-500">{prop.orientando.email}</span>
                  <form action={aprovarProjeto.bind(null, prop.id, prop.orientandoId)}>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Aprovar Proposta
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Projetos Ativos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-200">Projetos de Pesquisa</h2>
          </div>

          {projetosAtivos.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center space-y-4">
              <GraduationCap className="h-12 w-12 text-slate-650" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-300">Nenhum projeto de pesquisa ativo.</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  Cadastre um projeto na coluna ao lado ou aguarde o envio de propostas pelos alunos para inicializar as timelines de marcos.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {projetosAtivos.map((proj) => {
                // Ler a situação do cronograma registrado na ata mais recente
                const ultimaReuniao = proj.reunioes[0];
                const situacaoAta = ultimaReuniao?.situacaoCronograma; // VERDE | AMARELO | VERMELHO

                // Verificar se este projeto tem algum marco atrasado
                const temAtrasado = proj.marcos.some(
                  (m) => m.status === 'A_FAZER' && new Date(m.dataPrevista) < hoje
                );

                let statusColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
                let statusText = 'Em dia';

                if (situacaoAta === 'VERMELHO' || (!situacaoAta && temAtrasado)) {
                  statusColor = 'bg-red-500/10 border-red-500/20 text-red-400';
                  statusText = 'Crítico';
                } else if (situacaoAta === 'AMARELO') {
                  statusColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                  statusText = 'Atenção';
                }

                return (
                  <div key={proj.id} className="glass p-6 rounded-2xl border border-slate-900/60 hover:border-indigo-500/20 transition-all duration-300 flex flex-col justify-between space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${statusColor}`}>
                            {statusText}
                          </span>
                          <span className="text-xs font-semibold text-indigo-400">
                            {proj.nivel} — {proj.programa || 'Geral'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-200 hover:text-indigo-300 transition-colors line-clamp-1">
                          {proj.titulo}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Orientando: <span className="font-semibold text-slate-300">{proj.orientando.nome}</span>
                        </p>
                      </div>

                      <Link
                        href={`/orientador/alunos/${proj.orientandoId}`}
                        className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-all cursor-pointer"
                        title="Ver progresso do aluno"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                    </div>

                    {proj.perguntaPesquisa && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 border-l border-slate-800 pl-3">
                        "{proj.perguntaPesquisa}"
                      </p>
                    )}

                    {/* Barra de Progresso dos Marcos */}
                    {proj.marcos.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Timeline de Marcos</span>
                          <span>
                            {proj.marcos.filter((m) => m.status === 'CONCLUIDO').length}/{proj.marcos.length} concluídos
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex gap-0.5">
                          {proj.marcos.map((m) => (
                            <div
                              key={m.id}
                              className={`h-full flex-1 ${
                                m.status === 'CONCLUIDO'
                                  ? 'bg-emerald-500'
                                  : new Date(m.dataPrevista) < hoje
                                  ? 'bg-amber-500'
                                  : 'bg-slate-700'
                              }`}
                              title={`${m.titulo}: ${m.status}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alertas Operacionais / Ações Pendentes do Orientador */}
                    {(() => {
                      const secoesPendentes = proj.secoesTexto.filter(s => s.status === 'PENDENTE' && s.conteudo.trim() !== '');
                      const etapaAtiva = proj.etapasProjeto?.find(e => e.statusGate === 'LIBERADO');
                      let aguardandoGate = false;
                      if (etapaAtiva) {
                        const secoesObrigatoriasEtapa = proj.secoesTexto.filter(s => s.etapaProjetoId === etapaAtiva.id && s.obrigatoria);
                        const aprovadas = secoesObrigatoriasEtapa.filter(s => s.status === 'APROVADO');
                        aguardandoGate = secoesObrigatoriasEtapa.length > 0 && aprovadas.length === secoesObrigatoriasEtapa.length;
                      }

                      return (
                        <div className="pt-3 border-t border-slate-900/50 flex flex-wrap items-center gap-2 text-[10px]">
                          {secoesPendentes.length > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md font-bold flex items-center gap-1 animate-pulse">
                              📝 Avaliar: "{secoesPendentes[0].titulo}" (v{secoesPendentes[0].versao})
                            </span>
                          ) : aguardandoGate ? (
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md font-bold flex items-center gap-1">
                              🚪 Fechar Gate: {etapaAtiva?.titulo}
                            </span>
                          ) : (
                            <span className="text-slate-550 italic">
                              Status: Aluno redigindo {proj.secoesTexto.find(s => s.status !== 'APROVADO')?.titulo || 'próximas seções'}.
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Criar Projeto Lateral */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Novo Projeto</h2>

          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-4 mb-2">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <FolderPlus className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-200">Vincular Orientando</h3>
            </div>

            <form action={criarProjeto} className="space-y-4">
              <input type="hidden" name="orientadorId" value={orientadorDb.id} />

              <div className="space-y-1.5">
                <label htmlFor="orientandoId" className="text-xs font-semibold text-slate-400">
                  Aluno Autorizado
                </label>
                <select
                  id="orientandoId"
                  name="orientandoId"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm transition-all outline-none"
                >
                  <option value="">Selecione um aluno...</option>
                  {alunosDisponiveis.map((aluno) => (
                    <option key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="titulo" className="text-xs font-semibold text-slate-400">
                  Título do Trabalho
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  required
                  placeholder="Ex: Análise Comparativa de Algoritmos"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="perguntaPesquisa" className="text-xs font-semibold text-slate-400">
                  Pergunta de Pesquisa Vigente
                </label>
                <textarea
                  id="perguntaPesquisa"
                  name="perguntaPesquisa"
                  placeholder="Ex: Como otimizar o tempo de resposta em redes sem fio?"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="nivel" className="text-xs font-semibold text-slate-400">
                    Nível Acadêmico
                  </label>
                  <select
                    id="nivel"
                    name="nivel"
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm transition-all outline-none"
                  >
                    <option value={NivelProjeto.IC}>IC</option>
                    <option value={NivelProjeto.TCC}>TCC</option>
                    <option value={NivelProjeto.MESTRADO}>Mestrado</option>
                    <option value={NivelProjeto.DOUTORADO}>Doutorado</option>
                    <option value={NivelProjeto.POS_DOC}>Pós-Doc</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="programa" className="text-xs font-semibold text-slate-400">
                    Programa / Curso
                  </label>
                  <input
                    type="text"
                    id="programa"
                    name="programa"
                    placeholder="Ex: PPGI"
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="prazoDefesa" className="text-xs font-semibold text-slate-400">
                  Prazo de Defesa Estimado
                </label>
                <input
                  type="date"
                  id="prazoDefesa"
                  name="prazoDefesa"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Vincular Aluno e Iniciar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
