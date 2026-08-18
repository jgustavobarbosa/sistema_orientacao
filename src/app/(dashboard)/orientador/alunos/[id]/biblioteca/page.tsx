import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { ArrowLeft, BookOpen, Trash2, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { adicionarLeituraIndicada, removerLeituraIndicada } from '@/app/actions';

interface BibliotecaPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrientadorBibliotecaPage({ params }: BibliotecaPageProps) {
  const session = await getServerSession(authOptions);
  const { id: alunoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR) {
    redirect('/login');
  }

  const aluno = await prisma.usuario.findUnique({
    where: { id: alunoId }
  });

  if (!aluno) {
    redirect('/orientador');
  }

  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: alunoId },
    include: {
      leiturasIndicadas: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!projeto) {
    redirect(`/orientador/alunos/${alunoId}`);
  }

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
        <h1 className="text-3xl font-extrabold tracking-tight">Biblioteca do Orientando</h1>
        <p className="text-slate-400 mt-1">
          Indique livros, artigos, teses ou links de leitura recomendada para <span className="font-semibold text-slate-300">{aluno.nome}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Indicação */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-5">
            <div className="flex items-center gap-3 text-indigo-400">
              <Plus className="h-5 w-5" />
              <h3 className="font-bold text-slate-200 text-sm">Indicar Nova Leitura</h3>
            </div>

            <form action={adicionarLeituraIndicada.bind(null, projeto.id)} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="titulo" className="text-xs font-semibold text-slate-400">Título do Livro/Artigo</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  required
                  placeholder="Ex: Metodologia Científica Aplicada"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="autor" className="text-xs font-semibold text-slate-400">Autor</label>
                <input
                  type="text"
                  id="autor"
                  name="autor"
                  placeholder="Ex: Umberto Eco"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="link" className="text-xs font-semibold text-slate-400">Link Externo (URL)</label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  placeholder="https://exemplo.com/artigo.pdf"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="observacao" className="text-xs font-semibold text-slate-400">Observações / Instruções</label>
                <textarea
                  id="observacao"
                  name="observacao"
                  rows={4}
                  placeholder="Instruções de leitura, foco em qual seção..."
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Salvar Indicação
              </button>
            </form>
          </div>
        </div>

        {/* Listagem de Indicações */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-indigo-400">
              <BookOpen className="h-5 w-5" />
              <h3 className="font-bold text-slate-200">Indicações Ativas</h3>
            </div>

            {projeto.leiturasIndicadas.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">Nenhuma recomendação de leitura cadastrada ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projeto.leiturasIndicadas.map((leitura) => (
                  <div key={leitura.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col justify-between space-y-3 relative group">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-slate-250 leading-tight">{leitura.titulo}</h4>
                        <form action={removerLeituraIndicada.bind(null, leitura.id, projeto.id)}>
                          <button
                            type="submit"
                            className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                            title="Remover indicação"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                      {leitura.autor && (
                        <p className="text-[10px] text-slate-550">Autor: {leitura.autor}</p>
                      )}
                      {leitura.observacao && (
                        <p className="text-xs text-slate-400 leading-relaxed italic">{leitura.observacao}</p>
                      )}
                    </div>

                    {leitura.link && (
                      <a
                        href={leitura.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-bold transition-all mt-auto"
                      >
                        Acessar material
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
