import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { Shield, Users, ClipboardList, FileText, AlertTriangle } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) redirect('/login');

  const stats = {
    totalUsuarios: await prisma.usuario.count(),
    orientadores: await prisma.usuario.count({ where: { papel: PapelUsuario.ORIENTADOR } }),
    orientandos: await prisma.usuario.count({ where: { papel: PapelUsuario.ORIENTANDO } }),
    projetosAtivos: await prisma.projetoOrientacao.count({ where: { status: 'EM_ANDAMENTO' } }),
    projetosTotal: await prisma.projetoOrientacao.count(),
    logsHoje: await prisma.sistemaLog.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    errosRecentes: await prisma.sistemaLog.count({
      where: { severidade: { in: ['ERRO', 'CRITICO'] }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
  };

  const recentLogs = await prisma.sistemaLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { usuario: { select: { nome: true, email: true } } },
  });

  const cards = [
    { label: 'Usuários', value: stats.totalUsuarios, sub: `${stats.orientadores} orient. · ${stats.orientandos} alunos`, icon: Users, color: 'blue' },
    { label: 'Projetos', value: stats.projetosTotal, sub: `${stats.projetosAtivos} em andamento`, icon: ClipboardList, color: 'emerald' },
    { label: 'Logs (24h)', value: stats.logsHoje, sub: `${stats.errosRecentes} erros/7d`, icon: FileText, color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8 text-indigo-400" />
          Painel Administrativo
        </h1>
        <p className="text-slate-400 mt-1">Visão geral do sistema SOIA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const colorMap: Record<string, string> = { blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400', emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
          return (
            <div key={card.label} className="glass p-6 rounded-2xl border border-slate-900/60">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl border ${colorMap[card.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-100">{card.value}</p>
              <p className="text-sm font-bold text-slate-400 mt-1">{card.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-200">Atividade Recente</h3>
          <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
            Últimos 10 eventos
          </span>
        </div>
        {recentLogs.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-500">
            <FileText className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento registrado ainda.</p>
          </div>
        ) : (
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
                {recentLogs.map((log) => {
                  const sevColor: Record<string, string> = { INFO: 'text-blue-400', AVISO: 'text-amber-400', ERRO: 'text-red-400', CRITICO: 'text-red-500' };
                  return (
                    <tr key={log.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-3 text-xs text-slate-500">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
                          {log.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`font-semibold text-xs ${sevColor[log.severidade] || 'text-slate-400'}`}>
                          {log.severidade}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400">
                        {log.usuario?.nome || log.usuario?.email || '-'}
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-300 max-w-xs truncate">
                        {log.mensagem}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}