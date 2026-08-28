import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { ClipboardList, Search, Filter } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AdminProjetosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) redirect('/login');

  const params = await searchParams;
  const query = params.q?.toLowerCase() || '';
  const filtroStatus = params.status || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 50;

  const where: any = {};
  if (query) {
    where.OR = [
      { titulo: { contains: query, mode: 'insensitive' } },
      { orientador: { nome: { contains: query, mode: 'insensitive' } } },
      { orientando: { nome: { contains: query, mode: 'insensitive' } } },
    ];
  }
  if (filtroStatus) where.status = filtroStatus;

  const [total, projetos] = await Promise.all([
    prisma.projetoOrientacao.count({ where }),
    prisma.projetoOrientacao.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        orientador: { select: { id: true, nome: true, email: true } },
        orientando: { select: { id: true, nome: true, email: true } },
        reunioes: { select: { id: true }, take: 1 },
      },
    }),
  ]);

  const statusOptions = ['PROPOSTA', 'EM_ANDAMENTO', 'QUALIFICADO', 'DEFENDIDO', 'TRANCADO'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-indigo-400" />
          Gestão de Projetos
        </h1>
        <p className="text-slate-400 mt-1">{total} projeto(s) cadastrado(s)</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <form className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text" name="q" defaultValue={query}
              placeholder="Buscar por título, orientador ou orientando..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
            />
          </div>
          <select name="status" defaultValue={filtroStatus}
            className="px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-indigo-500/50"
          >
            <option value="">Todos os status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            <Filter className="h-4 w-4 inline mr-1" />Filtrar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/10">
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Orientador</th>
                <th className="px-6 py-4">Orientando</th>
                <th className="px-6 py-4">Nível</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {projetos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Nenhum projeto encontrado.</td></tr>
              ) : (
                projetos.map((p) => {
                  const statusColor: Record<string, string> = {
                    PROPOSTA: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    EM_ANDAMENTO: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    QUALIFICADO: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                    DEFENDIDO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    TRANCADO: 'text-red-400 bg-red-500/10 border-red-500/20',
                  };
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200 max-w-xs truncate">{p.titulo}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="font-medium text-slate-300">{p.orientador.nome}</div>
                        <div className="text-slate-500">{p.orientador.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="font-medium text-slate-300">{p.orientando.nome}</div>
                        <div className="text-slate-500">{p.orientando.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{p.nivel}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColor[p.status] || 'text-slate-400 bg-slate-800'}`}>
                          {p.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/orientador/alunos/${p.orientando.id}`}
                          className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                        >
                          Ver Projeto
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}