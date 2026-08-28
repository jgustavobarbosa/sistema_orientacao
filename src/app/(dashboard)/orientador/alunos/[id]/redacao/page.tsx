import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { FileText, CheckCircle2, AlertCircle, Clock, ArrowLeft, Send, Sparkles, History } from 'lucide-react';
import Link from 'next/link';
import { revisarSecao, submeterReplicaOrientador, executarAuditoriaIA } from '@/app/actions';
import { GerenciadorItensRevisao } from '@/components/gerenciador-itens-revisao';

interface RevisarRedacaoProps {
  params: Promise<{ id: string }>;
}

export default async function OrientadorRevisarRedacaoPage({ params }: RevisarRedacaoProps) {
  const session = await getServerSession(authOptions);
  const { id: alunoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN) {
    redirect('/login');
  }

  // Buscar aluno e seu projeto de pesquisa
  const aluno = await prisma.usuario.findUnique({
    where: { id: alunoId }
  });

  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: alunoId }
  });

  if (!aluno || !projeto) {
    redirect('/orientador');
  }

  // Buscar todas as seções submetidas pelo aluno com histórico e auditorias
  const secoes = await prisma.secaoTexto.findMany({
    where: { projetoId: projeto.id },
    include: {
      historicoVersoes: {
        orderBy: { versao: 'desc' }
      },
      auditoriasIA: {
        orderBy: { createdAt: 'desc' }
      },
      itensRevisao: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Voltar */}
      <Link
        href={`/orientador/alunos/${alunoId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à página do aluno
      </Link>

      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Revisão de Capítulos</h1>
        <p className="text-slate-400 mt-1">
          Analise a redação submetida por <span className="font-semibold text-slate-300">{aluno.nome}</span>, faça anotações corretivas e aprove ou solicite revisões.
        </p>
      </div>

      {secoes.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-900/60 max-w-xl mx-auto space-y-3">
          <FileText className="h-10 w-10 text-slate-650 mx-auto" />
          <p className="font-semibold text-slate-350">Nenhuma seção textual submetida ainda.</p>
          <p className="text-xs text-slate-500">O orientando ainda não iniciou a escrita das seções estruturadas no portal.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {secoes.map((secao) => (
            <div key={secao.id} className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
              {/* Topo do Card */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-900/50 pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-lg text-slate-200">{secao.titulo}</h3>
                  <p className="text-xs text-slate-550 flex items-center gap-1">
                    Versão {secao.versao} | Atualizado em: {new Date(secao.updatedAt).toLocaleDateString('pt-BR')} às {new Date(secao.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div>
                  {secao.status === 'APROVADO' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Aprovado
                    </span>
                  )}
                  {secao.status === 'REVISAR' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      Revisar
                    </span>
                  )}
                  {secao.status === 'PENDENTE' && secao.conteudo && secao.conteudo.trim().length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
                      <Clock className="h-4 w-4" />
                      Aguardando Revisão
                    </span>
                  )}
                  {secao.status === 'PENDENTE' && (!secao.conteudo || secao.conteudo.trim().length === 0) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-600/10 border border-slate-600/20 text-slate-400">
                      <FileText className="h-4 w-4" />
                      Aguardando Texto
                    </span>
                  )}
                </div>
              </div>

              {/* Corpo de Conteúdo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Texto do Aluno & IA */}
                <div className="space-y-4">
                  {/* Indicador de status do conteúdo */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {secao.conteudo && secao.conteudo.trim().length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {secao.conteudo.length > 500 ? 'Texto longo' : 'Texto curto'} ({secao.conteudo.length} caracteres)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        Sem texto escrito
                      </span>
                    )}
                    {secao.linkAnexo && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <FileText className="h-3 w-3" />
                        Anexo disponível
                      </span>
                    )}
                  </div>

                  {secao.oQueProduzi && (
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-900/60 pb-1.5">Relatório de Produção do Aluno</h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wide">1. O que foi produzido:</span>
                          <p className="text-slate-300 mt-0.5 leading-relaxed">{secao.oQueProduzi}</p>
                        </div>
                        {secao.oQueMudou && (
                          <div>
                            <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wide">2. O que mudou:</span>
                            <p className="text-slate-300 mt-0.5 leading-relaxed">{secao.oQueMudou}</p>
                          </div>
                        )}
                        {secao.ondeTenhoDuvida && (
                          <div>
                            <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wide">3. Dúvidas / Gargalos:</span>
                            <p className="text-slate-300 mt-0.5 leading-relaxed">{secao.ondeTenhoDuvida}</p>
                          </div>
                        )}
                        {secao.oQuePrecisoAvancar && (
                          <div>
                            <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wide">4. Necessidades para avançar:</span>
                            <p className="text-slate-300 mt-0.5 leading-relaxed">{secao.oQuePrecisoAvancar}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {secao.linkAnexo && (
                    <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs rounded-xl space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                        Documento/Planilha Externa de Apoio:
                      </p>
                      <p className="text-[11px] text-slate-350 leading-relaxed">
                        O aluno anexou um documento externo para esta seção. Clique para abrir em nova guia:
                      </p>
                      <a 
                        href={secao.linkAnexo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold underline inline-block mt-1 break-all"
                      >
                        {secao.linkAnexo}
                      </a>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Texto do Aluno:</p>
                    <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl text-sm text-slate-300 leading-relaxed whitespace-pre-line max-h-[350px] overflow-y-auto pr-1">
                      {secao.conteudo}
                    </div>
                  </div>

                  {secao.parecerIA && (
                    <div className="p-4 bg-indigo-950/25 border border-indigo-900/35 rounded-xl space-y-1.5 animate-in fade-in duration-300">
                      <div className="flex items-center gap-1.5 text-indigo-400">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <h4 className="font-bold text-xs">Parecer de IA sobre Revisões (Comparativo):</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        &ldquo;{secao.parecerIA}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Auditoria de IA de Autoria */}
                  <div className="p-4 bg-slate-950/45 border border-slate-900 rounded-xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-indigo-400">
                        <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
                        <h4 className="font-bold text-xs">Auditoria de Autoria (Humano vs. IA)</h4>
                      </div>
                      
                      <form action={executarAuditoriaIA.bind(null, secao.id)}>
                        <button
                          type="submit"
                          className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
                        >
                          Auditar Texto
                        </button>
                      </form>
                    </div>

                    {secao.auditoriasIA.length > 0 ? (
                      <div className="space-y-2 animate-in fade-in duration-300">
                        {(() => {
                          const laudo = secao.auditoriasIA[0];
                          const score = laudo.pontuacao;
                          
                          const colorClass = score >= 60 
                            ? 'text-red-400 border-red-500/20 bg-red-500/5' 
                            : score >= 40 
                              ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' 
                              : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';

                          return (
                            <div className={`p-3 border rounded-lg space-y-1.5 ${colorClass}`}>
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span>{laudo.classificacao}</span>
                                <span>Score IA: {score}/100</span>
                              </div>
                              <p className="text-[10px] leading-relaxed text-slate-305">{laudo.justificativa}</p>
                              <div className="text-[8px] text-slate-500 font-semibold text-right">
                                Laudo gerado em: {new Date(laudo.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-550 italic">Nenhuma auditoria de escrita por IA disparada para este capítulo.</p>
                    )}
                  </div>

                  {/* Gerenciador de Itens de Revisão Granulares */}
                  <GerenciadorItensRevisao secaoId={secao.id} itensInicial={secao.itensRevisao as any} />
                </div>

                {/* Painel de Correções, Réplicas e Status */}
                <div className="space-y-6">
                  {/* Formulário de Avaliação Simples */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Painel do Orientador:</p>
                    
                    <form className="space-y-4">
                      {/* Rubrica 5D */}
                      <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-900/60">Rubrica 5D de Avaliação</h4>
                        
                        <div className="space-y-2.5 text-xs text-slate-300">
                          {/* Pertinência */}
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-slate-400">1. Pertinência</span>
                            <select
                              name="notaPertinencia"
                              defaultValue={secao.notaPertinencia !== null ? secao.notaPertinencia : 2}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-105 text-xs outline-none focus:border-indigo-500/50"
                            >
                              <option value={0}>0 — Inadequado</option>
                              <option value={1}>1 — Insuficiente</option>
                              <option value={2}>2 — Satisfatório</option>
                              <option value={3}>3 — Excelente</option>
                            </select>
                          </div>

                          {/* Coerência */}
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-slate-400">2. Coerência</span>
                            <select
                              name="notaCoerencia"
                              defaultValue={secao.notaCoerencia !== null ? secao.notaCoerencia : 2}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-105 text-xs outline-none focus:border-indigo-500/50"
                            >
                              <option value={0}>0 — Desalinhado</option>
                              <option value={1}>1 — Parcial</option>
                              <option value={2}>2 — Alinhado</option>
                              <option value={3}>3 — Impecável</option>
                            </select>
                          </div>

                          {/* Evidência */}
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-slate-400">3. Evidência</span>
                            <select
                              name="notaEvidencia"
                              defaultValue={secao.notaEvidencia !== null ? secao.notaEvidencia : 2}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-105 text-xs outline-none focus:border-indigo-500/50"
                            >
                              <option value={0}>0 — Sem fontes</option>
                              <option value={1}>1 — Fraca</option>
                              <option value={2}>2 — Consistente</option>
                              <option value={3}>3 — Robusta</option>
                            </select>
                          </div>

                          {/* Clareza */}
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-slate-400">4. Clareza</span>
                            <select
                              name="notaClareza"
                              defaultValue={secao.notaClareza !== null ? secao.notaClareza : 2}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-105 text-xs outline-none focus:border-indigo-500/50"
                            >
                              <option value={0}>0 — Confuso</option>
                              <option value={1}>1 — Regular</option>
                              <option value={2}>2 — Fluido</option>
                              <option value={3}>3 — Acadêmico</option>
                            </select>
                          </div>

                          {/* Conformidade */}
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-semibold text-slate-400">5. Conformidade</span>
                            <select
                              name="notaConformidade"
                              defaultValue={secao.notaConformidade !== null ? secao.notaConformidade : 2}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-105 text-xs outline-none focus:border-indigo-500/50"
                            >
                              <option value={0}>0 — Fora das normas</option>
                              <option value={1}>1 — Com pendências</option>
                              <option value={2}>2 — Conforme</option>
                              <option value={3}>3 — Rigoroso</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-[9px] text-slate-500 italic mt-2">
                          * Nota menor que 2 em qualquer critério rebaixa automaticamente para REVISAR ao submeter.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                                              <label htmlFor="correcoes" className="text-xs font-semibold text-slate-400">
                                                Correções, Comentários e Ajustes
                                              </label>
                                              <textarea
                                                id="correcoes"
                                                name="correcoes"
                                                rows={5}
                                                defaultValue={secao.correcoes || ''}
                                                placeholder="Adicione observações, cortes ou o que reescrever para auxiliar o aluno..."
                                                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none resize-none placeholder:text-slate-800 leading-relaxed"
                                              />
                                            </div>

                      <div className="flex items-center gap-3">
                        <button
                          formAction={revisarSecao.bind(null, secao.id, 'APROVADO')}
                          type="submit"
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Aprovar Capítulo
                        </button>

                        <button
                          formAction={revisarSecao.bind(null, secao.id, 'REVISAR')}
                          type="submit"
                          className="flex-1 py-2.5 bg-red-650 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <AlertCircle className="h-4 w-4" />
                          Solicitar Revisão
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Formulário de Submissão de Réplica Corrigida */}
                  <details className="group border-t border-slate-900/40 pt-4">
                    <summary className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer list-none flex items-center gap-1 select-none outline-none">
                      Submeter Réplica do Texto Corrigido
                    </summary>
                    <form action={submeterReplicaOrientador.bind(null, secao.id)} className="mt-3 space-y-3">
                      <div className="space-y-1.5">
                        <label htmlFor="conteudoReplica" className="text-[10px] font-semibold text-slate-400">
                          Cole aqui o rascunho com seus ajustes manuais
                        </label>
                        <textarea
                          id="conteudoReplica"
                          name="conteudoReplica"
                          rows={6}
                          required
                          defaultValue={secao.conteudo}
                          placeholder="Reescreva ou ajuste o text do aluno..."
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Salvar Nova Versão (Réplica)
                      </button>
                    </form>
                  </details>
                </div>
              </div>

              {/* Histórico de Versões */}
              {secao.historicoVersoes.length > 0 && (
                <details className="group border-t border-slate-900/40 pt-4">
                  <summary className="text-xs font-bold text-slate-400 hover:text-slate-355 cursor-pointer list-none flex items-center gap-1.5 select-none outline-none">
                    <History className="h-4 w-4 shrink-0" />
                    Ver Histórico de Versões Anteriores ({secao.historicoVersoes.length})
                  </summary>
                  <div className="mt-3 space-y-3">
                    {secao.historicoVersoes.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-950/40 border border-slate-900/80 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between text-[10px] text-slate-550 font-semibold">
                          <span>Versão {v.versao} ({v.autorPapel === 'ORIENTANDO' ? 'Aluno' : 'Professor (Réplica)'})</span>
                          <span>{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-line leading-relaxed max-h-[120px] overflow-y-auto pr-1">{v.conteudo}</p>
                        {v.correcoes && (
                          <div className="border-t border-slate-900/40 pt-1.5 mt-1 text-[11px] text-slate-400">
                            <strong>Ajustes Solicitados:</strong> {v.correcoes}
                          </div>
                        )}
                        {v.parecerIA && (
                          <div className="border-t border-slate-900/40 pt-1.5 mt-1 text-[11px] text-indigo-400 italic">
                            <strong>IA Comparadora:</strong> {v.parecerIA}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
