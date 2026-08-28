import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { FileText, Calendar, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

export default async function HistoricoAtasPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN) {
    redirect('/login');
  }

  // Buscar todas as reuniões dos projetos deste orientador
  const reunioes = await prisma.reuniao.findMany({
    where: {
      projeto: {
        orientador: { email: session.user.email!.toLowerCase() }
      }
    },
    include: {
      projeto: {
        include: { orientando: true }
      }
    },
    orderBy: {
      dataHoraInicio: 'desc'
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Histórico de Atas</h1>
        <p className="text-slate-400 mt-1">
          Lista completa de todos os encontros de orientação registrados no sistema.
        </p>
      </div>

      {reunioes.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl border border-slate-900/60 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto">
          <FileText className="h-12 w-12 text-slate-650" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">Nenhuma ata registrada.</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Ao registrar encontros de orientação a partir do progresso de seus alunos, elas serão listadas e armazenadas aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
          <div className="divide-y divide-slate-900/40">
            {reunioes.map((reuniao) => (
              <Link
                key={reuniao.id}
                href={`/orientador/reunioes/${reuniao.id}`}
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
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-400">
                        <User className="h-3.5 w-3.5 text-slate-600" />
                        {reuniao.projeto.orientando.nome}
                      </span>
                      <span className="text-slate-700">|</span>
                      <span>Projeto: {reuniao.projeto.titulo}</span>
                    </div>
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
        </div>
      )}
    </div>
  );
}
