import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { FileText, Search, Filter, AlertTriangle, Info, AlertCircle, Skull } from 'lucide-react';

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; sev?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) redirect('/login');

  const params = await searchParams;
  const filtroTipo = params.tipo || '';
  const filtroSev = params.sev || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 100;

  const where: any = {};
  if (filtroTipo) where.tipo = filtroTipo;
  if (filtroSev) where.severidade = filtroSev;

  const [total, logs] = await Promise.all([
    prisma.sistemaLog.count({ where }),
    prisma.sistemaLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: { usuario: { select: { nome: true, email: true } } },
    }),
  ]);

  // Tipos de log disponíveis
  const tiposDisponiveis = await prisma.sistemaLog.groupBy({
    by: ['tipo'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  const sevIcon: Record<string, React.ReactNode> = {
    INFO: <Info className="h-3.5 w-3.5 text-blue-400" />,
    AVISO: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />,
    ERRO: <AlertCircle className="h-3.5 w-3.5 text-red-400" />,
    CRITICO: <Skull className="h-3.5 w-3.5 text-red-500" />,
  };

  const sevColor: Record<string, string> = {
    INFO: 'text-blue-400', AVISO: 'text-amber-400', ERRO: 'text-red-400', CRITICO: 'text-red-500 font-bold',
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-400" />
            Logs do Sistema
          </h1>
          <p className="text-slate-400 mt-1">{total} registro(s) no total</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiposDisponiveis.slice(0, 8).map((t) => (
          <div key={t.tipo} className="glass px-4 py-3 rounded-xl border border-slate-900/60">
            <div className="text-xs font-semibold text-slate-400">{t.tipo}</div>
            <div className="text-lg font-extrabold text-slate-100">{t._count.id}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <form className="flex-1 flex gap-3 flex-wrap">
          <select name="tipo" defaultValue={filtroTipo}
            className="px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-indigo-500/50"
          >
            <option value="">Todos os tipos</option>
            {tiposDisponiveis.map((t) => (
              <option key={t.tipo} value={t.tipo}>{t.tipo} ({t._count.id})</option>
            ))}
          </select>
          <select name="sev" defaultValue={filtroSev}
            className="px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-indigo-500/50"
          >
            <option value="">Todas severidades</option>
            <option value="INFO">INFO</option>
            <option value="AVISO">AVISO</option>
            <option value="ERRO">ERRO</option>
            <option value="CRITICO">CRÍTICO</option>
          </select>
          <button type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            <Filter className="h-4 w-4 inline mr-1" />Filtrar
          </button>
        </form>
      </div>

      {/* Tabela de Logs */}
      <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/10">
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Severidade</th>
                <th className="px-6 py-3">Usuário</th>
                <th className="px-6 py-3">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Nenhum log encontrado.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
                        {log.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5">
                        {sevIcon[log.severidade] || <Info className="h-3.5 w-3.5 text-slate-500" />}
                        <span className={`text-xs ${sevColor[log.severidade] || 'text-slate-400'}`}>
                          {log.severidade}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-400">
                      {log.usuario?.nome || log.usuario?.email || '-'}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-300 max-w-md">
                      <div className="truncate" title={log.mensagem}>{log.mensagem}</div>
                      {log.metadata && (
                        <details className="mt-1">
                          <summary className="text-[10px] text-slate-600 cursor-pointer hover:text-slate-500">
                            Detalhes
                          </summary>
                          <pre className="mt-1 text-[10px] text-slate-500 bg-slate-950/50 p-2 rounded overflow-x-auto max-w-sm">
                            {JSON.stringify(log.metadata, null, 1)}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/logs?tipo=${filtroTipo}&sev=${filtroSev}&page=${p}`}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                p === page
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}