import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

export default async function AlunoBibliotecaPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: session.user.id },
    include: {
      orientador: true,
      leiturasIndicadas: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!projeto) {
    redirect('/aluno');
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Minha Biblioteca</h1>
        <p className="text-slate-400 mt-1">
          Materiais, artigos e livros indicados pelo seu orientador <span className="font-semibold text-slate-350">{projeto.orientador.nome}</span> para acelerar sua pesquisa.
        </p>
      </div>

      <div className="glass p-8 rounded-2xl border border-slate-900/60 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-900/60 pb-4 text-indigo-400">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-lg font-bold text-slate-200">Indicações e Leituras Recomendadas</h2>
        </div>

        {projeto.leiturasIndicadas.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-2">
            <p className="font-semibold text-slate-400">Nenhuma indicação ativa ainda.</p>
            <p className="text-xs text-slate-500">
              Converse com seu orientador no próximo encontro para definir artigos ou livros basilares para sua fundamentação.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projeto.leiturasIndicadas.map((leitura) => (
              <div
                key={leitura.id}
                className="p-5 bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-black/20 transition-all duration-300 group"
              >
                <div className="space-y-2">
                  <span className="text-[9px] font-bold px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full uppercase tracking-wider">
                    Recomendado
                  </span>
                  <h3 className="font-bold text-base text-slate-200 leading-snug group-hover:text-indigo-400 transition-colors">
                    {leitura.titulo}
                  </h3>
                  {leitura.autor && (
                    <p className="text-[11px] text-slate-550 font-medium">Autor: {leitura.autor}</p>
                  )}
                  {leitura.observacao && (
                    <div className="border-t border-slate-900/40 pt-2 mt-2">
                      <p className="text-xs text-slate-400 leading-relaxed italic">&ldquo;{leitura.observacao}&rdquo;</p>
                    </div>
                  )}
                </div>

                {leitura.link && (
                  <a
                    href={leitura.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-350 font-bold transition-all mt-4 pt-2 group/link"
                  >
                    Acessar material de leitura
                    <ArrowRight className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
