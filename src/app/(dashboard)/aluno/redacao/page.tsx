import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { FileText, CheckCircle2, AlertCircle, Clock, BookOpen, Send, Download, Sparkles } from 'lucide-react';
import { submeterSecao } from '@/app/actions';

export default async function AlunoRedacaoPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  // Buscar o projeto do aluno
  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: session.user.id }
  });

  if (!projeto) {
    redirect('/aluno');
  }

  // Buscar todas as seções de texto submetidas com histórico e auditorias
  const secoes = await prisma.secaoTexto.findMany({
    where: { projetoId: projeto.id },
    include: {
      historicoVersoes: {
        orderBy: { versao: 'desc' }
      },
      auditoriasIA: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  // Juntar apenas as seções que já foram marcadas como APROVADO
  const secoesAprovadas = secoes
    .filter(s => s.status === 'APROVADO')
    .sort((a, b) => a.titulo.localeCompare(b.titulo)); // Ordenação básica por título

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Redação de Capítulos</h1>
        <p className="text-slate-400 mt-1">
          Submeta as seções da sua pesquisa para avaliação do orientador. Os trechos aprovados serão consolidados no seu Dossiê Acadêmico final.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Submissão de Capítulo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                <Send className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-200">Submeter Capítulo</h3>
            </div>

            <form action={submeterSecao.bind(null, projeto.id)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="titulo" className="text-xs font-semibold text-slate-400">
                  Estrutura / Título do Capítulo
                </label>
                <select
                  id="titulo"
                  name="titulo"
                  required
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
                >
                  <option value="1. Introdução e Delimitação">1. Introdução e Delimitação</option>
                  <option value="2. Referencial Teórico">2. Referencial Teórico</option>
                  <option value="3. Metodologia da Pesquisa">3. Metodologia da Pesquisa</option>
                  <option value="4. Resultados e Análise">4. Resultados e Análise</option>
                  <option value="5. Considerações Finais / Dossiê">5. Considerações Finais / Dossiê</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="conteudo" className="text-xs font-semibold text-slate-400">
                  Conteúdo do Capítulo (Texto Completo)
                </label>
                <textarea
                  id="conteudo"
                  name="conteudo"
                  required
                  rows={10}
                  placeholder="Escreva ou cole aqui a redação completa desta seção para que o orientador faça as correções..."
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-650 outline-none resize-none font-mono leading-relaxed"
                />
              </div>

              {/* Protocolo de 4 blocos */}
              <div className="border-t border-slate-900/40 pt-4 space-y-3.5">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Protocolo de Submissão</h4>
                
                <div className="space-y-1">
                  <label htmlFor="oQueProduzi" className="text-[10px] text-slate-400 block font-semibold">1. O que produzi nesta versão?</label>
                  <input
                    type="text"
                    id="oQueProduzi"
                    name="oQueProduzi"
                    required
                    placeholder="ex: Redigi os parágrafos sobre delimitação espacial..."
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="oQueMudou" className="text-[10px] text-slate-400 block font-semibold">2. O que mudou em relação à versão anterior?</label>
                  <input
                    type="text"
                    id="oQueMudou"
                    name="oQueMudou"
                    placeholder="ex: Ajustei a hipótese C baseado no feedback..."
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ondeTenhoDuvida" className="text-[10px] text-slate-400 block font-semibold">3. Onde tenho dúvida ou gargalo?</label>
                  <input
                    type="text"
                    id="ondeTenhoDuvida"
                    name="ondeTenhoDuvida"
                    placeholder="ex: Profundidade da revisão sistemática..."
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="oQuePrecisoAvancar" className="text-[10px] text-slate-400 block font-semibold">4. O que preciso para avançar?</label>
                  <input
                    type="text"
                    id="oQuePrecisoAvancar"
                    name="oQuePrecisoAvancar"
                    placeholder="ex: Feedback metodológico..."
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-650/10 cursor-pointer"
              >
                Enviar para Avaliação
              </button>
            </form>
          </div>
        </div>

        {/* Dossiê Consolidado & Histórico */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dossiê Consolidado de Partes Aprovadas */}
          <div className="glass p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/5 to-slate-950 space-y-4 shadow-lg shadow-indigo-500/5">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-slate-200">Dossiê Acadêmico Consolidado</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-md">
                {secoesAprovadas.length} parte(s) unida(s)
              </span>
            </div>

            {secoesAprovadas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Nenhum capítulo foi aprovado pelo orientador ainda. Os trechos aparecerão unidos aqui conforme forem validados.
              </p>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {secoesAprovadas.map((secao) => (
                  <details key={secao.id} className="group border border-slate-900/60 bg-slate-950/50 rounded-xl overflow-hidden">
                    <summary className="px-4 py-3 text-xs font-bold text-slate-250 hover:text-indigo-400 cursor-pointer select-none transition-colors flex items-center justify-between">
                      <span>{secao.titulo}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold group-open:hidden">Expandir Conteúdo</span>
                    </summary>
                    <div className="px-4 pb-4 pt-2 border-t border-slate-900/50 text-xs text-slate-350 leading-relaxed whitespace-pre-line bg-slate-950/20">
                      {secao.conteudo}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          {/* Histórico e Correções */}
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-900/60 bg-slate-900/10">
              <h3 className="font-bold text-slate-200 text-sm">Histórico de Envios & Correções</h3>
            </div>

            {secoes.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">Nenhum capítulo submetido para revisão.</p>
            ) : (
              <div className="divide-y divide-slate-900/40">
                {secoes.map((secao) => (
                  <div key={secao.id} className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-250">{secao.titulo}</h4>
                        <p className="text-[10px] text-slate-550 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Versão {secao.versao} | Atualizado em: {new Date(secao.updatedAt).toLocaleDateString('pt-BR')} às {new Date(secao.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div>
                        {secao.status === 'APROVADO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Aprovado
                          </span>
                        )}
                        {secao.status === 'REVISAR' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                            <AlertCircle className="h-3 w-3" />
                            Revisar
                          </span>
                        )}
                        {secao.status === 'PENDENTE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Clock className="h-3 w-3" />
                            Aguardando Orientador
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-slate-400">Meu Texto Submetido:</p>
                      <p className="text-xs text-slate-500 line-clamp-3 whitespace-pre-line leading-relaxed italic">
                        "{secao.conteudo}"
                      </p>
                    </div>

                    {secao.auditoriasIA.length > 0 && (
                      <div className="p-4 bg-indigo-950/15 border border-indigo-900/25 rounded-xl space-y-2 animate-in fade-in duration-200">
                        {(() => {
                          const laudo = secao.auditoriasIA[0];
                          const score = laudo.pontuacao;
                          
                          const colorClass = score >= 60 
                            ? 'text-red-400 border-red-500/20 bg-red-500/5' 
                            : score >= 40 
                              ? 'text-amber-400 border-amber-500/20 bg-amber-500/5' 
                              : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';

                          return (
                            <div className="space-y-1.5">
                              <p className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                                Auditoria de Autoria (Laudo de IA):
                              </p>
                              <div className={`p-2.5 border rounded-lg space-y-1 ${colorClass}`}>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span>{laudo.classificacao}</span>
                                  <span>Score IA: {score}/100</span>
                                </div>
                                <p className="text-[10px] leading-relaxed text-slate-350">{laudo.justificativa}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {secao.correcoes && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1">
                        <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Correções e Observações do Orientador:
                        </p>
                        <p className="text-xs text-slate-350 whitespace-pre-line leading-relaxed font-medium">
                          {secao.correcoes}
                        </p>
                      </div>
                    )}

                    {/* Histórico de Versões e Réplicas */}
                    {secao.historicoVersoes.length > 0 && (
                      <details className="group border-t border-slate-900/45 pt-3 mt-3">
                        <summary className="text-[10px] font-bold text-slate-450 hover:text-slate-300 cursor-pointer list-none flex items-center gap-1.5 select-none outline-none">
                          Ver Histórico de Versões Anteriores ({secao.historicoVersoes.length})
                        </summary>
                        <div className="mt-2 space-y-2">
                          {secao.historicoVersoes.map((v) => (
                            <div key={v.id} className="p-2.5 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1.5 text-[11px]">
                              <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                                <span>Versão {v.versao} — {v.autorPapel === 'ORIENTANDO' ? 'Minha Versão' : 'Professor (Réplica Corrigida)'}</span>
                                <span>{new Date(v.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <p className="text-slate-355 whitespace-pre-line leading-relaxed max-h-[100px] overflow-y-auto pr-1">{v.conteudo}</p>
                              {v.correcoes && (
                                <div className="border-t border-slate-900/40 pt-1 mt-1 text-[10px] text-slate-400">
                                  <strong>Ajustes Solicitados:</strong> {v.correcoes}
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
        </div>
      </div>
    </div>
  );
}
